const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const D = process.argv[2];
const order = JSON.parse(fs.readFileSync(path.join(D, 'project/deck.json'))).order;
const head = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=BIZ+UDGothic:wght@400;700&display=block">
<style>html,body{margin:0;padding:0}*{box-sizing:border-box}h1,h2,h3,p,ul,ol,table{margin:0}
section{width:1920px;height:1080px;position:relative;overflow:hidden}aside{display:none}
table{border-collapse:collapse;width:100%}th,td{padding:0.35em 0.6em;border-bottom:1px solid #C9D3DD;text-align:left}
th{background:#14213D;color:#FBFAF6;font-weight:700}</style></head><body>`;
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' }).catch(async () => chromium.launch());
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const [i, id] of order.entries()) {
    let s = fs.readFileSync(path.join(D, `project/slides/${id}.html`), 'utf8');
    s = s.replace('/_blob/576f77cba921ca6072a02fe2420883c3', 'eq.svg').replace('/_blob/54c4492dd46dfbcc3a231a4b873da46b', 'phi.svg');
    fs.writeFileSync(`render/${id}.html`, head + s + '</body></html>');
    await page.goto('file://' + path.resolve(`render/${id}.html`));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `img/${String(i + 1).padStart(2, '0')}_${id}.png` });
    console.log(i + 1, id);
  }
  await browser.close();
})();
