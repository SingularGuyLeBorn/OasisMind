const { chromium } = require('../../../../apps/web/node_modules/@playwright/test');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      try {
        const parts = ['articles', 'SparseAttention', '1-基础', '1.2-固定与混合连接', '1.2.3-KDA与混合线性注意力'];
        const url = `http://127.0.0.1:3003/${parts.map(encodeURIComponent).join('/')}.html`;
        const response = await page.goto(url, { waitUntil: 'networkidle' });
        assert.equal(response.status(), 200);
        const layout = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
        assert.ok(layout.scrollWidth <= layout.viewport + 1);
        const img = page.getByAltText('KDA通道衰减纠错写入与状态跨步复用', { exact: true });
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(i => i.decode());
        const state = await img.evaluate(i => ({ width: i.getBoundingClientRect().width, naturalWidth: i.naturalWidth, src: i.currentSrc }));
        assert.ok(state.naturalWidth > 0);
        assert.equal((await page.request.get(state.src)).status(), 200);
        const original = new URL(await page.getByRole('link', { name: '查看原尺寸', exact: true }).getAttribute('href'), url).href;
        assert.equal((await page.request.get(original)).status(), 200);
        for (const f of await page.evaluate(() => [...document.querySelectorAll('.katex-display')].map(e => {
          const bases = e.querySelectorAll('.katex-html > .base');
          return { end: bases[bases.length - 1]?.getBoundingClientRect().right, tag: e.querySelector('.katex-html > .tag')?.getBoundingClientRect().left };
        }))) if (f.end != null && f.tag != null) assert.ok(f.end <= f.tag + 1);
        await page.screenshot({ path: `docs/development/figure-production/sparse-kda/site-${width}.png` });
        console.log(JSON.stringify({ articleStatus: 200, assetStatus: 200, originalStatus: 200, ...layout, ...state }));
      } finally { await page.close(); }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
