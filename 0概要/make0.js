// 水産資源学 ガイダンス・はじめに (2026) — 16:9 編集可能スライド
// デザインは第1章 v5（make2.js）と共通。生成後に post.py で日本語禁則（lang=ja-JP，p:kinsoku）を付与する
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const gi = require("react-icons/gi");

const ASSETS = path.join(__dirname, "..", "assets");
const asset = (f) => { const p = path.join(ASSETS, f); return fs.existsSync(p) ? p : null; };
// 画像の代替テキスト（ファイルの場所ではなく中身を書く）
const ALT = {
  "tb_cover.jpg": "松石 隆『水産資源学［二訂版］』の表紙", "engan_cover.jpg": "片山知史・松石 隆『沿岸資源調査法』の表紙",
  "miyabe_cover.jpg": "芳山 拓『釣りがつなぐ希少魚の保全と地域振興』の表紙", "kujira_cover.jpg": "松石 隆『出動！イルカ・クジラ110番』の表紙",
  "qr_tb.png": "指定教科書（楽天ブックス）へのQRコード", "qr_engan.png": "『沿岸資源調査法』（楽天ブックス）へのQRコード",
  "qr_miyabe.png": "『釣りがつなぐ希少魚の保全と地域振興』（楽天ブックス）へのQRコード", "qr_kujira.png": "『出動！イルカ・クジラ110番』（楽天ブックス）へのQRコード",
  "last.jpg": "函館山からの夜景",
};
const alt = (p) => ALT[path.basename(p)] || "";

// ---------- palette（第1章と同じ） ----------
const NAVY = "0E3B4F";   // 深海（主色）
const TEAL = "1A8F8A";   // 補助
const MINT = "E3F4F1";   // カード背景
const CORAL = "FF7A59";  // アクセント
const CORAL_T = "D9573A"; // 珊瑚色の文字用
const SKY_T = "3D7EA6";  // 水色の文字用
const GRAYBAR = "B8C4C9";
const INK = "1F2D33";
const MUTED = "5B6B73";
const WHITE = "FFFFFF";
const FONT = "BIZ UDPGothic";
const LOGO = "マキナス 4 Square"; // 表紙の「水産資源学」（旧スライドと同じ書体）
const NUM = "Arial";

async function icon(name, color, size = 256) {
  const lib = name.startsWith("Gi") ? gi : fa;
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(lib[name], { color: "#" + color, size: String(size) })
  );
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "松石 隆";
  pres.title = "水産資源学 ガイダンス・はじめに 2026";
  pres.theme = { headFontFace: FONT, bodyFontFace: FONT, lang: "ja-JP" };

  let page = 0;
  const SEC = "0 はじめに";

  // ---------- helpers（第1章と同じ） ----------
  const T = (slide, text, o) =>
    slide.addText(text, Object.assign({ isTextBox: true, fontFace: FONT, color: INK, margin: 0, lang: "ja-JP" }, o));

  async function circleIcon(slide, name, x, y, d, bg, fg = WHITE) {
    slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: bg }, line: { color: bg } });
    const p = d * 0.24;
    slide.addImage({ data: await icon(name, fg), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
  }

  function card(slide, x, y, w, h, fill = MINT, shadow = false) {
    const o = { x, y, w, h, fill: { color: fill }, line: { color: fill }, rectRadius: 0.12 };
    if (shadow) o.shadow = { type: "outer", color: "000000", opacity: 0.12, blur: 6, offset: 2, angle: 90 };
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, o);
  }

  function pageNo(s, color = MUTED) {
    T(s, String(page), { x: 12.2, y: 6.98, w: 0.55, h: 0.3, fontSize: 10, color, align: "right", fontFace: NUM });
  }

  function base(section, title, source) {
    const s = pres.addSlide();
    page++;
    s.background = { color: WHITE };
    if (section) T(s, section, { x: 0.6, y: 0.28, w: 8, h: 0.3, fontSize: 12, bold: true, color: TEAL });
    if (title) T(s, title, { x: 0.6, y: 0.58, w: 12.1, h: 0.75, fontSize: 28, bold: true, color: NAVY, valign: "middle" });
    if (source) T(s, "出典：" + source, { x: 0.6, y: 6.98, w: 11.4, h: 0.3, fontSize: 10, color: MUTED });
    pageNo(s);
    return s;
  }

  async function sectionSlide(num, title, question, iconName) {
    const s = pres.addSlide();
    page++;
    s.background = { color: NAVY };
    s.addShape(pres.shapes.OVAL, { x: 9.2, y: -1.2, w: 5.6, h: 5.6, fill: { color: TEAL, transparency: 70 }, line: { color: NAVY, transparency: 100 } });
    s.addShape(pres.shapes.OVAL, { x: 10.8, y: 4.3, w: 3.2, h: 3.2, fill: { color: TEAL, transparency: 80 }, line: { color: NAVY, transparency: 100 } });
    s.addImage({ data: await icon(iconName, "FFFFFF"), x: 10.35, y: 0.95, w: 2.4, h: 2.4, transparency: 20 });
    T(s, num, { x: 0.9, y: 1.7, w: 6, h: 1.6, fontSize: 96, bold: true, color: CORAL, fontFace: NUM });
    T(s, title, { x: 0.9, y: 3.35, w: 9.5, h: 1.0, fontSize: 40, bold: true, color: WHITE });
    T(s, question, { x: 0.9, y: 4.5, w: 9.5, h: 0.6, fontSize: 20, color: "BFE3DF", italic: true });
    pageNo(s, "9FB6BF");
    return s;
  }

  // 番号つきの行（第1章「まとめ」と同じ体裁）
  function numberedRow(s, i, y, head, body, headW = 0, h = 0.95, size = 16) {
    s.addShape(pres.shapes.OVAL, { x: 0.6, y: y + (h - 0.72) / 2, w: 0.72, h: 0.72, fill: { color: i % 2 ? TEAL : NAVY }, line: { color: WHITE } });
    T(s, String(i + 1), { x: 0.6, y: y + (h - 0.72) / 2, w: 0.72, h: 0.72, fontSize: 22, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: NUM });
    if (headW) T(s, head, { x: 1.55, y, w: headW, h, fontSize: 19, bold: true, color: NAVY, valign: "middle" });
    T(s, body, { x: 1.55 + headW, y, w: 11.15 - headW, h, fontSize: size, color: INK, valign: "middle" });
  }

  // 本の表紙（白地の表紙もあるので枠と影をつける）
  function cover(s, file, x, y, h) {
    const p = asset(file);
    if (!p) return 0;
    const ratio = { "tb_cover.jpg": 500 / 700, "engan_cover.jpg": 610 / 866, "miyabe_cover.jpg": 200 / 279, "kujira_cover.jpg": 615 / 865 }[file] || 0.7;
    const w = h * ratio;
    s.addShape(pres.shapes.RECTANGLE, { x: x - 0.02, y: y - 0.02, w: w + 0.04, h: h + 0.04, fill: { color: WHITE }, line: { color: GRAYBAR, width: 0.75 },
      shadow: { type: "outer", color: "000000", opacity: 0.25, blur: 8, offset: 3, angle: 90 } });
    s.addImage({ path: p, altText: alt(p), x, y, w, h });
    return w;
  }

  function qr(s, file, url, x, y, d) {
    const p = asset(file);
    if (p) s.addImage({ path: p, altText: alt(p), x, y, w: d, h: d, hyperlink: { url } });
  }

  // =========================================================
  // 0. 表紙（「水産資源学」をマキナスで）
  {
    const s = pres.addSlide();
    page++;
    s.background = { color: NAVY };
    s.addShape(pres.shapes.OVAL, { x: 7.9, y: -2.2, w: 7.6, h: 7.6, fill: { color: TEAL, transparency: 70 }, line: { color: NAVY, transparency: 100 } });
    s.addShape(pres.shapes.OVAL, { x: -1.6, y: 4.9, w: 4.2, h: 4.2, fill: { color: TEAL, transparency: 80 }, line: { color: NAVY, transparency: 100 } });
    s.addShape(pres.shapes.OVAL, { x: 11.3, y: 5.3, w: 0.9, h: 0.9, fill: { color: CORAL, transparency: 20 }, line: { color: NAVY, transparency: 100 } });
    T(s, "2026", { x: 1.0, y: 1.55, w: 4, h: 0.6, fontSize: 28, bold: true, color: CORAL, fontFace: NUM });
    T(s, "水産資源学", { x: 0.9, y: 2.2, w: 11.5, h: 2.1, fontSize: 120, color: WHITE, fontFace: LOGO, valign: "middle" });
    s.addShape(pres.shapes.LINE, { x: 1.0, y: 4.55, w: 2.4, h: 0, line: { color: CORAL, width: 4 } });
    T(s, "北海道大学 水産科学研究院　松石 隆", { x: 1.0, y: 5.4, w: 8, h: 0.45, fontSize: 18, color: WHITE });
    T(s, "Matsuishi Takashi Fritz", { x: 1.0, y: 5.85, w: 8, h: 0.4, fontSize: 14, color: "9FB6BF", fontFace: NUM });
    s.addNotes("「水産資源学」はマキナス 4 Square。このフォントが入っていないPCでは別の書体で表示される。");
  }

  // 1. タイトル
  {
    const s = pres.addSlide();
    page++;
    s.background = { color: NAVY };
    s.addShape(pres.shapes.OVAL, { x: 8.3, y: 0.6, w: 6.4, h: 6.4, fill: { color: TEAL, transparency: 65 }, line: { color: NAVY, transparency: 100 } });
    s.addShape(pres.shapes.OVAL, { x: 7.7, y: 4.9, w: 1.4, h: 1.4, fill: { color: CORAL, transparency: 20 }, line: { color: NAVY, transparency: 100 } });
    s.addShape(pres.shapes.OVAL, { x: 12.2, y: 0.5, w: 0.7, h: 0.7, fill: { color: "BFE3DF", transparency: 40 }, line: { color: NAVY, transparency: 100 } });
    s.addImage({ data: await icon("FaBookOpen", "FFFFFF"), x: 9.6, y: 2.1, w: 3.6, h: 3.6, transparency: 10 });
    T(s, "水産資源学　2026", { x: 0.8, y: 1.3, w: 7, h: 0.5, fontSize: 20, bold: true, color: CORAL });
    T(s, "ガイダンス\nはじめに", { x: 0.8, y: 1.95, w: 7.6, h: 2.4, fontSize: 52, bold: true, color: WHITE, valign: "top" });
    T(s, "水産資源学って何？ この授業で何を学ぶ？", { x: 0.8, y: 4.45, w: 7.6, h: 0.5, fontSize: 20, color: "BFE3DF" });
    T(s, "北海道大学 水産科学研究院　松石 隆", { x: 0.8, y: 5.85, w: 7, h: 0.4, fontSize: 16, color: WHITE });
    T(s, "Matsuishi Takashi Fritz", { x: 0.8, y: 6.25, w: 7, h: 0.4, fontSize: 13, color: "9FB6BF", fontFace: NUM });
    s.addNotes("第1回（10月2日）の前半。ガイダンスと「はじめに」を話し，後半は第1章 水産資源の現状に入る。");
  }

  // 2. 自己紹介
  {
    const s = base("ガイダンス", "自己紹介　松石 隆", null);
    const cols = [
      ["FaUniversity", "所属", NAVY, [
        ["教授", "1964年生"],
        ["海洋生物科学科", ""],
        ["国際食資源学院", "担当"],
      ]],
      ["FaGraduationCap", "経歴", TEAL, [
        ["東京出身", "私立武蔵中学・高校"],
        ["東京大学教養学部", "基礎科学科第二（システム基礎科学）"],
        ["東京大学海洋研究所", "大学院"],
        ["1993年", "北大に着任"],
      ]],
      ["FaMicroscope", "専門", CORAL, [
        ["水産資源学", "東南アジアの漁業管理\nデータ不足下の資源評価"],
        ["鯨類学", "ネズミイルカ\n漂着鯨類"],
      ]],
    ];
    const cw = 3.9, gap = 0.2;
    for (let i = 0; i < 3; i++) {
      const [ic, head, col, rows] = cols[i];
      const x = 0.6 + i * (cw + gap);
      card(s, x, 1.55, cw, 4.35, MINT);
      await circleIcon(s, ic, x + 0.3, 1.8, 0.8, col);
      T(s, head, { x: x + 1.25, y: 1.8, w: 2.4, h: 0.8, fontSize: 22, bold: true, color: col === CORAL ? CORAL_T : NAVY, valign: "middle" });
      let y = 2.85;
      const rh = rows.length > 3 ? 0.72 : rows.length > 2 ? 0.8 : 1.3;
      rows.forEach(([a, b]) => {
        T(s, a, { x: x + 0.3, y, w: cw - 0.5, h: 0.36, fontSize: 16, bold: true, color: NAVY });
        if (b) T(s, b, { x: x + 0.3, y: y + 0.36, w: cw - 0.5, h: rh - 0.4, fontSize: 14, color: INK, valign: "top" });
        y += rh;
      });
    }
    await circleIcon(s, "FaHome", 0.6, 6.12, 0.6, NAVY);
    T(s, [
      { text: "続きはホームページで　", options: { bold: true, color: NAVY } },
      { text: "https://matuisi.main.jp/", options: { color: SKY_T, fontFace: NUM, hyperlink: { url: "https://matuisi.main.jp/" } } },
    ], { x: 1.4, y: 6.07, w: 11.3, h: 0.7, fontSize: 16, valign: "middle" });
    s.addNotes("東京大学教養学部 基礎科学科第二は，学際的なジェネラリストを育てる学科。1987年，農学部水産学科の清水誠先生の水産資源学の授業を聴いたのがこの分野との出会い（教科書「緒言」）。");
  }

  // 3. 章扉
  {
    const s = await sectionSlide("0", "はじめに", "水産資源学って何？", "FaQuestion");
    s.addNotes("教科書では「緒言」（5–7ページ）にあたる。");
  }

  // 4. 水産資源学とは
  {
    const s = base(SEC, "水産資源学とは", "松石 隆『水産資源学［二訂版］』海文堂出版，緒言");
    card(s, 0.6, 1.55, 7.2, 2.55, NAVY);
    await circleIcon(s, "FaFish", 0.95, 1.85, 0.8, CORAL);
    T(s, "ひとことで言うと", { x: 1.95, y: 1.85, w: 5.5, h: 0.8, fontSize: 18, bold: true, color: CORAL, valign: "middle" });
    T(s, "さかなをいつまでも獲り続けられるように，\nさかなの量や漁獲量を調べる学問", { x: 0.95, y: 2.8, w: 6.7, h: 1.15, fontSize: 24, bold: true, color: WHITE, valign: "top" });
    card(s, 0.6, 4.35, 7.2, 2.35, MINT);
    T(s, "かたく言うと", { x: 0.95, y: 4.55, w: 6.5, h: 0.45, fontSize: 18, bold: true, color: TEAL });
    T(s, "資源の持続的有効利用をするための技術，\nおよびその背景にある科学的知見に関する学問である。", { x: 0.95, y: 5.1, w: 6.7, h: 1.3, fontSize: 19, bold: true, color: NAVY, valign: "top" });
    // 英語にはない
    card(s, 8.2, 1.55, 4.5, 5.15, WHITE, true);
    T(s, "「水産資源学」という英語はない", { x: 8.45, y: 1.75, w: 4.1, h: 0.8, fontSize: 18, bold: true, color: CORAL_T, valign: "top" });
    const en = [
      ["Quantitative Fish\nPopulation Dynamics", "資源解析"],
      ["Stock Assessment", "資源評価"],
      ["Fisheries Management", "漁業管理"],
    ];
    en.forEach(([e, j], i) => {
      const y = 2.6 + i * 1.05;
      card(s, 8.45, y, 4.0, 0.9, MINT);
      T(s, e, { x: 8.6, y, w: 2.55, h: 0.9, fontSize: 13, bold: true, color: NAVY, fontFace: NUM, valign: "middle" });
      T(s, j, { x: 11.15, y, w: 1.2, h: 0.9, fontSize: 15, bold: true, color: TEAL, valign: "middle", align: "right" });
    });
    T(s, "どれも水産資源学の一部分しか表さない", { x: 8.45, y: 5.8, w: 4.1, h: 0.7, fontSize: 14, color: INK, valign: "top" });
    s.addNotes("「資源」と聞くと鉱物資源を思い浮かべる人も多い（私もそうだった）。水産資源とは魚介類のこと。英語の3つの言葉はそれぞれ一部分を指すだけで，全体をまとめた学問体系は日本で独自に発展した。");
  }

  // 5. 日本発の学問・社会の期待
  {
    const s = base(SEC, "日本発の学問，そして社会が必要とする学問", "松石 隆『水産資源学［二訂版］』海文堂出版，緒言");
    T(s, "日本発の水産学", { x: 0.6, y: 1.5, w: 6, h: 0.5, fontSize: 20, bold: true, color: NAVY });
    // 教科書刊行の年は第1章 Q3 の答えなので，ここでは出さない
    const jp = [
      ["FaMapMarkerAlt", "北海道から発祥", "1901年，北海道でニシンの水産資源学的研究が始まった", NAVY],
      ["FaBookOpen", "世界に先駆けて教科書が刊行", "『水産資源学』というタイトルの教科書が，世界に先駆けて日本で出版された", CORAL],
      ["FaGlobeAsia", "日本で独自に発展した学問体系", "欧米の手法を取り込みつつ，日本で独自に発展した", TEAL],
    ];
    for (let i = 0; i < jp.length; i++) {
      const y = 2.1 + i * 1.55;
      card(s, 0.6, y, 6.2, 1.4, jp[i][3] === CORAL ? "FFE8E1" : MINT);
      await circleIcon(s, jp[i][0], 0.8, y + 0.3, 0.8, jp[i][3]);
      T(s, jp[i][1], { x: 1.8, y: y + 0.15, w: 4.85, h: 0.5, fontSize: 18, bold: true, color: jp[i][3] === CORAL ? CORAL_T : NAVY, valign: "middle" });
      T(s, jp[i][2], { x: 1.8, y: y + 0.65, w: 4.85, h: 0.65, fontSize: 14, color: INK, valign: "top" });
    }
    // 右：社会のニーズ
    card(s, 7.2, 1.5, 5.5, 5.2, NAVY);
    T(s, "社会的に大きな期待とニーズがある", { x: 7.5, y: 1.7, w: 5.0, h: 0.5, fontSize: 19, bold: true, color: CORAL });
    const nd = [
      ["FaLandmark", "法律が求める", "国連海洋法条約（日本は1996年に批准）と漁業法で，資源評価に基づく管理が義務に"],
      ["FaMicroscope", "水産試験場・水産研究所等で広く研究", "都道府県の水産試験場，水産研究・教育機構，水産庁"],
      ["FaUsers", "人材の養成が急務", "資源評価の対象種は増え続けている"],
    ];
    for (let i = 0; i < nd.length; i++) {
      const y = 2.4 + i * 1.4;
      await circleIcon(s, nd[i][0], 7.5, y, 0.7, i === 2 ? CORAL : TEAL);
      T(s, nd[i][1], { x: 8.4, y: y - 0.02, w: 4.1, h: 0.4, fontSize: 16, bold: true, color: WHITE });
      T(s, nd[i][2], { x: 8.4, y: y + 0.4, w: 4.1, h: 0.85, fontSize: 13, color: "BFE3DF", valign: "top" });
    }
    s.addNotes("多くの学問が欧米からの輸入であるのに対し，水産資源学は欧米の手法を取り込みつつ日本で独自に発展した。1996年の国連海洋法条約批准と同年のTAC法施行以降，資源評価は法律で定められた仕事になった。2018年の漁業法改正（2020年施行）でTAC法は廃止され，MSYベースの資源評価が導入された。詳しくは第1章1.3で。");
  }

  // 6. 到達目標
  {
    const s = base(SEC, "到達目標", null);
    const g = [
      "データ収集，水産資源評価から管理実施に至るまでの漁業管理の全ての過程を科学的に立案できるようになる。",
      "資源量推定の考え方を理解し，必要な情報の収集を立案できるようになる。",
      "漁業管理実施に伴う水産資源の動向を説明できるようになる。",
      "漁業管理方針と種々の条件のもとでの，科学的根拠にもとづいた漁業管理方策を立案できるようになる。",
    ];
    g.forEach((t, i) => numberedRow(s, i, 1.5 + i * 1.1, "", t, 0, 1.0, 19));
    card(s, 0.6, 6.1, 12.1, 0.7, MINT);
    T(s, [
      { text: "キーワード　", options: { bold: true, color: TEAL } },
      { text: "データ収集 → 資源評価 → 管理方策の立案 → 資源の動向", options: { bold: true, color: NAVY } },
    ], { x: 0.9, y: 6.1, w: 11.6, h: 0.7, fontSize: 17, valign: "middle" });
    s.addNotes("シラバスの到達目標。この4つを試験で確認する。");
  }

  // 7. 授業の構成（教科書の章立て）
  {
    const s = base(SEC, "授業の構成：教科書の章立てに沿って進む", "松石 隆『水産資源学［二訂版］』海文堂出版，目次");
    const ch = [
      ["1", "水産資源の現状", "FaGlobeAsia", NAVY],
      ["2", "水産資源とは", "FaFish", TEAL],
      ["3", "資源動態", "FaChartLine", NAVY],
      ["4", "資源量推定", "FaCalculator", TEAL],
      ["5", "漁獲モデル", "GiFishingNet", NAVY],
      ["6", "水産資源管理", "FaBalanceScale", TEAL],
    ];
    const cw = 1.85, gap = 0.2;
    for (let i = 0; i < ch.length; i++) {
      const [n, t, ic, c] = ch[i];
      const x = 0.6 + i * (cw + gap);
      card(s, x, 1.6, cw, 3.1, MINT);
      await circleIcon(s, ic, x + (cw - 0.8) / 2, 1.85, 0.8, c);
      T(s, "第" + n + "章", { x, y: 2.85, w: cw, h: 0.5, fontSize: 18, bold: true, color: MUTED, align: "center" });
      T(s, t, { x: x + 0.05, y: 3.4, w: cw - 0.1, h: 1.0, fontSize: 17, bold: true, color: NAVY, align: "center", valign: "top" });
    }
    const ex = [["プレ試験", "11月13日（金）", CORAL], ["本試験", "11月20日（金）", CORAL], ["鯨類資源について", "11月24日（火）松田純佳", TEAL]];
    ex.forEach(([t, d, c], i) => {
      const x = 0.6 + i * 4.1;
      card(s, x, 5.0, 3.9, 1.6, c === CORAL ? "FFE8E1" : MINT);
      T(s, t, { x: x + 0.3, y: 5.15, w: 3.4, h: 0.6, fontSize: 20, bold: true, color: c === CORAL ? CORAL_T : NAVY, valign: "middle" });
      T(s, d, { x: x + 0.3, y: 5.8, w: 3.4, h: 0.5, fontSize: 15, color: INK });
    });
    s.addNotes("はじめに（緒言）と第1章からスタートし，教科書の順番どおりに第6章まで進む。第3章・第4章はオンデマンド。");
  }

  // 8. 授業計画（2026/10/2版）
  {
    const s = base("ガイダンス", "授業計画", "2026年度 水産資源学授業計画（2026/10/2版）");
    const rows = [
      ["1", "10月 2日（金）", "ガイダンス・はじめに／第1章 水産資源の現状1", "対面"],
      ["2", "10月 6日（火）", "第1章 水産資源の現状2", "対面"],
      ["3", "10月 9日（金）", "第2章 水産資源とは", "対面"],
      ["4", "10月13日（火）", "第3章 資源動態1", "オンデマンド"],
      ["5", "10月16日（金）", "第3章 資源動態2", "オンデマンド"],
      ["6", "10月20日（火）", "第3章 資源動態3", "オンデマンド"],
      ["7", "10月23日（金）", "第4章 資源量推定1", "オンデマンド"],
      ["8", "10月27日（火）", "第4章 資源量推定2", "オンデマンド"],
      ["9", "10月30日（金）", "第5章 漁獲モデル1", "対面"],
      ["10", "11月 6日（金）", "第5章 漁獲モデル2", "対面"],
      ["11", "11月10日（火）", "第6章 水産資源管理", "対面"],
      ["12", "11月13日（金）", "プレ試験", "対面"],
      ["13", "11月17日（火）", "Reading Week", "各自"],
      ["14", "11月20日（金）", "本試験", "対面"],
      ["15", "11月24日（火）", "鯨類資源について（松田純佳）", "対面"],
      ["16", "12月 1日（火）", "Reading Week", "各自"],
    ];
    const hd = (t, al = "center") => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, align: al } });
    const modeColor = { "対面": NAVY, "オンデマンド": CORAL_T, "各自": TEAL };
    const body = rows.map((r, i) => {
      const exam = /試験/.test(r[2]);
      const f = { color: i % 2 ? "F4FAF9" : WHITE };
      return [
        { text: r[0], options: { align: "center", fontFace: NUM, fill: f } },
        { text: r[1], options: { fill: f } },
        { text: r[2], options: { bold: exam, color: exam ? CORAL_T : INK, fill: f } },
        { text: r[3], options: { align: "center", bold: true, color: modeColor[r[3]], fill: f } },
      ];
    });
    s.addTable([[hd("回"), hd("日", "left"), hd("内容", "left"), hd("実施形態")], ...body], {
      x: 0.6, y: 1.45, w: 8.3, colW: [0.6, 1.8, 4.3, 1.6], rowH: 0.305, fontFace: FONT, fontSize: 12, color: INK,
      valign: "middle", margin: [0.02, 0.08, 0.02, 0.08], border: { type: "solid", pt: 0.5, color: "DDE5E8" },
    });
    const info = [
      ["FaClock", "時間", "火曜1時限（8:45〜10:15）\n金曜2時限（10:30〜12:00）"],
      ["FaMapMarkerAlt", "教室・単位", "大講義室　選択必修2単位\n3年次 秋ターム"],
      ["FaLink", "連絡先", "本館318号室\nhttps://bit.ly/2fritz"],
    ];
    for (let i = 0; i < info.length; i++) {
      const y = 1.45 + i * 1.72;
      card(s, 9.2, y, 3.5, 1.55, MINT);
      await circleIcon(s, info[i][0], 9.35, y + 0.15, 0.6, i % 2 ? TEAL : NAVY);
      T(s, info[i][1], { x: 10.1, y: y + 0.15, w: 2.5, h: 0.6, fontSize: 16, bold: true, color: NAVY, valign: "middle" });
      T(s, info[i][2], { x: 9.4, y: y + 0.8, w: 3.2, h: 0.7, fontSize: 13, color: INK, valign: "top" });
    }
    s.addNotes("配布した授業計画と同じ。第3章・第4章（10月13日〜27日）はオンデマンド。日程は変わることがあるので，Moodleの最新版を確認すること。");
  }

  // 9. 授業のやりかた
  {
    const s = base("ガイダンス", "授業のやりかた", null);
    const rows = [
      ["FaBookOpen", "教科書に沿って授業を行う"],
      ["FaLaptop", "一部，オンデマンドで実施（第3章・第4章）"],
      ["FaUpload", "資料等は適宜 Moodle にアップロードする"],
      ["FaPencilAlt", "適宜，小テストを実施"],
      ["FaUserCheck", "欠席届不要。公欠等の対応は行わない"],
    ];
    for (let i = 0; i < rows.length; i++) {
      const y = 1.6 + i * 1.0;
      await circleIcon(s, rows[i][0], 0.6, y, 0.75, i % 2 ? TEAL : NAVY);
      T(s, rows[i][1], { x: 1.6, y, w: 6.2, h: 0.75, fontSize: 19, color: INK, valign: "middle" });
    }
    card(s, 8.2, 1.6, 4.5, 4.85, NAVY);
    await circleIcon(s, "FaCalendarAlt", 8.5, 1.85, 0.75, CORAL);
    T(s, "試験日（対面）", { x: 9.4, y: 1.85, w: 3.1, h: 0.75, fontSize: 20, bold: true, color: WHITE, valign: "middle" });
    [["プレ試験", "11月13日（金）2限"], ["本試験", "11月20日（金）2限"]].forEach(([t, d], i) => {
      const y = 2.95 + i * 1.65;
      card(s, 8.5, y, 3.9, 1.4, "1C5670");
      T(s, t, { x: 8.75, y: y + 0.15, w: 3.5, h: 0.5, fontSize: 18, bold: true, color: CORAL });
      T(s, d, { x: 8.75, y: y + 0.65, w: 3.5, h: 0.55, fontSize: 22, bold: true, color: WHITE });
    });
    s.addNotes("出席は取らないが，小テストで出席を取ることがある。試験の日程は必ず手帳に書いておくこと。");
  }

  // 10. 評価
  {
    const s = base("ガイダンス", "評価：本試験で決まる", null);
    const rules = [
      ["FaFileAlt", "本試験で評点を決定（指定教科書のみ持ち込み可）", NAVY],
      ["FaPencilAlt", "小テストの提出が50％未満の者は，60点（可）か不可のみ", TEAL],
      ["FaCheckCircle", "プレ試験で合格した者は，本試験の点数にかかわらず不可としない", CORAL],
      ["FaBan", "再試験・救済措置は一切行わない", NAVY],
    ];
    for (let i = 0; i < rules.length; i++) {
      const y = 1.6 + i * 1.2;
      card(s, 0.6, y, 6.9, 1.05, MINT);
      await circleIcon(s, rules[i][0], 0.8, y + 0.17, 0.7, rules[i][2]);
      T(s, rules[i][1], { x: 1.7, y, w: 5.6, h: 1.05, fontSize: 16, bold: i === 2, color: i === 2 ? CORAL_T : INK, valign: "middle" });
    }
    T(s, "評価例", { x: 8.0, y: 1.5, w: 4.7, h: 0.5, fontSize: 18, bold: true, color: NAVY });
    const ex = [["欠席", "0", "0"], ["欠席", "100", "100"], ["0", "100", "100"], ["60", "欠席", "60"], ["60", "0", "60"], ["60", "100", "100"]];
    const hd = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, align: "center" } });
    s.addTable([[hd("プレ試験"), hd("本試験"), hd("評価")], ...ex.map((r, i) => r.map((c, j) => ({
      text: c, options: { align: "center", fontFace: /\d/.test(c) ? NUM : FONT, bold: j === 2, color: j === 2 ? NAVY : INK, fill: { color: i % 2 ? "F4FAF9" : WHITE } },
    })))], {
      x: 8.0, y: 2.05, w: 4.7, colW: [1.6, 1.6, 1.5], rowH: 0.62, fontFace: FONT, fontSize: 18, color: INK,
      valign: "middle", border: { type: "solid", pt: 0.5, color: "DDE5E8" },
    });
    s.addNotes("プレ試験で60点以上なら，本試験を欠席しても0点でも60点（可）が保証される。本試験の点が高ければそちらが評価になる。");
  }

  // 11. オススメの勉強法
  {
    const s = base("ガイダンス", "オススメの勉強法", null);
    const tips = [
      ["FaDoorOpen", "少し早く教室に来て，前回の範囲，今回の範囲を眺める", NAVY],
      ["FaStickyNote", "授業中のノート書きは最低限（メモ程度）", TEAL],
      ["FaHighlighter", "教科書に書き込む，マーカーを引く", NAVY],
      ["FaBed", "居眠りするときは，安眠する", CORAL],
      ["FaRedo", "試験前には，今一度全体を見返し，大切な点については覚え直す", TEAL],
      ["FaComments", "過去問は全て解き，わからないことは友人に聞いて，完全に消化する", NAVY],
    ];
    const cw = 3.9, ch = 2.3, gx = 0.2, gy = 0.25;
    for (let i = 0; i < tips.length; i++) {
      const x = 0.6 + (i % 3) * (cw + gx), y = 1.6 + Math.floor(i / 3) * (ch + gy);
      card(s, x, y, cw, ch, tips[i][2] === CORAL ? "FFE8E1" : MINT);
      await circleIcon(s, tips[i][0], x + 0.3, y + 0.3, 0.75, tips[i][2]);
      T(s, String(i + 1), { x: x + cw - 0.8, y: y + 0.25, w: 0.5, h: 0.6, fontSize: 26, bold: true, color: GRAYBAR, fontFace: NUM, align: "right" });
      T(s, tips[i][1], { x: x + 0.3, y: y + 1.2, w: cw - 0.6, h: 0.95, fontSize: 17, bold: true, color: NAVY, valign: "top" });
    }
    s.addNotes("4番は冗談ではない。無理に起きてノートを取るより，教科書に書き込んで後で見返すほうがよい。");
  }

  // 12. 指定教科書
  {
    const s = base("ガイダンス", "指定教科書", "楽天ブックス https://a.r10.to/hRe8le");
    cover(s, "tb_cover.jpg", 0.9, 1.55, 5.1);
    T(s, "水産資源学［二訂版］", { x: 5.2, y: 1.6, w: 7.5, h: 0.8, fontSize: 32, bold: true, color: NAVY, valign: "middle" });
    T(s, "松石 隆 著　海文堂出版　2500円＋税", { x: 5.2, y: 2.45, w: 7.5, h: 0.5, fontSize: 18, color: INK });
    card(s, 5.2, 3.3, 4.6, 1.5, NAVY);
    await circleIcon(s, "FaCheckCircle", 5.45, 3.6, 0.8, CORAL);
    T(s, "本試験に持ち込み可", { x: 6.45, y: 3.3, w: 3.3, h: 0.9, fontSize: 20, bold: true, color: WHITE, valign: "middle" });
    T(s, "旧版（初版）も指定教科書として可", { x: 6.45, y: 4.1, w: 3.3, h: 0.5, fontSize: 13, color: "BFE3DF" });
    card(s, 5.2, 5.05, 4.6, 1.6, MINT);
    T(s, "教科書の構成", { x: 5.45, y: 5.15, w: 4.2, h: 0.4, fontSize: 15, bold: true, color: TEAL });
    T(s, "緒言，第1〜6章，練習問題，引用文献，索引。\n種名には英名と学名を付記", { x: 5.45, y: 5.55, w: 4.2, h: 1.0, fontSize: 13, color: INK, valign: "top" });
    qr(s, "qr_tb.png", "https://a.r10.to/hRe8le", 10.2, 3.3, 2.3);
    T(s, "楽天ブックス", { x: 10.2, y: 5.7, w: 2.3, h: 0.35, fontSize: 13, bold: true, color: NAVY, align: "center" });
    T(s, "https://a.r10.to/hRe8le", { x: 10.0, y: 6.05, w: 2.7, h: 0.35, fontSize: 11, color: SKY_T, fontFace: NUM, align: "center", hyperlink: { url: "https://a.r10.to/hRe8le" } });
    s.addNotes("Excelで計算できるように，広く使われている技術をていねいに解説した。二訂版では漁業法改正やMSYベースの資源評価導入に合わせて改訂し，統計も最新にした。");
  }

  // 13. 教科書の使い方
  {
    const s = base("ガイダンス", "教科書の使い方（オススメ）", null);
    card(s, 0.6, 1.55, 8.3, 1.05, NAVY);
    T(s, "教科書は，記憶の一部として育てる", { x: 0.9, y: 1.55, w: 7.8, h: 1.05, fontSize: 24, bold: true, color: WHITE, valign: "middle" });
    const u = [
      ["FaPen", "書き込む"], ["FaHighlighter", "マーカーを引く（最低限）"], ["FaPaperclip", "貼り込む"],
      ["FaStickyNote", "付箋を付ける"], ["FaSearch", "忘れたら見返す"], ["FaHeart", "捨てない"],
    ];
    for (let i = 0; i < u.length; i++) {
      const x = 0.6 + (i % 2) * 4.25, y = 2.9 + Math.floor(i / 2) * 1.3;
      card(s, x, y, 4.05, 1.1, i === 5 ? "FFE8E1" : MINT);
      await circleIcon(s, u[i][0], x + 0.2, y + 0.18, 0.74, i === 5 ? CORAL : i % 2 ? TEAL : NAVY);
      T(s, u[i][1], { x: x + 1.1, y, w: 2.9, h: 1.1, fontSize: 17, bold: true, color: i === 5 ? CORAL_T : NAVY, valign: "middle" });
    }
    cover(s, "tb_cover.jpg", 9.5, 1.7, 4.6);
    s.addNotes("試験に持ち込めるのは指定教科書だけ。自分で書き込んだ教科書が，そのまま最強のカンニングペーパーになる。卒業後も仕事で使える。");
  }

  // 14. 指定図書
  {
    const s = base("ガイダンス", "指定図書（試験持ち込み不可）", "楽天ブックス");
    const books = [
      ["engan_cover.jpg", "qr_engan.png", "https://a.r10.to/hMbQOn", "沿岸資源調査法", "片山知史・松石 隆 著\n恒星社厚生閣　2500円＋税"],
      ["miyabe_cover.jpg", "qr_miyabe.png", "https://a.r10.to/hUJunw", "釣りがつなぐ希少魚の保全と地域振興\n―然別湖の固有種ミヤベイワナに学ぶ―", "芳山 拓 著\n海文堂出版　1800円＋税"],
      ["kujira_cover.jpg", "qr_kujira.png", "https://a.r10.to/h6IY3K", "北水ブックス　出動！イルカ・クジラ110番\n―海岸線3066kmから視えた寄鯨の科学", "松石 隆 著\n海文堂出版　1800円＋税"],
    ];
    const cw = 3.9, gap = 0.2;
    books.forEach(([cv, q, url, t, a], i) => {
      const x = 0.6 + i * (cw + gap);
      card(s, x, 1.5, cw, 5.25, MINT);
      cover(s, cv, x + 0.3, 1.8, 2.6);
      qr(s, q, url, x + cw - 1.55, 2.95, 1.3);
      T(s, t, { x: x + 0.3, y: 4.6, w: cw - 0.6, h: 1.25, fontSize: 14, bold: true, color: NAVY, valign: "top" });
      T(s, a, { x: x + 0.3, y: 5.85, w: cw - 0.6, h: 0.5, fontSize: 13, color: INK, valign: "top" });
      T(s, url, { x: x + 0.3, y: 6.4, w: cw - 0.6, h: 0.3, fontSize: 11, color: SKY_T, fontFace: NUM, hyperlink: { url } });
    });
    s.addNotes("どれも試験には持ち込めない。沿岸資源調査法は卒論で調査をする人に。ミヤベイワナの本は遊漁と資源保全の実例。イルカ・クジラ110番は北海道の漂着鯨類調査の記録。");
  }

  // 最後の写真（旧スライドの最終ページ）
  if (asset("last.jpg")) {
    const s = pres.addSlide(); page++;
    s.background = { color: "000000" };
    s.addImage({ path: asset("last.jpg"), altText: alt("last.jpg"), x: 0, y: 0, w: 13.333, h: 7.5, sizing: { type: "cover", w: 13.333, h: 7.5 } });
    T(s, "函館山からの夜景", { x: 0.5, y: 6.7, w: 5, h: 0.55, fontSize: 22, bold: true, color: WHITE, shadow: { type: "outer", color: "000000", opacity: 0.6, blur: 4, offset: 1, angle: 90 } });
    s.addNotes("");
  }

  await pres.writeFile({ fileName: path.join(__dirname, "raw0.pptx") });
  console.log("written", page, "slides");
})();
