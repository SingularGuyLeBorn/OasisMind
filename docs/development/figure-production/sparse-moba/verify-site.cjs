const { chromium } = require('../../../../apps/web/node_modules/@playwright/test');
const assert = require('node:assert/strict');

const cases = [
  {
    name: 'moba', path: ['2-动态路由', '2.1-粗粒度选择', '2.1.3-MoBA'],
    images: [{ name: 'mechanism', alt: 'MoBA块路由因果选择与两分支softmax合并手算', original: '查看原尺寸图片' }],
  },
  {
    name: 'kv-route', path: ['3-KV选择', '3.1-KV读取与驱逐', '3.1-KV读取与驱逐'],
    images: [
      { name: 'quest', alt: 'Quest在相邻两步保留完整KV并重算候选页', original: '查看原尺寸', index: 0 },
      { name: 'h2o', alt: 'H2O先计算当步attention再更新分数并驱逐', original: '查看原尺寸', index: 1 },
    ],
  },
  { name: 'kv-chapter', path: ['3-KV选择', '3-KV选择'], heading: '3. 一份 KV 的四种状态' },
];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1280, 390]) {
      for (const item of cases) {
        const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
        try {
          const parts = ['articles', 'SparseAttention', ...item.path];
          const url = `http://127.0.0.1:3003/${parts.map(encodeURIComponent).join('/')}.html`;
          const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
          assert.equal(response.status(), 200);
          const layout = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
          assert.ok(layout.scrollWidth <= layout.viewport + 1, `页面溢出: ${JSON.stringify(layout)}`);
          const formulas = await page.evaluate(() => [...document.querySelectorAll('.katex-display')].map(e => {
            const bases = e.querySelectorAll('.katex-html > .base');
            const last = bases[bases.length - 1];
            const tag = e.querySelector('.katex-html > .tag');
            return { width: e.clientWidth, scrollWidth: e.scrollWidth, end: last?.getBoundingClientRect().right, tagLeft: tag?.getBoundingClientRect().left };
          }));
          for (const formula of formulas) {
            if (formula.end != null && formula.tagLeft != null) assert.ok(formula.end <= formula.tagLeft + 1, '式号覆盖公式');
          }
          if (item.heading) {
            await page.getByRole('heading', { name: item.heading, exact: true }).scrollIntoViewIfNeeded();
            await page.screenshot({ path: `docs/development/figure-production/sparse-moba/site-${item.name}-${width}.png` });
            console.log(JSON.stringify({ article: item.name, status: response.status(), ...layout }));
          }
          for (const figure of item.images || []) {
            const img = page.getByAltText(figure.alt, { exact: true });
            await img.scrollIntoViewIfNeeded();
            await img.evaluate(i => i.decode());
            const state = await img.evaluate(i => ({ src: i.currentSrc, naturalWidth: i.naturalWidth, width: i.getBoundingClientRect().width, complete: i.complete }));
            assert.ok(state.complete && state.naturalWidth > 0);
            assert.equal((await page.request.get(state.src)).status(), 200);
            const link = page.getByRole('link', { name: figure.original, exact: true }).nth(figure.index || 0);
            const originalUrl = new URL(await link.getAttribute('href'), url).href;
            assert.equal((await page.request.get(originalUrl)).status(), 200);
            await page.screenshot({ path: `docs/development/figure-production/sparse-moba/site-${item.name}-${figure.name}-${width}.png` });
            console.log(JSON.stringify({ article: item.name, figure: figure.name, ...state, ...layout, originalStatus: 200 }));
          }
        } finally { await page.close(); }
      }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
