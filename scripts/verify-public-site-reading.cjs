// 验收静态阅读版：正文先于脚本、双侧目录、搜索分页、手机布局及真实个人资料。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('../apps/server/node_modules/playwright');
const output = path.resolve(__dirname, '../apps/site/out');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

async function main() {
  const server = http.createServer((req, res) => {
    const requestPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!requestPath.startsWith('/OasisMind/')) { res.writeHead(404).end(); return; }
    let file = path.resolve(output, requestPath.slice('/OasisMind/'.length));
    if (file !== output && !file.startsWith(output + path.sep)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory() && fs.existsSync(path.join(file, 'index.html'))) file = path.join(file, 'index.html');
    else if (fs.existsSync(file + '.html')) file += '.html';
    if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = process.env.PUBLIC_SITE_CHECK_URL || `http://127.0.0.1:${server.address().port}/OasisMind/`;
  const index = await (await fetch(new URL('api/v1/index.json', base))).json();
  const sample = index.posts.find(p => p.garden === 'SparseAttention' && p.title.includes('MInference'));
  assert.ok(sample, '缺少长文验收样本');
  const article = new URL(`articles/${encodeURIComponent(sample.garden)}/${sample.slug.split('/').map(encodeURIComponent).join('/')}`, base).href;
  const html = await (await fetch(article)).text();
  assert.ok(html.includes('article-prose') && html.includes('knowledge-tree') && html.includes('article-toc'));
  assert.ok(!html.includes('self.__next_f.push') && !html.includes('正在读取文章'));
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const stats = { base, articles: index.posts.length, browsers: [], initialHtmlBytes: Buffer.byteLength(html) };
  const evidence = path.resolve(__dirname, '../data/deployment-checks');
  fs.mkdirSync(evidence, { recursive: true });
  try {
    for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [], failures = [], requests = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base)) failures.push(`${r.status()} ${r.url()}`); });
      page.on('request', r => requests.push(r.url()));
      const started = Date.now();
      await page.goto(article, { waitUntil: 'domcontentloaded' });
      await page.locator('.article-prose p').first().waitFor();
      const visibleMs = Date.now() - started;
      await page.waitForLoadState('networkidle');
      assert.equal(await page.locator('.knowledge-tree').isVisible(), true);
      assert.equal(await page.locator('.article-toc').isVisible(), true);
      assert.equal(await page.locator('.knowledge-tree summary').first().evaluate(element => getComputedStyle(element).listStyleType), 'none');
      assert.ok(await page.locator('.knowledge-tree .tree-chevron').count() > 0);
      assert.equal(await page.locator('.katex-error').count(), 0);
      assert.equal(await page.locator('.knowledge-tree a[aria-current="page"]').count(), 1);
      const outline = await page.locator('.article-toc a').evaluateAll(links => links.map(a => a.getAttribute('href')));
      assert.ok(outline.length > 2);
      assert.equal(await page.evaluate(ids => ids.every(id => Boolean(document.getElementById(decodeURIComponent(id.slice(1))))), outline), true);
      await page.locator('.article-toc a').nth(1).click();
      assert.ok(new URL(page.url()).hash);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      assert.equal(requests.some(url => /\/_next\/.*\.js|\.txt(?:\?|$)/.test(url)), false);
      assert.equal(requests.some(url => /api\/v1\/(?:posts|search)/.test(url)), false);
      await page.screenshot({ path: path.join(evidence, `reading-${width}.png`) });

      await page.goto(new URL('knowledge', base).href, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.garden-grid > a').count(), index.gardens.filter(g => g.id !== 'resources').length);
      await page.goto(new URL('resources', base).href, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.post-grid .post-card h3 a').count(), index.posts.filter(p => p.garden === 'resources').length);
      await page.goto(new URL('about', base).href, { waitUntil: 'networkidle' });
      assert.ok((await page.locator('h1').innerText()).includes('应知序'));
      assert.ok((await page.locator('.article-prose').innerText()).length > 200);
      assert.equal(await page.locator('nav[aria-label="主导航"] a').count(), 5);

      await page.goto(new URL('search', base).href, { waitUntil: 'networkidle' });
      const beforeSearch = requests.filter(url => url.endsWith('/api/v1/search.json')).length;
      assert.equal(beforeSearch, 0);
      await page.getByRole('button', { name: /浏览全部/ }).click();
      await page.getByRole('button', { name: '下一页', exact: true }).waitFor();
      const first = await page.locator('.post-grid .post-card h3 a').first().getAttribute('href');
      await page.getByRole('button', { name: '下一页', exact: true }).click();
      assert.notEqual(await page.locator('.post-grid .post-card h3 a').first().getAttribute('href'), first);
      assert.equal(await page.locator('.post-grid .post-card h3 a').count(), 24);
      await page.getByPlaceholder('搜索标题、摘要、标签…').fill('MInference');
      await page.getByLabel('搜索范围').selectOption('title');
      await page.waitForFunction(() => [...document.querySelectorAll('.post-card h3 a')].length > 0 && [...document.querySelectorAll('.post-card h3 a')].every(a => a.textContent.includes('MInference')));
      await page.getByLabel('按花园筛选').selectOption('SparseAttention');
      await page.getByPlaceholder('搜索标题、摘要、标签…').fill('MInference Prefill');
      await page.locator('.post-card h3 a').filter({ hasText: 'MInference' }).first().waitFor();
      await page.locator('.post-card h3 a').filter({ hasText: 'MInference' }).first().click();
      await page.waitForLoadState('networkidle');
      assert.ok((await page.locator('.article-header h1').innerText()).includes('MInference'));
      assert.deepEqual(errors, [], '浏览器异常');
      assert.deepEqual(failures, [], '资源加载失败');
      stats.browsers.push({ width, initialBodyVisibleMs: visibleMs });
      await page.close();
    }
    const noJs = await browser.newPage({ javaScriptEnabled: false });
    await noJs.goto(article, { waitUntil: 'domcontentloaded' });
    assert.ok((await noJs.locator('.article-prose').innerText()).length > 3000);
    assert.ok(await noJs.locator('.katex').count() > 0);
    await noJs.locator('.article-toc a').nth(1).click();
    assert.ok(new URL(noJs.url()).hash);
    await noJs.close();
    const retryPage = await browser.newPage();
    let failures = 0;
    await retryPage.route('**/api/v1/search.json', route => {
      if (failures++ === 0) return route.fulfill({ status: 503, body: '测试网络失败' });
      return route.continue();
    });
    await retryPage.goto(new URL('search', base).href, { waitUntil: 'networkidle' });
    await retryPage.getByPlaceholder('搜索标题、摘要、标签…').fill('MInference');
    await retryPage.getByRole('alert').waitFor();
    await retryPage.getByRole('button', { name: '重新读取' }).click();
    await retryPage.locator('.post-card h3 a').filter({ hasText: 'MInference' }).first().waitFor();
    assert.equal(await retryPage.getByRole('alert').count(), 0);
    await retryPage.close();
    console.log(JSON.stringify({ result: 'PASS', noJavaScriptReading: true, ...stats }, null, 2));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exit(1); });
