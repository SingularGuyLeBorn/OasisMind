const { chromium } = require('../../../../apps/web/node_modules/@playwright/test');
const assert = require('node:assert/strict');

const cases = [
  { name: 'h2o', slug: '3.1.2-H2O缓存驱逐', alt: 'H2O 累计分数更新与 recent 窗口移动的驱逐手算' },
  { name: 'quest', slug: '3.1.1-Quest页级选择', alt: 'Quest 的页摘要更新与跨步候选变化' },
];
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1280, 390]) {
      for (const item of cases) {
        const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
        try {
          const parts = ['articles', 'SparseAttention', '3-KV选择', '3.1-KV读取与驱逐', item.slug];
          const url = `http://127.0.0.1:3003/${parts.map(encodeURIComponent).join('/')}.html`;
          const response = await page.goto(url, { waitUntil: 'networkidle' });
          assert.equal(response.status(), 200);
          const img = page.getByAltText(item.alt, { exact: true });
          await img.scrollIntoViewIfNeeded();
          await img.evaluate(i => i.decode());
          const state = await img.evaluate(i => ({
            src: i.currentSrc, naturalWidth: i.naturalWidth,
            width: i.getBoundingClientRect().width, complete: i.complete,
          }));
          assert.ok(state.complete && state.naturalWidth > 0);
          const asset = await page.request.get(state.src);
          assert.equal(asset.status(), 200);
          const original = page.getByRole('link', { name: '查看原尺寸图片', exact: true });
          const originalUrl = new URL(await original.getAttribute('href'), url).href;
          assert.equal((await page.request.get(originalUrl)).status(), 200);
          await img.scrollIntoViewIfNeeded();
          await page.screenshot({ path: `docs/development/figure-production/sparse-h2o/site-${item.name}-${width}.png` });
          console.log(JSON.stringify({ article: item.name, viewport: width, ...state, assetStatus: asset.status() }));
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
