// スライドの HTML を Chromium で描き、各要素の位置と書式を読み取って
// PowerPoint の部品（テキストボックス・表・図形）として置き直す。
// グラフ（svg）と数式（img）だけは画像にする。
const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const pptxgen = require('pptxgenjs');

const D = process.argv[2];                 // elefan_deck フォルダ
const OUT = process.argv[3] || 'raw_edit.pptx';
const deck = JSON.parse(fs.readFileSync(path.join(D, 'project/deck.json')));
const N = JSON.parse(fs.readFileSync('narration.json'));
const PX = 144;                            // 1 インチ = 144 px（1920 px = 13.333 in）
const PT = 0.5;                            // 1 px = 0.5 pt
const FONT = 'BIZ UDPGothic', MONO = 'BIZ UDGothic';

const head = fs.readFileSync('render_head.html', 'utf8');
const hex = c => {
  const m = (c || '').match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  if (m[4] !== undefined && parseFloat(m[4]) === 0) return null;
  return [m[1], m[2], m[3]].map(v => Math.round(+v).toString(16).padStart(2, '0')).join('').toUpperCase();
};

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = deck.title + '（ナレーション付き）';
  pptx.author = 'Matsuishi Takashi Fritz';
  pptx.theme = { headFontFace: FONT, bodyFontFace: FONT, lang: 'ja-JP' };
  fs.mkdirSync('shots', { recursive: true });

  for (const [si, id] of deck.order.entries()) {
    let s = fs.readFileSync(path.join(D, `project/slides/${id}.html`), 'utf8');
    s = s.replace(/\/_blob\/([0-9a-f]+)/g, (m, b) => `blob_${b}.svg`);
    fs.writeFileSync(`render/${id}.html`, head + s + '</body></html>');
    await page.goto('file://' + path.resolve(`render/${id}.html`));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);

    const info = await page.evaluate(() => {
      const sec = document.querySelector('section'); const S = sec.getBoundingClientRect();
      const box = el => { const r = el.getBoundingClientRect(); return { x: r.left - S.left, y: r.top - S.top, w: r.width, h: r.height }; };
      const out = []; let shot = 0;
      const runsOf = el => {
        const runs = [];
        const walk = (node) => {
          for (const n of node.childNodes) {
            if (n.nodeType === 3) {
              const t = n.textContent.replace(/[ \t\r\n]+/g, ' ');
              if (t) { const cs = getComputedStyle(n.parentElement);
                runs.push({ text: t, bold: parseInt(cs.fontWeight) >= 600, italic: cs.fontStyle === 'italic', color: cs.color }); }
            } else if (n.nodeName === 'BR') runs.push({ br: true });
            else if (n.nodeType === 1) walk(n);
          }
        };
        walk(el);
        // 段落の先頭・末尾の空白を落とす
        if (runs.length && runs[0].text) runs[0].text = runs[0].text.replace(/^ /, '');
        const last = runs[runs.length - 1]; if (last && last.text) last.text = last.text.replace(/ $/, '');
        return runs;
      };
      const visit = el => {
        const tag = el.tagName.toLowerCase(); const cs = getComputedStyle(el);
        if (tag === 'aside') return;
        if (tag === 'svg' || tag === 'img') { el.setAttribute('data-shot', shot); out.push({ type: 'image', shot: shot++, ...box(el) }); return; }
        if (tag === 'table') {
          const rows = [...el.querySelectorAll('tr')].map(tr => {
            const tcs = getComputedStyle(tr);
            return { bg: tcs.backgroundColor, cells: [...tr.children].map(td => { const c = getComputedStyle(td);
              return { text: td.textContent.trim(), ...box(td), bold: parseInt(c.fontWeight) >= 600, color: c.color, bg: c.backgroundColor,
                       align: c.textAlign, size: parseFloat(c.fontSize), pl: parseFloat(c.paddingLeft), pt: parseFloat(c.paddingTop) }; }) };
          });
          out.push({ type: 'table', ...box(el), rows, font: getComputedStyle(el).fontFamily }); return;
        }
        const bg = cs.backgroundColor, bt = parseFloat(cs.borderTopWidth) || 0;
        const rad = parseFloat(cs.borderTopLeftRadius) || 0;
        if (['p', 'h1', 'h2', 'h3'].includes(tag)) {
          out.push({ type: 'text', ...box(el), runs: runsOf(el), size: parseFloat(cs.fontSize),
            lh: cs.lineHeight === 'normal' ? parseFloat(cs.fontSize) * 1.2 : parseFloat(cs.lineHeight),
            align: cs.textAlign, font: cs.fontFamily, bg, rad, ls: parseFloat(cs.letterSpacing) || 0,
            pad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(parseFloat) });
          return;
        }
        if (tag === 'div') out.push({ type: 'rect', ...box(el), bg, rad, bt, btc: cs.borderTopColor });
        for (const c of el.children) visit(c);
      };
      for (const c of sec.children) visit(c);
      return { bg: getComputedStyle(sec).backgroundColor, items: out };
    });

    const slide = pptx.addSlide();
    slide.background = { color: hex(info.bg) || 'FBFAF6' };
    for (const it of info.items) {
      const pos = { x: it.x / PX, y: it.y / PX, w: it.w / PX, h: it.h / PX };
      if (it.type === 'rect') {
        const fill = hex(it.bg);
        if (fill) slide.addShape(it.rad > 0 ? pptx.ShapeType.roundRect : pptx.ShapeType.rect,
          { ...pos, fill: { color: fill }, line: { type: 'none' }, rectRadius: it.rad > 0 ? it.rad / PX : undefined });
        if (it.bt > 0) slide.addShape(pptx.ShapeType.rect,
          { x: pos.x, y: pos.y, w: pos.w, h: it.bt / PX, fill: { color: hex(it.btc) }, line: { type: 'none' } });
      } else if (it.type === 'image') {
        const f = `shots/${String(si + 1).padStart(2, '0')}_${it.shot}.png`;
        await page.locator(`[data-shot="${it.shot}"]`).screenshot({ path: f });
        slide.addImage({ path: f, ...pos });
      } else if (it.type === 'text') {
        const fill = hex(it.bg);
        const mono = /UDGothic/.test(it.font) && !/UDPGothic/.test(it.font);
        const runs = [];
        it.runs.forEach((r, k) => {
          if (r.br) { if (runs.length) runs[runs.length - 1].options.breakLine = true; else runs.push({ text: '', options: { breakLine: true } }); return; }
          runs.push({ text: r.text, options: { bold: r.bold, italic: r.italic, color: hex(r.color) } });
        });
        if (fill) slide.addShape(it.rad > 0 ? pptx.ShapeType.roundRect : pptx.ShapeType.rect,
          { ...pos, fill: { color: fill }, line: { type: 'none' }, rectRadius: it.rad > 0 ? it.rad / PX : undefined });
        slide.addText(runs, { ...pos, w: pos.w + 20 / PX, fontFace: mono ? MONO : FONT, fontSize: it.size * PT,
          lineSpacing: it.lh * PT, align: ['center', 'right'].includes(it.align) ? it.align : 'left', valign: 'top',
          margin: it.pad.map(v => v * PT), charSpacing: it.ls * PT, isTextBox: true, fit: 'none', lang: 'ja-JP',
          paraSpaceBefore: 0, paraSpaceAfter: 0,
          wrap: !(it.runs.every(r => !r.br) && it.h - it.pad[0] - it.pad[2] < it.lh * 1.5) });   // 1 行の文字は折り返さない
      } else if (it.type === 'table') {
        const r0 = it.rows[0].cells;
        const rows = it.rows.map(tr => tr.cells.map(c => ({ text: c.text, options: {
          bold: c.bold, color: hex(c.color), fill: { color: hex(c.bg) || hex(tr.bg) || hex(info.bg) },
          align: ['center', 'right'].includes(c.align) ? c.align : 'left', valign: 'middle',
          fontSize: c.size * PT, fontFace: FONT, margin: [c.pt * PT, c.pl * PT, c.pt * PT, c.pl * PT],
          border: [{ type: 'none' }, { type: 'none' }, { pt: 0.75, color: 'C9D3DD' }, { type: 'none' }] } })));
        slide.addTable(rows, { x: pos.x, y: pos.y, w: pos.w, colW: r0.map(c => c.w / PX),
          rowH: it.rows.map(tr => tr.cells[0].h / PX), autoPage: false });
      }
    }
    slide.addMedia({ type: 'audio', path: `audio/s${String(si + 1).padStart(2, '0')}.mp3`, x: 13.5, y: 6.9, w: 0.5, h: 0.5 });
    slide.addNotes(N[si].join('\n\n'));
    console.log(si + 1, id, info.items.length, 'items');
  }
  await browser.close();
  await pptx.writeFile({ fileName: OUT });
  console.log('wrote', OUT);
})();
