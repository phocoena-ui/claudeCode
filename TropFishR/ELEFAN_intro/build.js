const fs = require('fs');
const pptxgen = require('pptxgenjs');
const N = JSON.parse(fs.readFileSync('narration.json'));
const imgs = fs.readdirSync('img').filter(f => f.endsWith('.png')).sort();
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';            // 13.333 x 7.5 in
pptx.title = 'はじめての ELEFAN（ナレーション付き）';
pptx.author = 'Matsuishi Takashi Fritz';
imgs.forEach((f, i) => {
  const s = pptx.addSlide();
  s.background = { color: 'FBFAF6' };
  s.addImage({ path: 'img/' + f, x: 0, y: 0, w: 13.333, h: 7.5 });
  s.addMedia({ type: 'audio', path: `audio/s${String(i + 1).padStart(2, '0')}.mp3`, x: 13.5, y: 6.9, w: 0.5, h: 0.5 });
  s.addNotes(N[i].join('\n\n'));
});
pptx.writeFile({ fileName: 'raw.pptx' }).then(f => console.log('wrote', f));
