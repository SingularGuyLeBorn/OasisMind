// 使用固定接口数据验证本地 Agent 的视觉与操作，不创建会话、不调用模型、不代表服务端联调。
// 先启动本地 web；可通过 LOCAL_AGENT_CHECK_URL 指定地址。
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('../apps/server/node_modules/playwright');
const base = process.env.LOCAL_AGENT_CHECK_URL || 'http://localhost:3032';
const evidence = path.resolve(__dirname, '../data/deployment-checks');
const agents = [{ id: 'TestAgent', name: '视觉验收 Agent', tier: 'super', status: 'active', model: 'gpt-4.1', description: '固定视觉测试数据', tools: [], systemPrompt: '', workspaceId: null, heartbeat: null }];

function fixture(name) {
  if (name === 'agent.list') return { items: agents, total: 1, page: 1, pageSize: 50, totalPages: 1 };
  if (name === 'agent.getById') return agents[0];
  if (['post.tree', 'post.categories', 'post.tags'].includes(name)) return [];
  if (name.endsWith('.list') || ['agent.listSessionQueueItems', 'agent.pullAsyncQueue', 'agent.pullAgentMessages', 'session.listRunning'].includes(name)) return { items: [], total: 0, page: 1, pageSize: 40, totalPages: 0 };
  if (name === 'agent.asyncQueueStats') return { queued: 0, runningGlobal: 0, maxGlobal: 4, maxPerSession: 1, maxPerWorkspace: 2, maxQueued: 8, taskTimeoutMs: 600000, hubInteractiveRunning: 0, runningByWorkspace: {}, queuedByReason: { global: 0, session: 0, workspace: 0 } };
  return null;
}

async function main() {
  fs.mkdirSync(evidence, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [], mutations = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/api/trpc/**', route => {
        const request = route.request();
        if (request.method() !== 'GET') mutations.push(request.url());
        const url = new URL(request.url());
        const names = url.pathname.split('/api/trpc/')[1].split(',');
        const result = names.map(name => ({ result: { data: { json: fixture(name) } } }));
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify(url.searchParams.has('batch') ? result : result[0]) });
      });
      await page.route('**/api/agent/**', route => route.fulfill({ contentType: 'application/json', body: '{}' }));
      for (const routeName of ['agents', 'dashboard', 'chat']) {
        await page.goto(`${base}/${routeName}`, { waitUntil: 'networkidle' });
        const panel = page.locator('.om-agent-station').first();
        await panel.waitFor();
        const before = mutations.length;
        await panel.getByRole('button', { name: '执行', exact: true }).click();
        await page.waitForFunction(() => document.querySelector('.om-agent-station')?.dataset.view === 'execution');
        const slider = panel.getByRole('slider');
        await slider.focus();
        await slider.press('ArrowRight');
        await page.waitForFunction(() => document.querySelector('.om-agent-station input')?.getAttribute('aria-valuetext') === '1 度');
        assert.equal(mutations.length, before, '切换视角与旋转核心不得触发业务写入');
        assert.equal(await panel.locator('nav a').count(), 6);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
        if (routeName === 'agents') assert.equal(await page.locator('.om-agent-profile').count(), 1);
        if (routeName === 'chat') {
          assert.equal(await page.getByTestId('chat-input').isVisible(), true);
          assert.equal(await page.getByTestId('chat-send').evaluate(button => {
            const box = button.getBoundingClientRect();
            return box.top >= 0 && box.bottom <= innerHeight;
          }), true, '立体空态不能挤走发送按钮');
        }
        await panel.evaluate(async element => {
          await Promise.all(element.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {})));
          window.scrollTo({ top: element.getBoundingClientRect().top + scrollY - 120, behavior: 'instant' });
        });
        await panel.screenshot({ path: path.join(evidence, `agent-${routeName}-${width}.png`) });
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('Agent 管理、看板、聊天：桌面与手机视觉交互 PASS（固定接口数据）');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
