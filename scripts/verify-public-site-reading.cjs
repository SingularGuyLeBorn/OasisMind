// 验收静态阅读版：正文先于脚本、桌面双侧目录、手机中途唤出导航与搜索。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('../apps/server/node_modules/playwright');
const THREE = require('../apps/web/node_modules/three');
const output = path.resolve(__dirname, '../apps/site/out');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

async function assertTreeAlignment(page) {
  const result = await page.locator('.knowledge-tree nav').evaluate(nav => {
    // 在真实目录样式下覆盖同级可展开节点、普通文章与换行标题。
    const fixture = document.createElement('ul');
    fixture.innerHTML = '<li><details open><summary><svg class="tree-chevron" width="14" height="14" aria-hidden="true"></svg><a>2.2.1 · 可展开的技术路线与较长标题</a></summary></details></li><li><div class="tree-leaf"><a>2.1.2 · 普通文章与较长标题</a></div></li>';
    nav.append(fixture);
    try {
      const links = [...fixture.querySelectorAll('a')];
      return {
        left: links.map(link => link.getBoundingClientRect().left),
        numeric: links.map(link => getComputedStyle(link).fontVariantNumeric),
      };
    } finally { fixture.remove(); }
  });
  assert.ok(Math.abs(result.left[0] - result.left[1]) < 1, '同级目录的编号必须对齐，展开箭头不能额外挤开标题');
  assert.ok(result.numeric.every(value => value.includes('tabular-nums')), '目录编号使用等宽数字');
}

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
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-swiftshader'] });
  const stats = { base, articles: index.posts.length, browsers: [], initialHtmlBytes: Buffer.byteLength(html) };
  const evidence = path.resolve(__dirname, '../data/deployment-checks');
  fs.mkdirSync(evidence, { recursive: true });
  try {
    for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, isMobile: width < 901, hasTouch: width < 901 });
      const errors = [], failures = [], requests = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base)) failures.push(`${r.status()} ${r.url()}`); });
      page.on('request', r => requests.push(r.url()));
      const excerptSample = index.posts.find(p => p.garden === 'SparseAttention' && p.title.includes('哈希与聚类'));
      assert.ok(excerptSample, '缺少摘要公式回归样本');
      const excerptUrl = new URL(`articles/${encodeURIComponent(excerptSample.garden)}/${excerptSample.slug.split('/').map(encodeURIComponent).join('/')}`, base).href;
      await page.goto(excerptUrl, { waitUntil: 'networkidle' });
      assert.ok(await page.locator('.article-excerpt .katex').count() >= 2, '摘要不能露出 LaTeX 源码');
      assert.equal(await page.locator('.article-excerpt .katex-error').count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      await page.screenshot({ path: path.join(evidence, `excerpt-${width}.png`) });
      const started = Date.now();
      await page.goto(article, { waitUntil: 'domcontentloaded' });
      await page.locator('[data-reading-content] .article-prose p').first().waitFor();
      const visibleMs = Date.now() - started;
      await page.waitForLoadState('networkidle');
      assert.equal(await page.locator('.knowledge-tree').isVisible(), width > 900);
      assert.equal(await page.locator('.article-toc').isVisible(), width > 900);
      assert.equal(await page.locator('.knowledge-tree summary').first().evaluate(element => getComputedStyle(element).listStyleType), 'none');
      assert.ok(await page.locator('.knowledge-tree .tree-chevron').count() > 0);
      assert.equal(await page.locator('.katex-error').count(), 0);
      assert.equal(await page.locator('.knowledge-tree a[aria-current="page"]').count(), 1);
      if (width > 900) await assertTreeAlignment(page);
      const outline = await page.locator('.article-toc a').evaluateAll(links => links.map(a => a.getAttribute('href')));
      assert.ok(outline.length > 2);
      assert.equal(await page.evaluate(ids => ids.every(id => Boolean(document.getElementById(decodeURIComponent(id.slice(1))))), outline), true);
      if (width <= 900) {
        assert.match(await page.locator('.article-header h1').innerText(), /^\d/);
        assert.equal(await page.locator('.article-main').evaluate(el => el.getBoundingClientRect().top < 200), true, '正文前面不能再堆目录');
        await page.evaluate(() => window.scrollTo({ top: 1800, behavior: 'instant' }));
        const readingY = await page.evaluate(() => scrollY);
        const readingHash = new URL(page.url()).hash;
        assert.ok(readingY > 1000);
        const opener = page.locator('[data-navigation-open="documents"]');
        assert.equal(await opener.evaluate(el => el.getBoundingClientRect().bottom <= innerHeight), true);
        await opener.click();
        const dialog = page.getByRole('dialog', { name: '阅读导航' });
        await dialog.waitFor();
        assert.equal(new URL(page.url()).hash, readingHash, '打开目录不能修改锚点');
        await page.waitForFunction(() => Math.abs(document.querySelector('dialog').getBoundingClientRect().left) < 1);
        assert.equal(await page.locator('.knowledge-tree a[aria-current="page"]').isVisible(), true);
        await assertTreeAlignment(page);
        assert.equal(await page.evaluate(() => document.activeElement.id), 'documents-tab');
        // 背景不滚、Tab 不跑出面板、方向键能切目录。
        const frozenTop = await page.locator('.article-main').evaluate(el => el.getBoundingClientRect().top);
        await page.mouse.move(10, 20); await page.mouse.wheel(0, 500);
        assert.equal(await page.locator('.article-main').evaluate(el => el.getBoundingClientRect().top), frozenTop);
        await page.keyboard.press('ArrowRight');
        assert.equal(await page.getByRole('tab', { name: '本页目录', exact: true }).getAttribute('aria-selected'), 'true');
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => document.activeElement.closest('dialog') !== null), true);
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'hidden' });
        assert.ok(Math.abs(await page.evaluate(() => scrollY) - readingY) < 2, '关闭后必须保住阅读位置');
        assert.equal(await opener.evaluate(el => document.activeElement === el), true);
        await opener.click();
        await page.getByRole('button', { name: '关闭阅读导航' }).click();
        await opener.focus();
        await page.keyboard.press('Space');
        await dialog.waitFor();
        await page.mouse.click(width - 6, 125);
        await dialog.waitFor({ state: 'hidden' });
        assert.ok(Math.abs(await page.evaluate(() => scrollY) - readingY) < 2);
        const rapidReopen = await page.evaluate(() => new Promise(resolve => {
          const panel = document.querySelector('dialog');
          const link = document.querySelector('[data-navigation-open="documents"]');
          link.click();
          panel.addEventListener('close', () => resolve({ open: panel.open, locked: document.body.style.position === 'fixed' }), { once: true });
          panel.close(); link.click();
        }));
        assert.deepEqual(rapidReopen, { open: true, locked: true }, '旧 close 事件不能解锁新打开的目录');
        await page.getByRole('button', { name: '关闭阅读导航' }).click();
        await opener.click();
        await page.setViewportSize({ width: 1280, height: 900 });
        await dialog.waitFor({ state: 'hidden' });
        assert.equal(await page.locator('.article-layout > .knowledge-tree').isVisible(), true);
        await page.setViewportSize({ width, height: 900 });
        await page.locator('[data-navigation-open="outline"]').click();
        await page.waitForFunction(() => Math.abs(document.querySelector('dialog').getBoundingClientRect().right - innerWidth) < 1);
        await page.screenshot({ path: path.join(evidence, 'mobile-reading-drawer.png') });
      }
      await page.locator('.article-toc a').nth(1).click();
      await page.waitForFunction(() => !document.querySelector('dialog[open]'));
      assert.ok(new URL(page.url()).hash);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      assert.equal(requests.some(url => /\/_next\/.*\.js|\.txt(?:\?|$)/.test(url)), false);
      assert.equal(requests.some(url => /api\/v1\/(?:posts|search)/.test(url)), false);
      await page.screenshot({ path: path.join(evidence, `reading-${width}.png`) });

      if (width <= 900) {
        const parent = await page.locator('.back-link').getAttribute('href');
        assert.ok(parent.includes('/articles/'), '样本上一级应为章节而非直接回知识库');
        await page.locator('.mobile-reading-bar a').first().click();
        await page.waitForLoadState('networkidle');
        assert.equal(new URL(page.url()).pathname, parent);
        await page.locator('[data-navigation-open="documents"]').click();
        await page.getByRole('navigation', { name: '返回入口' }).getByRole('link', { name: '知识库首页', exact: true }).click();
        await page.waitForLoadState('networkidle');
        assert.ok(new URL(page.url()).pathname.includes('/gardens/SparseAttention'));
        assert.equal(await page.locator('.mobile-reading-bar a').first().getAttribute('href'), new URL('knowledge', base).pathname);
        await page.locator('.mobile-reading-bar').getByRole('link', { name: '首页', exact: true }).click();
        await page.waitForLoadState('networkidle');
        assert.equal(new URL(page.url()).pathname, new URL(base).pathname);
      } else await page.goto(base, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.home-path').count(), 3);
      const showcase = page.locator('.om-reading-showcase');
      assert.equal(await showcase.count(), 1);
      await showcase.locator('label').nth(1).click();
      assert.equal(await showcase.locator('.om-showcase-page--2').isVisible(), true);
      assert.equal(await showcase.locator('.om-showcase-page--1').isVisible(), false);
      await showcase.locator('input').nth(1).focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await showcase.locator('.om-showcase-page--3').isVisible(), true, '阅读视角必须支持键盘切换');
      await showcase.locator('label').first().click();
      assert.equal(await page.locator('.garden-grid > a').count(), index.gardens.filter(g => g.id !== 'resources').length);
      const motifs = await page.locator('.garden-grid [data-motif]').evaluateAll(arts => arts.map(art => art.dataset.motif));
      assert.equal(new Set(motifs).size, motifs.length, '知识库卡片不能重复同一套图形');
      const compositions = await page.locator('.garden-grid > a').evaluateAll(cards => cards.map(card => card.dataset.composition));
      assert.equal(new Set(compositions).size, 9, '各库至少使用九种不同构图');
      assert.equal(await page.locator('.garden-grid > a').evaluateAll(cards => cards.every(card => {
        const visual = card.querySelector('.om-card-visual').getBoundingClientRect();
        const body = card.querySelector('.om-card-body').getBoundingClientRect();
        return visual.right <= body.left + 1 || visual.bottom <= body.top + 1 || body.bottom <= visual.top + 1;
      })), true, '视觉展示面不能覆盖文字区');
      assert.equal(await page.locator('.garden-grid [data-garden-art][aria-hidden="true"]').count(), motifs.length);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      await page.screenshot({ path: path.join(evidence, `home-${width}.png`), fullPage: false });

      await page.goto(new URL('knowledge', base).href, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.garden-grid > a').count(), index.gardens.filter(g => g.id !== 'resources').length);
      await page.screenshot({ path: path.join(evidence, `knowledge-${width}.png`), fullPage: true });
      await page.goto(new URL('resources', base).href, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.post-grid .post-card h3 a').count(), index.posts.filter(p => p.garden === 'resources').length);
      await page.goto(new URL('about', base).href, { waitUntil: 'networkidle' });
      assert.ok((await page.locator('h1').innerText()).includes('应知序'));
      assert.ok((await page.locator('.article-prose').innerText()).length > 200);
      assert.equal(await page.locator('nav[aria-label="主导航"] a').count(), 6);

      await page.goto(new URL('search', base).href, { waitUntil: 'networkidle' });
      assert.equal(await page.getByLabel('搜索范围').evaluate(element => getComputedStyle(element).appearance), 'none');
      const beforeSearch = requests.filter(url => url.endsWith('/reading/search.json')).length;
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
    // 320px 窄屏和横屏都必须保留底栏入口，面板内部可滚动。
    for (const viewport of [{ width: 320, height: 640 }, { width: 844, height: 390 }]) {
      const phone = await browser.newPage({ viewport, isMobile: true, hasTouch: true });
      await phone.goto(article, { waitUntil: 'networkidle' });
      await phone.locator('[data-navigation-open="documents"]').click();
      assert.equal(await phone.evaluate(() => {
        const r = document.querySelector('dialog').getBoundingClientRect();
        return r.width <= innerWidth && r.height <= innerHeight && r.top >= 0;
      }), true);
      await phone.getByRole('button', { name: '关闭阅读导航' }).click();
      assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      await phone.close();
    }
    const officeNoJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    // 公开办公室必须具备独立静态入口，3D 失败或禁用脚本仍可去知识库。
    await officeNoJs.goto(new URL('office', base).href, { waitUntil: 'domcontentloaded' });
    assert.equal(await officeNoJs.getByRole('link', { name: '直接浏览知识库' }).count(), 1);
    await officeNoJs.close();
    for (const width of [1280, 390]) {
      const office = await browser.newPage({ viewport: { width, height: 900 }, isMobile: width < 640, hasTouch: width < 640 });
      const officeErrors = [], officeRequests = [];
      office.on('pageerror', error => officeErrors.push(error.message));
      office.on('request', request => officeRequests.push(request.url()));
      await office.goto(new URL('office', base).href, { waitUntil: 'networkidle' });
      assert.equal(await office.locator('canvas').count(), 0, '进入前不初始化 3D 场景');
      await office.getByRole('button', { name: '进入 3D 工作室' }).click();
      await office.locator('canvas').waitFor();
      await office.locator('canvas[data-office-ready="true"]').waitFor();
      // 从实际全景机位投影屏幕中心，验证点击的是场景物件，而非仅验证菜单按钮。
      const canvas = office.locator('canvas');
      const bounds = await canvas.boundingBox();
      const camera = new THREE.PerspectiveCamera(width < 640 ? 90 : 44, bounds.width / bounds.height, .1, 40);
      if (width < 640) camera.position.set(0, 3.8, 10); else camera.position.set(4, 3.5, 7.5);
      camera.lookAt(0, 1.25, -.5); camera.updateMatrixWorld();
      const point = new THREE.Vector3(0, 1.74, -1.615).project(camera);
      await canvas.click({ position: { x: (point.x + 1) * bounds.width / 2, y: (1 - point.y) * bounds.height / 2 } });
      const screenPanel = office.getByRole('dialog', { name: '工作室知识入口' });
      await screenPanel.waitFor();
      assert.equal(await screenPanel.getByRole('heading').innerText(), '研究工作台');
      await office.keyboard.press('Escape');
      await screenPanel.waitFor({ state: 'hidden' });
      await office.screenshot({ path: path.join(evidence, `office-${width}.png`) });
      await office.getByRole('button', { name: '工位', exact: true }).click();
      assert.equal(await office.getByRole('button', { name: '工位', exact: true }).getAttribute('aria-pressed'), 'true');
      await office.getByRole('navigation', { name: '工作室物件' }).getByRole('button', { name: '算力机架' }).click();
      const panel = office.getByRole('dialog', { name: '工作室知识入口' });
      await panel.waitFor();
      assert.ok(await panel.getByRole('link').count() > 0);
      assert.equal(await panel.locator('a').evaluateAll(links => links.every(link => link.pathname.includes('/gardens/'))), true);
      await office.keyboard.press('Escape');
      await panel.waitFor({ state: 'hidden' });
      assert.equal(await office.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      assert.equal(officeRequests.some(url => /api\/trpc|localhost:3010|\/chat(?:\?|$)/.test(url)), false);
      assert.deepEqual(officeErrors, []);
      await office.close();
    }
    const noJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    await noJs.goto(base, { waitUntil: 'domcontentloaded' });
    await noJs.locator('.om-showcase-tabs label').nth(2).click();
    assert.equal(await noJs.locator('.om-showcase-page--3').isVisible(), true, '首页展台禁用脚本仍应可切换');
    assert.equal(await noJs.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await noJs.goto(article, { waitUntil: 'domcontentloaded' });
    assert.ok((await noJs.locator('[data-reading-content] .article-prose').innerText()).length > 3000);
    assert.ok(await noJs.locator('.katex').count() > 0);
    await noJs.locator('.no-script-navigation').getByRole('link', { name: '本页目录', exact: true }).click();
    assert.equal(new URL(noJs.url()).hash, '#page-navigation');
    await noJs.locator('.article-toc a').nth(1).click();
    assert.ok(new URL(noJs.url()).hash);
    await noJs.close();
    const reduced = await browser.newPage({ reducedMotion: 'reduce' });
    await reduced.goto(base, { waitUntil: 'networkidle' });
    assert.equal(await reduced.locator('.om-sculpture-sheet--cover').evaluate(el => getComputedStyle(el).animationName), 'none');
    await reduced.locator('.garden-card').first().hover();
    assert.equal(await reduced.locator('.garden-card').first().evaluate(el => getComputedStyle(el).transform), 'none');
    assert.equal(await reduced.locator('.om-garden-art-stage').first().evaluate(el => getComputedStyle(el).transitionDuration), '0s');
    await reduced.close();
    const retryPage = await browser.newPage();
    let failures = 0;
    await retryPage.route('**/reading/search.json', route => {
      if (failures++ === 0) return route.fulfill({ status: 503, body: '测试网络失败' });
      return route.continue();
    });
    await retryPage.goto(new URL('search', base).href, { waitUntil: 'networkidle' });
    await retryPage.getByPlaceholder('搜索标题、摘要、标签…').fill('MInference');
    await retryPage.getByRole('alert').waitFor();
    assert.equal(await retryPage.locator('.post-card').count(), 0);
    assert.ok((await retryPage.locator('.result-count').innerText()).includes('暂不可用'));
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
