// 公网部署验收：检查真实 HTTPS、公开索引、文章及其资源，再用浏览器验证搜索和阅读。
// [OM-FREEPLAY] 20 秒网络上限和 6 路读取并发是保守验证设置，不改变产品行为。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('../apps/server/node_modules/playwright');

const base = process.env.PUBLIC_SITE_CHECK_URL || 'https://singularguyleborn.github.io/OasisMind/';
const origin = new URL(base).origin;
const root = new URL(base).pathname.replace(/\/$/, '');
const resolve = (p) => new URL(p, origin).href;
const stats = { pages: 0, articles: 0, resources: 0, articleLinks: 0, browserViews: 0 };

async function get(p, expected = 200) {
  const response = await fetch(resolve(p), { signal: AbortSignal.timeout(20000) }).catch(error => {
    throw new Error(`${resolve(p)}: ${error.message}${error.cause?.code ? ` (${error.cause.code})` : ''}`, { cause: error });
  });
  assert.equal(response.status, expected, `${p}: HTTP ${response.status}`);
  assert.equal(new URL(response.url).protocol, 'https:');
  return response;
}

async function mapBounded(items, fn) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(6, items.length) }, async () => {
    while (next < items.length) await fn(items[next++]);
  }));
}

async function main() {
  for (const p of ['/', '/knowledge', '/resources', '/search', '/about', '/robots.txt', '/sitemap.xml', '/feed.xml', '/manifest.webmanifest']) {
    const response = await get(root + p);
    const text = await response.text();
    assert.ok(text.length > 20, `${p}: empty response`);
    if (['/sitemap.xml', '/feed.xml', '/robots.txt'].includes(p)) {
      assert.ok(text.includes(origin + root), `${p}: deployment URL missing`);
      assert.ok(!text.includes('localhost:'), `${p}: localhost URL leaked`);
    }
    stats.pages++;
  }
  await get(root + '/not-a-real-page-deployment-probe', 404);
  for (const p of ['/chat', '/editor', '/api/trpc', '/data', '/.env']) await get(root + p, 404);
  const index = await (await get(root + '/api/v1/index.json')).json();
  const search = await (await get(root + '/api/v1/search.json')).json();
  assert.ok(index.posts.length > 0);
  assert.equal(search.posts.length, index.posts.length);
  const samples = index.posts.filter(p => p.garden === 'SparseAttention');
  const linkedPost = index.posts.find(p => p.garden === 'model-library' && p.slug.endsWith('deepseek-v4-1-flash-analysis'));
  assert.ok(linkedPost, 'Cross-article link regression sample missing');
  for (const garden of index.gardens) {
    await get(`${root}/gardens/${encodeURIComponent(garden.id)}`);
    const sample = index.posts.find(p => p.garden === garden.id);
    if (sample && sample.garden !== 'SparseAttention') samples.push(sample);
    stats.pages++;
  }
  if (!samples.some(p => p.id === linkedPost.id)) samples.push(linkedPost);
  const images = new Set();
  const imageArticles = new Map();
  const articleLinks = new Set();
  await mapBounded(samples, async (p) => {
    const response = await get(p.apiPath);
    const data = await response.json();
    assert.equal(data.post.id, p.id);
    await get(p.markdownPath);
    const article = `${root}/articles/${encodeURIComponent(p.garden)}/${p.slug.split('/').map(encodeURIComponent).join('/')}`;
    const html = await (await get(article)).text();
    assert.ok(html.includes('<title>'), `${p.id}: missing document title`);
    assert.ok(!html.includes('localhost:3010'), `${p.id}: backend URL leaked`);
    for (const match of data.post.content.matchAll(/\]\(([^\s)]*\/articles\/[^\s)]+)\)/g)) {
      const url = new URL(match[1], origin);
      if (url.origin === origin) articleLinks.add(url.pathname);
    }
    if (p.garden === 'SparseAttention') {
      for (const match of data.post.content.matchAll(/\/api\/v1\/assets\/[a-f0-9]{2}\/[a-f0-9]{64}\.[a-z0-9]+/g)) images.add(root + match[0]);
      // 验证当前正文实际引用的图片，不假定某个固定文章永远包含图片。
      if (/<img\b[^>]*\bsrc=["'][^"']*\/api\/v1\/assets\//.test(html)) imageArticles.set(p.id, article);
    }
    stats.articles++;
  });
  await mapBounded([...articleLinks], async p => { await get(p); stats.articleLinks++; });
  assert.ok(images.size > 0, 'SparseAttention resource collection is empty');
  assert.ok(imageArticles.size > 0, 'SparseAttention image article collection is empty');
  const imageArticle = [...imageArticles.entries()].sort(([a], [b]) => a.localeCompare(b))[0][1];
  await mapBounded([...images], async (p) => {
    const response = await get(p);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.ok(bytes.length > 32, `${p}: empty resource`);
    if (p.endsWith('.webp')) {
      assert.equal(bytes.subarray(0, 4).toString(), 'RIFF');
      assert.equal(bytes.subarray(8, 12).toString(), 'WEBP');
    }
    stats.resources++;
  });

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const evidence = path.resolve('data/deployment-checks');
  fs.mkdirSync(evidence, { recursive: true });
  try {
    for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      const failed = [];
      page.on('response', r => { if (r.status() >= 400 && new URL(r.url()).origin === origin) failed.push(`${r.status()} ${r.url()}`); });
      await page.goto(base, { waitUntil: 'networkidle', timeout: 60000 });
      assert.equal(await page.locator('h1').count(), 1);
      await page.goto(resolve(root + '/search'), { waitUntil: 'networkidle', timeout: 60000 });
      await page.getByPlaceholder('搜索标题、摘要、标签…').fill('MInference');
      await page.waitForFunction(() => /找到 \d+ 篇/.test(document.querySelector('.result-count')?.textContent || ''));
      const card = page.locator('.post-grid a').filter({ hasText: 'MInference: 按 head 模式加速长上下文 Prefill' }).first();
      await card.click();
      await page.waitForLoadState('networkidle');
      assert.ok((await page.locator('.article-header h1').innerText()).includes('MInference'));
      assert.equal(await page.locator('.katex-error').count(), 0);
      await page.goto(resolve(imageArticle), { waitUntil: 'networkidle', timeout: 60000 });
      assert.equal(await page.locator('.katex-error').count(), 0);
      // 使用正文实际图像定位，兼容图片替换时保留技术主题但调整图像说明。
      const mainImages = page.locator('article img');
      assert.ok(await mainImages.count() > 0);
      for (let position = 0; position < await mainImages.count(); position++) {
        await mainImages.nth(position).scrollIntoViewIfNeeded();
        await page.waitForFunction(index => {
          const image = document.querySelectorAll('article img')[index];
          if (image.complete && image.naturalWidth === 0) throw new Error('文章图片加载失败');
          return image.complete && image.naturalWidth > 0;
        }, position);
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(errors, []);
      assert.deepEqual(failed, []);
      await page.screenshot({ path: path.join(evidence, `public-article-${width}.png`), fullPage: false });
      await page.close();
      stats.browserViews++;
    }
    const page = await browser.newPage();
    await page.goto(resolve(`${root}/articles/${linkedPost.garden}/${linkedPost.slug.split('/').map(encodeURIComponent).join('/')}`), { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: 'DeepSeek LLM 报告', exact: true }).click();
    await page.waitForLoadState('networkidle');
    assert.ok(!page.url().endsWith('.md'), 'Source Markdown link leaked into article navigation');
    assert.ok((await page.locator('.article-header h1').innerText()).includes('DeepSeek'));
    await page.close();
    stats.browserViews++;
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify({ result: 'PASS', base, gardens: index.gardens.length, publishedArticles: index.posts.length, ...stats }));
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
