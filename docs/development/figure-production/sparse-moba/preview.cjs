const fs = require('node:fs');
const { chromium } = require('../../../../apps/web/node_modules/@playwright/test');

(async () => {
  const png = fs.readFileSync('content/SparseAttention/2-动态路由/2.1-粗粒度选择/images/moba-causal-routing-v4.png');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [800, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      try {
        await page.setContent(`<body style="margin:0;background:white"><img alt="MoBA教学图" style="display:block;width:100%;height:auto" src="data:image/png;base64,${png.toString('base64')}"></body>`);
        await page.locator('img').evaluate(i => i.decode());
        await page.locator('img').screenshot({ path: `docs/development/figure-production/sparse-moba/preview-${width}.png` });
        console.log(await page.locator('img').evaluate(i => ({ width: i.width, naturalWidth: i.naturalWidth })));
      } finally { await page.close(); }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
