/**
 * Mock LLM Chat E2E 辅助函数
 *
 * 与 realChatFixture 复用同一套 UI 操作，但额外提供 mock 场景断言封装。
 * 注意：waitForStreamingComplete 在此覆盖为「等 assistant 气泡出现」，
 * 因为 Mock 流式极快（~240ms），realChatFixture 的「先等 streaming visible 再等 hidden」
 * 会因为 Playwright 错过短暂的 visible 窗口而误判超时。
 */

import { expect, type Locator, type Page } from "@playwright/test";
import { trpcMutate, trpcQuery, trpcQueryVoid } from "./trpcE2e";
import { consumeAssistBaseline } from "./realChatFixture";
export {
  sendChatMessage,
  countUserMessages,
  countAssistantMessages,
  lastAssistantText,
  enqueueDuringStream,
  expectVisibleQueuedUser,
} from "./realChatFixture";

type AgentListItem = {
  id: string;
  name: string;
  tier: string;
  model: string;
  workspaceId: string | null;
};

let cachedE2eAssistant: AgentListItem | null = null;

export async function listE2eAssistant(): Promise<AgentListItem> {
  if (cachedE2eAssistant) return cachedE2eAssistant;

  const byName = await trpcQuery<{ items: AgentListItem[] }>("agent.list", {
    page: 1,
    pageSize: 100,
    keyword: "assistant",
    tier: "manager",
  });
  const named = byName.items.find((a) => a.name === "assistant" && a.tier === "manager");
  if (named) {
    cachedE2eAssistant = named;
    return named;
  }

  const managers = await trpcQuery<{ items: AgentListItem[] }>("agent.list", {
    page: 1,
    pageSize: 100,
    tier: "manager",
  });
  const manager = managers.items.find((a) => a.tier === "manager");
  if (manager) {
    cachedE2eAssistant = manager;
    return manager;
  }

  const supers = await trpcQuery<{ items: AgentListItem[] }>("agent.list", {
    page: 1,
    pageSize: 100,
    tier: "super",
  });
  const superAgent = supers.items.find((a) => a.tier === "super");
  if (superAgent) {
    cachedE2eAssistant = superAgent;
    return superAgent;
  }
  throw new Error("[e2e] 找不到可用的主 Agent");
}

export async function createE2eSession(title: string): Promise<{ sessionId: string; agentId: string }> {
  const assistant = await listE2eAssistant();
  const created = await trpcMutate<{
    success: boolean;
    data?: { id: string };
    error?: { message?: string };
  }>("session.create", {
    title,
    model: assistant.model,
    agentId: assistant.id,
  });
  const sessionId = created.data?.id;
  if (!created.success || !sessionId) {
    throw new Error(created.error?.message ?? "[e2e] session.create 失败");
  }
  return { sessionId, agentId: assistant.id };
}

/**
 * 每条 mock 测例必须开空会话。禁止 goto /chat 复用上一测残留消息/工具 pill。
 */
export async function openFreshChat(page: Page): Promise<Locator> {
  const { sessionId, agentId } = await createE2eSession(`e2e-fresh-${Date.now()}`);

  await page.goto(`/chat?sessionId=${sessionId}&agentId=${agentId}`);
  await expect(
    page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
  ).toBeVisible({ timeout: 10_000 });
  const input = page.getByTestId("chat-input").first();
  await input.waitFor({ state: "visible", timeout: 10_000 });
  await expect(input).toBeEnabled({ timeout: 10_000 });
  await expect(page.getByTestId("chat-stop")).toHaveCount(0);
  await expect(page.getByTestId("assistant-message-bubble")).toHaveCount(0);
  await expect(page.getByTestId("workspace-select")).toContainText(/E2E 默认空间/, { timeout: 8_000 });
  return input;
}

/** 打开已有会话并等到焦点 pane 绑上 sessionId（禁止只等 chat-input，新对话页也有输入框）。 */
export async function openBoundSession(
  page: Page,
  sessionId: string,
  agentId?: string,
): Promise<void> {
  const qs = new URLSearchParams({ sessionId });
  if (agentId) qs.set("agentId", agentId);
  await page.goto(`/chat?${qs.toString()}`);
  await expect(
    page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
  ).toBeVisible({ timeout: 10_000 });
  await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 10_000 });
}

/** Mock 套件：waitForChatReady = 开空会话，避免全量套件污染。 */
export async function waitForChatReady(page: Page): Promise<Locator> {
  return openFreshChat(page);
}

/**
 * Mock 模式专用：等本轮流式结束。
 * 有 sendChatMessage 基线时等气泡数增加；刷新/切回会话时等 stop 消失且已有助手气泡。
 */
export async function waitForStreamingComplete(page: Page): Promise<void> {
  const withText = page.getByTestId("assistant-message-bubble").filter({ hasText: /\S/ });
  const streamingBubble = page.getByTestId("streaming-assistant-bubble");
  const baseline = consumeAssistBaseline(page);
  const minCount = (baseline?.count ?? 0) + 1;

  await expect
    .poll(
      async () => {
        if ((await page.getByTestId("chat-stop").count()) > 0) return false;
        if ((await streamingBubble.count()) > 0 && (await streamingBubble.first().isVisible().catch(() => false))) {
          return false;
        }
        return (await withText.count()) >= minCount;
      },
      { timeout: 15_000, intervals: [50, 100, 200] },
    )
    .toBe(true);
  await expect(page.getByTestId("chat-stop")).toHaveCount(0);
}

/** 等服务端 hub 不再占线（tRPC switchBranch 在 isRunning 时拒绝）。直打 listRunning，不靠本页 UI。 */
export async function waitForHubIdle(sessionId: string): Promise<void> {
  await expect
    .poll(
      async () => {
        const running = await trpcQueryVoid<{ items: Array<{ sessionId: string }> }>("session.listRunning");
        return running.items.some((item) => item.sessionId === sessionId);
      },
      { timeout: 15_000 },
    )
    .toBe(false);
}

/** 等 hub idle：助手气泡出现 ≠ session 空闲。发送钮可见（不是 chat-stop）即空闲；输入为空时发送钮本身 disabled。 */
export async function waitForSessionIdle(page: Page): Promise<void> {
  await expect(page.getByTestId("chat-send")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("chat-stop")).toHaveCount(0);
  const sessionId = new URL(page.url()).searchParams.get("sessionId");
  if (sessionId) await waitForHubIdle(sessionId);
}

export async function expectToolPill(page: import("@playwright/test").Page, name: string): Promise<void> {
  await expect(page.locator(`[data-testid="tool-pill"][data-tool="${name}"]`)).toBeVisible({
    timeout: 15_000,
  });
}

/** 打开模型菜单，打开思考（标准）。 */
export async function enableThinking(page: Page): Promise<void> {
  const trigger = page.getByTestId("chat-model-menu-trigger").first();
  await trigger.click();
  await expect(page.getByTestId("chat-model-menu")).toBeVisible();
  const thinkingItem = page.getByTestId("chat-model-menu-thinking");
  if ((await thinkingItem.count()) === 0) {
    await page.getByTestId("chat-model-option-deepseek-v4-pro").click();
    await trigger.click();
    await expect(page.getByTestId("chat-model-menu")).toBeVisible();
  }
  await page.getByTestId("chat-model-menu-thinking").click();
  await expect(page.getByTestId("chat-thinking-high")).toBeVisible({ timeout: 8_000 });
  await page.getByTestId("chat-thinking-high").click();
  await page.keyboard.press("Escape");
}

export async function expectToolHint(page: import("@playwright/test").Page, text: string): Promise<void> {
  const hint = page.getByTestId("tool-timing-hint").first();
  await expect(hint).toBeVisible({ timeout: 15_000 });
  await expect(hint).toContainText(text);
}

export async function expectThinkingTimeline(page: Page): Promise<void> {
  await expect(page.getByTestId("thinking-timeline")).toBeVisible({ timeout: 15_000 });
}

export async function expectAssistantAnswer(page: Page, text: string): Promise<void> {
  const { lastAssistantText: readLast } = await import("./realChatFixture");
  await expect
    .poll(async () => readLast(page), { timeout: 10_000, intervals: [50, 100, 200] })
    .toContain(text);
}

/** 从指定用户气泡「从这里另写」（hover 露出操作条；force 防 pointer-events-none 漏点）。 */
export async function forkFromUserMessage(page: Page, index = 0): Promise<void> {
  const bubble = page.getByTestId("user-message-bubble").nth(index);
  await expect(bubble).toBeVisible({ timeout: 8_000 });
  await bubble.hover();
  await bubble.getByTestId("message-fork-from-btn").click({ force: true });
}

/** 从指定助手气泡「从这里另写」。 */
export async function forkFromAssistantMessage(page: Page, index = 0): Promise<void> {
  const bubble = page.getByTestId("assistant-message-bubble").nth(index);
  await expect(bubble).toBeVisible({ timeout: 8_000 });
  await bubble.hover();
  await bubble.getByTestId("message-fork-from-btn").click({ force: true });
}

/** 当前路径最后一条用户消息上点「重试」（hover 露出操作条）。 */
export async function retryLastUserMessage(page: Page): Promise<void> {
  const bubble = page.getByTestId("user-message-bubble").last();
  await expect(bubble).toBeVisible({ timeout: 8_000 });
  await bubble.hover();
  await bubble.getByTestId("message-retry-btn").click({ force: true });
}

/** 当前路径最后一条助手气泡上点「重新生成」。 */
export async function regenerateLastAssistant(page: Page): Promise<void> {
  const bubble = page.getByTestId("assistant-message-bubble").last();
  await expect(bubble).toBeVisible({ timeout: 8_000 });
  await bubble.hover();
  await bubble.getByTestId("message-regenerate-btn").click({ force: true });
}

/** 编辑当前路径最后一条用户消息并保存（只落库，不截断）。 */
export async function editLastUserMessage(page: Page, next: string): Promise<void> {
  const bubble = page.getByTestId("user-message-bubble").last();
  await expect(bubble).toBeVisible({ timeout: 8_000 });
  await bubble.hover();
  await bubble.getByTestId("message-edit-btn").click({ force: true });
  const editor = page.getByTestId("message-markdown-source");
  await expect(editor).toBeVisible({ timeout: 8_000 });
  await editor.fill(next);
  await page.getByTestId("message-edit-save").click();
}

/** 编辑当前路径最后一条助手消息并保存（只落库，不截断、不重跑）。 */
export async function editLastAssistantMessage(page: Page, next: string): Promise<void> {
  const bubble = page.getByTestId("assistant-message-bubble").last();
  await expect(bubble).toBeVisible({ timeout: 8_000 });
  await bubble.hover();
  await bubble.getByTestId("message-edit-btn").click({ force: true });
  const editor = page.getByTestId("message-markdown-source");
  await expect(editor).toBeVisible({ timeout: 8_000 });
  await editor.fill(next);
  await page.getByTestId("message-edit-save").click();
}

export type MockLlmHit = {
  id: string;
  scenario: string;
  lastUserText: string;
  lastSystemText?: string;
  transcriptText?: string;
  status: number;
};

function mockLlmDebugBase(): string {
  return (process.env.MOCK_LLM_URL ?? "http://127.0.0.1:3041/v1").replace(/\/v1\/?$/, "");
}

/** 清空 mock-llm 命中环，避免上一条测例的 branch_summary 让本条假绿。 */
export async function resetMockLlmHits(): Promise<void> {
  const res = await fetch(`${mockLlmDebugBase()}/debug/reset`, { method: "POST" });
  if (!res.ok) throw new Error(`mock-llm /debug/reset HTTP ${res.status}`);
}

/** mock-llm HTTP 命中环。摘要必须是 branch_summary，禁止落 greeting。 */
export async function fetchMockLlmHits(): Promise<MockLlmHit[]> {
  const res = await fetch(`${mockLlmDebugBase()}/debug/hits`);
  if (!res.ok) throw new Error(`mock-llm /debug/hits HTTP ${res.status}`);
  const body = (await res.json()) as { hits?: MockLlmHit[] };
  return Array.isArray(body.hits) ? body.hits : [];
}

/** 确保当前选中的是 E2E 默认 Workspace（其中包含 manager 层级的 assistant Agent）。 */
export async function selectAssistantAgent(page: Page): Promise<void> {
  const selector = page.getByTestId("workspace-select");
  const current = (await selector.textContent())?.trim() ?? "";
  if (/E2E 默认空间/.test(current)) return;

  const assistant = await listE2eAssistant();
  if (!assistant.workspaceId) {
    throw new Error(`[e2e] assistant(${assistant.id}) 没有 workspaceId，无法进入 E2E 默认空间`);
  }

  const currentUrl = new URL(page.url());
  const sessionId = currentUrl.searchParams.get("sessionId");
  const qs = new URLSearchParams({ agentId: assistant.id });
  if (sessionId) qs.set("sessionId", sessionId);
  await page.goto(`/chat?${qs.toString()}`);
  await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
  await expect(page.getByTestId("workspace-select")).toContainText(/E2E 默认空间/, { timeout: 10_000 });
}
