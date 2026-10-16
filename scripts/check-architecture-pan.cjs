// 手动浏览器性能回归：在仓库根目录运行 node scripts/check-architecture-pan.cjs。
// 使用已经启动的 localhost:3000，不重启服务；独立浏览器上下文不会改用户保存的布局。
// 不缩短文章画布、不关闭样式，覆盖总览、放大后平移、专家区与页面滚动。
const { chromium } = require('../apps/web/node_modules/@playwright/test');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const url = 'http://localhost:3000/posts/' + encodeURIComponent('1-架构与缓存/1.1-CSA2与逐层数据流/1.1.1-矩阵视角的一层数据流') + '?garden=DeepSeekV41Flash';
(async () => {
    fs.mkdirSync('work', { recursive: true });
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1022, height: 1100 } });
        page.setDefaultTimeout(60000);
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(url);
        await page.locator('.react-flow__node[data-id="input"]').waitFor({ state: 'attached' });
        await page.waitForTimeout(1800);
        const anchor = () => page.evaluate(() => { document.activeElement?.blur?.(); const r = document.querySelector('.react-flow').getBoundingClientRect(); for (let y = Math.max(350, r.top + 100); y < Math.min(innerHeight - 20, r.bottom); y += 35)
            for (let x = 50; x < innerWidth - 40; x += 35)
                if (document.elementFromPoint(x, y)?.classList.contains('react-flow__pane'))
                    return { x, y }; });
        const pan = async (dx, dy) => { const a = await anchor(); assert.ok(a, '真实空白画布起点'); await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(a.x + dx, a.y + dy, { steps: 3 }); await page.mouse.up(); await page.waitForTimeout(350); };
        const focus = async (id) => { const r = await page.locator(`.react-flow__node[data-id="${id}"]`).boundingBox(); await pan(180 - r.x, 550 - r.y); };
        const results = [];
        async function measure(name) {
            const a = await anchor();
            assert.ok(a);
            await page.mouse.move(a.x, a.y);
            await page.evaluate(() => { window.__latencies = []; window.__record = e => { const t = e.timeStamp; requestAnimationFrame(() => { document.querySelector('.react-flow__viewport').getBoundingClientRect(); window.__latencies.push({ type: e.type, ms: performance.now() - t }); }); }; document.addEventListener('pointerdown', window.__record, true); document.addEventListener('pointermove', window.__record, true); });
            const start = Date.now();
            await page.mouse.down();
            const downMs = Date.now() - start;
            for (let i = 1; i <= 40; i++) {
                await page.mouse.move(a.x + i * 5, a.y + Math.sin(i / 8) * 65);
                await page.waitForTimeout(16);
            }
            await page.mouse.up();
            await page.waitForTimeout(100);
            const result = await page.evaluate(() => { document.removeEventListener('pointerdown', window.__record, true); document.removeEventListener('pointermove', window.__record, true); const values = window.__latencies.map(x => x.ms).sort((a, b) => a - b); return { latencies: window.__latencies, p95: values[Math.floor(values.length * .95)], max: values.at(-1), elements: document.querySelectorAll('*').length, suspended: document.querySelectorAll('[data-detail-suspended]').length, transform: document.querySelector('.react-flow__viewport').style.transform }; });
            results.push({ name, downMs, ...result });
            console.log(JSON.stringify({ name, downMs, p95: result.p95, max: result.max, elements: result.elements }));
        }
        for (const layer of [1, 15]) {
            await page.locator(`button[title^="Layer ${layer} "]`).click();
            await page.waitForTimeout(1400);
            await measure(`${layer}-overview`);
            for (let i = 0; i < 7; i++)
                await page.locator('.react-flow__controls-zoomin').click({ force: true });
            await page.waitForTimeout(500);
            for (const id of ['heads', 'experts', 'swa-window']) {
                await focus(id);
                await measure(`${layer}-${id}`);
            }
        }
        // 页面滚动改变屏幕交集，进入屏幕的矩阵应重新出现。
        await page.mouse.wheel(0, 700);
        await page.waitForTimeout(400);
        await measure('15-page-scroll');
        await page.screenshot({ path: 'work/architecture-pan-acceptance.png' });
        console.log(JSON.stringify({ errors }));
        fs.writeFileSync('work/architecture-pan-acceptance.json', JSON.stringify({ errors, results }, null, 2));
        assert.deepEqual(errors, []);
        assert.ok(results.every(r => r.downMs < 100 && r.max < 100), '每次按下及移动到下一帧均低于 100ms');
    }
    finally {
        await browser.close();
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
