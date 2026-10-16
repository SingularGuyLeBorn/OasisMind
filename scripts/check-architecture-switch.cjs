// 原文章切层回归；不重启服务，不改用户布局，不把按钮变色当作内容完成。
// node scripts/check-architecture-switch.cjs [--assert-30ms] [--profile] [--base-url=http://localhost:3000]
const { chromium } = require('../apps/web/node_modules/@playwright/test');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const baseUrl = new URL(process.argv.find(arg => arg.startsWith('--base-url='))?.slice('--base-url='.length) ?? 'http://localhost:3000');
const url = baseUrl.origin + '/posts/' + encodeURIComponent('1-架构与缓存/1.1-CSA2与逐层数据流/1.1.1-矩阵视角的一层数据流') + '?garden=DeepSeekV41Flash';
const artifactSuffix = baseUrl.port === '3000' ? '' : `-${baseUrl.port || 'default'}`;

(async () => {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1022, height: 1100 } });
        const profile = process.argv.includes('--profile');
        const cdp = profile ? await page.context().newCDPSession(page) : null;
        if (cdp) { await cdp.send('Performance.enable'); await cdp.send('Profiler.enable'); }
        page.setDefaultTimeout(60000);
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(url);
        await page.locator('.react-flow__node[data-id="input"] [data-diagram-layer]').waitFor({ state: 'attached' });
        await page.waitForTimeout(1800);
        const results = [];
        for (const layer of [15, 29, 15, 29]) {
            const before = cdp ? Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value])) : null;
            if (cdp) await cdp.send('Profiler.start');
            await page.evaluate(layer => {
                const flow = document.querySelector('.architecture-flow');
                const button = document.querySelector(`button[title^="Layer ${layer} "]`);
                window.__switchResult = null;
                button.addEventListener('click', event => {
                    const start = event.timeStamp;
                    let mutated = true, stableFrames = 0, feedbackMs = null, contentFrameMs = null, last = start;
                    const frames = [], longTasks = [];
                    const observer = new MutationObserver(() => { mutated = true; });
                    observer.observe(flow, { subtree: true, childList: true, attributes: true, characterData: true });
                    const tasks = new PerformanceObserver(list => longTasks.push(...list.getEntries().map(entry => entry.duration)));
                    tasks.observe({ type: 'longtask' });
                    const tick = () => {
                        const now = performance.now();
                        frames.push(now - last);
                        last = now;
                        if (feedbackMs === null && button.getAttribute('aria-pressed') === 'true') feedbackMs = now - start;
                        const nodes = [...flow.querySelectorAll('.react-flow__node')].filter(node => node.dataset.id !== 'first-input');
                        const current = nodes.length > 0 && nodes.every(node => node.querySelector('[data-diagram-layer]')?.dataset.diagramLayer === String(layer));
                        if (current && (mutated || contentFrameMs === null)) contentFrameMs = now - start;
                        stableFrames = current && !mutated ? stableFrames + 1 : 0;
                        mutated = false;
                        // 连续两个无 DOM 变动的帧，且每个节点都已切到目标层。
                        // 这是 DOM 稳定检查，不宣称测到了显示器实际亮起的时间。
                        if (stableFrames >= 2 || now - start > 30000) {
                            observer.disconnect();
                            tasks.disconnect();
                            window.__switchResult = {
                                layer, feedbackMs, contentFrameMs, verificationFinishedMs: now - start,
                                settled: stableFrames >= 2, maxFrameMs: Math.max(...frames),
                                longTasks, nodes: nodes.length,
                                elements: flow.querySelectorAll('*').length,
                                formulaErrors: flow.querySelectorAll('.katex-error').length,
                                staleFormulas: [...flow.querySelectorAll('span[aria-label]')].filter(span => {
                                    const source = span.querySelector('annotation[encoding="application/x-tex"]');
                                    return source && source.textContent !== span.getAttribute('aria-label');
                                }).length,
                                transform: flow.querySelector('.react-flow__viewport').style.transform,
                            };
                        } else requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }, { capture: true, once: true });
            }, layer);
            await page.locator(`button[title^="Layer ${layer} "]`).click();
            await page.waitForFunction(() => window.__switchResult !== null);
            const result = await page.evaluate(() => window.__switchResult);
            if (cdp) {
                const { profile: cpuProfile } = await cdp.send('Profiler.stop');
                const after = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
                result.cost = Object.fromEntries(['TaskDuration', 'ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration'].map(name => [name, 1000 * (after[name] - before[name])]));
                fs.mkdirSync('work', { recursive: true });
                fs.writeFileSync(`work/architecture-switch${artifactSuffix}-${results.length}-${layer}.cpuprofile`, JSON.stringify(cpuProfile));
            }
            results.push(result);
            console.log(JSON.stringify(result));
            assert.equal(result.settled, true, '目标层全部节点应完成更新并稳定');
            assert.equal(result.formulaErrors, 0);
            assert.equal(result.staleFormulas, 0, '换层后的可访问标签与公式源码应一致');
        }
        fs.mkdirSync('work', { recursive: true });
        fs.writeFileSync(`work/architecture-switch-acceptance${artifactSuffix}.json`, JSON.stringify({ url, errors, results }, null, 2));
        await page.screenshot({ path: `work/architecture-switch-acceptance${artifactSuffix}.png` });
        assert.deepEqual(errors, []);
        if (process.argv.includes('--assert-30ms')) {
            assert.ok(results.every(result => result.contentFrameMs < 30), '切层内容显示尚未达到 30ms');
        }
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
