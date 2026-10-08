const fs = require('node:fs');
const { chromium } = require('../../../../apps/web/node_modules/@playwright/test');

(async () => {
  const png = fs.readFileSync('docs/development/figure-production/sparse-kda/candidate-v4.png');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [800, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      try {
        await page.setContent(`<body style="margin:0;background:white"><img alt="KDA教学图" style="display:block;width:100%;height:auto" src="data:image/png;base64,${png.toString('base64')}"></body>`);
        await page.locator('img').evaluate(i => i.decode());
        await page.locator('img').screenshot({ path: `docs/development/figure-production/sparse-kda/preview-${width}.png` });
      } finally { await page.close(); }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
