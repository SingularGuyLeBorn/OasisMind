const { chromium } = require('../../../apps/web/node_modules/@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createHash } = require('node:crypto');
const sharp = require('../../../apps/server/node_modules/sharp');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      try {
        const parts = ['articles', 'SparseAttention', '5-内核', '5.1-稀疏执行与编程抽象', '5.1.1-索引到Kernel'];
        const url = `http://127.0.0.1:3003/${parts.map(encodeURIComponent).join('/')}.html`;
        assert.equal((await page.goto(url, { waitUntil: 'networkidle' })).status(), 200);
        const layout = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
        assert.ok(layout.scrollWidth <= layout.viewport + 1);
        assert.equal(await page.locator('.katex-error').count(), 0);
        const img = page.getByAltText('候选索引进入稀疏 attention kernel 的数据流', { exact: true });
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(i => i.decode());
        const state = await img.evaluate(i => ({ width: i.getBoundingClientRect().width, naturalWidth: i.naturalWidth, src: i.currentSrc }));
        assert.equal(state.naturalWidth, 1536);
        const asset = await page.request.get(state.src);
        assert.equal(asset.status(), 200);
        const hash = bytes => createHash('sha256').update(bytes).digest('hex');
        const source = fs.readFileSync('content/SparseAttention/5-内核/images/index-to-kernel-flow-v7.png');
        assert.ok(state.src.includes(hash(source)));
        const expected = await sharp(source).rotate().resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toBuffer();
        assert.equal(hash(await asset.body()), hash(expected));
        const enlarged = new URL(await page.getByRole('link', { name: '放大查看内核数据流图', exact: true }).getAttribute('href'), url).href;
        const enlargedResponse = await page.request.get(enlarged);
        assert.equal(enlargedResponse.status(), 200);
        assert.equal(hash(await enlargedResponse.body()), hash(expected));
        await page.screenshot({ path: `docs/development/figure-production/sparse-kernel-site-${width}.png` });
        console.log(JSON.stringify({ articleStatus: 200, assetStatus: 200, enlargedStatus: 200, sourceHashMatches: true, webpBytesMatch: true, katexErrors: 0, ...layout, ...state }));
      } finally { await page.close(); }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
