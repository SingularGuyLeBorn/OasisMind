// 独立验收公开站浏览器私有批注；本机同时支持根路径与 /OasisMind 部署构建。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('../apps/server/node_modules/playwright');

const output = path.resolve(__dirname, '../apps/site/out');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2' };

function serveStatic() {
  return http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname.startsWith('/OasisMind/') ? pathname.slice('/OasisMind/'.length) : pathname.slice(1);
    let file = path.resolve(output, relative);
    if (file !== output && !file.startsWith(output + path.sep)) { response.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory() && fs.existsSync(path.join(file, 'index.html'))) file = path.join(file, 'index.html');
    else if (fs.existsSync(`${file}.html`)) file += '.html';
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });
}

async function selectText(page) {
  return page.evaluate(() => {
    for (const paragraph of document.querySelectorAll('[data-reading-content] .article-prose p')) {
      const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const data = node.data;
        const start = data.search(/[^\s]/);
        if (start >= 0 && data.length - start >= 14) {
          const range = document.createRange();
          range.setStart(node, start);
          range.setEnd(node, start + 12);
          const selection = getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          return range.toString();
        }
        node = walker.nextNode();
      }
    }
    throw new Error('长文没有可选的连续正文');
  });
}

async function importJson(page, json) {
  await page.locator('.local-notes-backup input[type=file]').setInputFiles({
    name: 'oasismind-notes.json', mimeType: 'application/json', buffer: Buffer.from(json),
  });
}

async function main() {
  assert.ok(fs.existsSync(path.join(output, 'api/v1/index.json')), '先运行静态站构建');
  const server = serveStatic();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const exportedHome = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
  const prefix = exportedHome.includes('href="/OasisMind/') ? '/OasisMind/' : '/';
  const base = process.env.PUBLIC_SITE_CHECK_URL || `http://127.0.0.1:${server.address().port}${prefix}`;
  const metrics = {};
  let browser;
  try {
    const index = await (await fetch(new URL('api/v1/index.json', base))).json();
    const sample = index.posts.find(post => post.garden === 'SparseAttention' && post.title.includes('MInference'));
    assert.ok(sample, '缺少超长文章验收样本');
    const article = new URL(`articles/${encodeURIComponent(sample.garden)}/${sample.slug.split('/').map(encodeURIComponent).join('/')}`, base).href;
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 900 }, isMobile: true, hasTouch: true, acceptDownloads: true });
    await context.addInitScript(() => {
      window.__annotationTreeWalks = 0;
      window.__annotationIndexTraversalMs = null;
      const original = Document.prototype.createTreeWalker;
      Document.prototype.createTreeWalker = function(root, ...args) {
        const walker = original.call(this, root, ...args);
        if (root instanceof HTMLElement && root.hasAttribute('data-reading-content')) {
          window.__annotationTreeWalks += 1;
          const started = performance.now();
          const nextNode = walker.nextNode.bind(walker);
          walker.nextNode = function() {
            const node = nextNode();
            if (node === null) window.__annotationIndexTraversalMs = performance.now() - started;
            return node;
          };
        }
        return walker;
      };
    });
    const page = await context.newPage();
    const errors = [];
    const failures = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });

    const homeStarted = Date.now();
    await page.goto(base, { waitUntil: 'networkidle' });
    metrics.homeLoadMs = Date.now() - homeStarted;
    assert.equal(await page.locator('.local-notes-open').count(), 0, '首页不加载文章批注 UI');

    // 从 Next Link 产出的真实卡片进入、退回父节点、再从目录进入，不能只验直达 URL。
    await page.locator('.post-card h3 a').first().click();
    await page.locator('.article-layout[data-navigation-ready]').waitFor({ timeout: 10_000 }).catch(async error => {
      console.error('卡片导航诊断', { url: page.url(), articleLayout: await page.locator('.article-layout').count(), errors, failures });
      throw error;
    });
    await page.locator('.local-notes-open').waitFor();
    const linkedArticle = new URL(page.url());
    await page.locator('.back-link').click();
    await page.locator('[data-navigation-open="documents"]').click();
    const returnLink = page.locator(`.reading-drawer .knowledge-tree a[href="${linkedArticle.pathname}"]`).first();
    const closedAncestors = await returnLink.evaluate(link => {
      const closed = [];
      let node = link.parentElement;
      while (node) {
        if (node instanceof HTMLDetailsElement && !node.open) closed.push(node);
        node = node.parentElement;
      }
      return closed.reverse().map((detail, index) => {
        const id = `annotation-verify-branch-${index}`;
        detail.querySelector(':scope > summary').dataset.annotationVerifyBranch = id;
        return id;
      });
    });
    for (const branch of closedAncestors) await page.locator(`summary[data-annotation-verify-branch="${branch}"]`).click();
    await returnLink.click();
    await page.locator('.article-layout[data-navigation-ready]').waitFor();
    await page.locator('.local-notes-open').waitFor();
    assert.equal(new URL(page.url()).pathname, linkedArticle.pathname, '从上一级经目录应能回到同一篇文章');

    await page.goto(base, { waitUntil: 'networkidle' });
    await page.locator('.garden-card').first().click();
    await page.locator('.post-card h3 a').first().click();
    await page.locator('.article-layout[data-navigation-ready]').waitFor();
    await page.locator('.local-notes-open').waitFor();

    const coldStarted = Date.now();
    await page.goto(article, { waitUntil: 'networkidle' });
    await page.locator('.local-notes-open').waitFor();
    const coldSamples = [Date.now() - coldStarted];
    assert.equal(await page.evaluate(() => window.__annotationTreeWalks), 0, '没有笔记的长文首次阅读不能索引全文');
    for (let index = 0; index < 2; index += 1) {
      const started = Date.now();
      await page.reload({ waitUntil: 'networkidle' });
      await page.locator('.local-notes-open').waitFor();
      coldSamples.push(Date.now() - started);
      assert.equal(await page.evaluate(() => window.__annotationTreeWalks), 0);
    }
    metrics.longArticleColdSamplesMs = coldSamples;
    const noNotesButton = page.locator('.local-notes-open');
    const navigation = page.locator('.mobile-reading-bar');
    assert.equal(await noNotesButton.evaluate((button, nav) => button.getBoundingClientRect().bottom <= document.querySelector(nav).getBoundingClientRect().top, '.mobile-reading-bar'), true, '手机笔记入口不能遮住底部导航');
    if (await page.locator('.article-prose table').count()) {
      assert.equal(await page.locator('.article-prose td, .article-prose th').first().evaluate(cell => getComputedStyle(cell).overflowWrap), 'normal', '手机表格单元格不应逐字竖排');
    }
    assert.equal(await navigation.isVisible(), true);
    await page.locator('[data-navigation-open="documents"]').click();
    const drawer = page.getByRole('dialog', { name: '阅读导航' });
    await drawer.waitFor();
    assert.equal(await page.evaluate(() => {
      const button = document.querySelector('.local-notes-open');
      const bounds = button.getBoundingClientRect();
      return document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2) !== button;
    }), true, '目录抽屉打开时不能被浮动笔记按钮盖住');
    await page.keyboard.press('Escape');
    await drawer.waitFor({ state: 'hidden' });

    const selected = await selectText(page);
    await page.locator('.local-notes-selection').waitFor({ state: 'visible' });
    await page.getByRole('toolbar', { name: '为所选文字添加批注' }).getByRole('button', { name: '高亮' }).click();
    const composer = page.getByRole('dialog', { name: '编辑本地批注' });
    await composer.waitFor();
    await composer.locator('textarea').fill('第一条本机笔记');
    await composer.getByRole('button', { name: '保存到此浏览器' }).click();
    await composer.waitFor({ state: 'hidden' });
    assert.equal(await page.evaluate(() => window.__annotationTreeWalks), 1, '选区建立的正文索引应复用，不逐条扫描');

    const warmStarted = Date.now();
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('.local-notes-open').waitFor();
    await page.waitForFunction(() => CSS.highlights?.has('om-local-note-highlight'));
    const warmSamples = [Date.now() - warmStarted];
    const indexSamples = [await page.evaluate(() => window.__annotationIndexTraversalMs)];
    assert.equal(await page.evaluate(() => window.__annotationTreeWalks), 1, '有一条笔记的长文只建一次正文索引');
    for (let index = 0; index < 2; index += 1) {
      const started = Date.now();
      await page.reload({ waitUntil: 'networkidle' });
      await page.locator('.local-notes-open').waitFor();
      await page.waitForFunction(() => CSS.highlights?.has('om-local-note-highlight'));
      warmSamples.push(Date.now() - started);
      indexSamples.push(await page.evaluate(() => window.__annotationIndexTraversalMs));
      assert.equal(await page.evaluate(() => window.__annotationTreeWalks), 1);
    }
    metrics.longArticleWithOneNoteSamplesMs = warmSamples;
    metrics.annotationIndexTraversalSamplesMs = indexSamples;
    const median = values => [...values].sort((left, right) => left - right)[1];
    metrics.longArticleMedianIncrementMs = median(warmSamples) - median(coldSamples);
    await noNotesButton.click();
    const panel = page.getByRole('dialog', { name: '我的本地笔记' });
    await panel.waitFor();
    assert.equal(await panel.locator('.local-notes-card').count(), 1);
    assert.ok((await panel.locator('.local-notes-card-quote').innerText()).includes(selected));
    await panel.getByRole('button', { name: '定位原文' }).click();
    await panel.waitFor({ state: 'hidden' });
    assert.equal(await page.evaluate(() => {
      const range = [...CSS.highlights.get('om-local-note-highlight')][0];
      const rect = range.startContainer.parentElement.getBoundingClientRect();
      return rect.top < innerHeight && rect.bottom > 0;
    }), true, '从笔记列表应能定位回正文');

    await noNotesButton.click();
    await panel.getByRole('button', { name: '编辑' }).click();
    await composer.locator('textarea').fill('修改后的本机笔记');
    await composer.getByRole('button', { name: '保存到此浏览器' }).click();
    await composer.waitFor({ state: 'hidden' });
    await noNotesButton.click();
    assert.match(await panel.locator('.local-notes-card-comment').innerText(), /修改后的本机笔记/);

    await panel.getByRole('button', { name: '准备全部笔记 JSON' }).click();
    const downloadLink = panel.getByRole('link', { name: '下载备份文件' });
    await downloadLink.waitFor({ state: 'visible' });
    const backupJson = await downloadLink.evaluate(async link => (await fetch(link.href)).text());
    const backup = JSON.parse(backupJson);
    assert.equal(backup.annotations.length, 1);
    const downloadPromise = page.waitForEvent('download');
    await downloadLink.click();
    const download = await downloadPromise;
    assert.match(download.suggestedFilename(), /^oasismind-notes-.*\.json$/);

    page.once('dialog', dialog => dialog.accept().catch(() => {}));
    await panel.getByRole('button', { name: '删除' }).click();
    await page.waitForFunction(() => document.querySelectorAll('.local-notes-card').length === 0);
    await page.reload({ waitUntil: 'networkidle' });
    await noNotesButton.click();
    assert.equal(await panel.locator('.local-notes-card').count(), 0, '删除后重载不应复现');

    const invalidBackup = { ...backup, annotations: [backup.annotations[0], { ...backup.annotations[0], id: 'not-a-uuid' }] };
    await importJson(page, JSON.stringify(invalidBackup));
    await page.waitForFunction(() => document.querySelector('.local-notes-status')?.textContent.includes('导入失败'));
    assert.equal(await panel.locator('.local-notes-card').count(), 0, '错误导入不得部分落库');
    await importJson(page, backupJson);
    await page.waitForFunction(() => document.querySelectorAll('.local-notes-card').length === 1);
    assert.match(await panel.locator('.local-notes-status').innerText(), /新增 1 条/);

    await panel.getByRole('button', { name: '关闭' }).click();
    await page.route(article, async route => {
      const response = await route.fetch();
      let html = await response.text();
      const updated = html.replace(/data-local-annotation-hash="[0-9a-f]{64}"/, `data-local-annotation-hash="${'b'.repeat(64)}"`);
      assert.notEqual(updated, html, '静态文章需要暴露内容版本');
      html = updated;
      const changedText = `${'¤'.repeat(80)}${backup.annotations[0].anchor.exact}${'¤'.repeat(80)}`;
      const script = `<script>document.querySelector('[data-reading-content]').textContent = ${JSON.stringify(changedText)};</script>`;
      await route.fulfill({ response, body: html.replace('</body>', `${script}</body>`) });
    });
    await page.reload({ waitUntil: 'networkidle' });
    await noNotesButton.click();
    assert.equal(await panel.locator('.local-notes-unmatched').count(), 1, '正文版本变化且上下文失配时不能误划');
    assert.equal(await page.evaluate(() => CSS.highlights?.has('om-local-note-highlight') ?? false), false);

    const noScript = await browser.newContext({ viewport: { width: 390, height: 900 }, javaScriptEnabled: false });
    const staticPage = await noScript.newPage();
    await staticPage.goto(article);
    assert.ok(await staticPage.locator('[data-reading-content]').innerText());
    assert.equal(await staticPage.locator('.local-notes-open').count(), 0, '无脚本时正文仍可阅读');
    await noScript.close();
    assert.deepEqual(errors, [], '浏览器运行时不能有未捕获异常');
    console.log(JSON.stringify({ ok: true, metrics, selected, annotationTreeWalks: 1 }, null, 2));
    await context.close();
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
