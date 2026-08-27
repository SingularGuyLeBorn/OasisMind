/**
 * Mock LLM Chat E2E 辅助函数
 *
 * 与 realChatFixture 复用同一套 UI 操作，但额外提供 mock 场景断言封装。
 * 注意：waitForStreamingComplete 在此覆盖为「等 assistant 气泡出现」，
 * 因为 Mock 流式极快（~240ms），realChatFixture 的「先等 streaming visible 再等 hidden」
 * 会因为 Playwright 错过短暂的 visible 窗口而误判超时。
 */

import { expect, type Locator, type Page } from "@playwright/test";
import { trpcMutate, trpcQuery } from "./trpcE2e";
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

async function listE2eAssistant(): Promise<AgentListItem> {
  const byName = await trpcQuery<{ items: AgentListItem[] }>("agent.list", {
    page: 1,
    pageSize: 100,
    keyword: "assistant",
    tier: "manager",
  });
  const named = byName.items.find((a) => a.name === "assistant" && a.tier === "manager");
  if (named) return named;

  const managers = await trpcQuery<{ items: AgentListItem[] }>("agent.list", {
    page: 1,
    pageSize: 100,
    tier: "manager",
  });
  const manager = managers.items.find((a) => a.tier === "manager");
  if (manager) return manager;

  const supers = await trpcQuery<{ items: AgentListItem[] }>("agent.list", {
    page: 1,
    pageSize: 100,
    tier: "super",
  });
  const superAgent = supers.items.find((a) => a.tier === "super");
  if (superAgent) return superAgent;
  throw new Error("[e2e] 找不到可用的主 Agent");
}

/**
 * 每条 mock 测例必须开空会话。禁止 goto /chat 复用上一测残留消息/工具 pill。
 */
export async function openFreshChat(page: Page): Promise<Locator> {
  const assistant = await listE2eAssistant();
  const created = await trpcMutate<{
    success: boolean;
    data?: { id: string };
    error?: { message?: string };
  }>("session.create", {
    title: `e2e-fresh-${Date.now()}`,
    model: assistant.model,
    agentId: assistant.id,
  });
  const sessionId = created.data?.id;
  if (!created.success || !sessionId) {
    throw new Error(created.error?.message ?? "[e2e] openFreshChat session.create 失败");
  }

  await page.goto(`/chat?sessionId=${sessionId}&agentId=${assistant.id}`);
  const input = page.getByTestId("chat-input").first();
  await input.waitFor({ state: "visible", timeout: 30_000 });
  await expect(input).toBeEnabled({ timeout: 30_000 });
  await expect(page.getByTestId("chat-stop")).toHaveCount(0);
  await expect(page.getByTestId("assistant-message-bubble")).toHaveCount(0);
  await expect(page.getByTestId("workspace-select")).toContainText(/E2E 默认空间/, { timeout: 10_000 });
  return input;
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
  const assistantBubble = page.getByTestId("assistant-message-bubble");
  const streamingBubble = page.getByTestId("streaming-assistant-bubble");
  const baseline = consumeAssistBaseline(page);

  if (baseline) {
    await expect
      .poll(() => assistantBubble.count(), { timeout: 30_000, intervals: [200, 500, 1000] })
      .toBeGreaterThan(baseline.count);
  } else {
    const stop = page.getByTestId("chat-stop");
    if ((await stop.count()) > 0 || (await streamingBubble.count()) > 0) {
      await streamingBubble.waitFor({ state: "hidden", timeout: 30_000 }).catch(() => {});
      await expect(stop).toHaveCount(0, { timeout: 30_000 });
    }
    await expect
      .poll(() => assistantBubble.count(), { timeout: 30_000, intervals: [200, 500, 1000] })
      .toBeGreaterThan(0);
  }
  await streamingBubble.waitFor({ state: "hidden", timeout: 10_000 }).catch(() => {});
  await expect(page.getByTestId("chat-stop")).toHaveCount(0);
}

/** 等 hub idle：助手气泡出现 ≠ session 空闲。发送钮可见（不是 chat-stop）即空闲；输入为空时发送钮本身 disabled。 */
export async function waitForSessionIdle(page: Page): Promise<void> {
  await expect(page.getByTestId("chat-send")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("chat-stop")).toHaveCount(0);
}

export async function expectToolPill(page: import("@playwright/test").Page, name: string): Promise<void> {
  await expect(page.getByTestId("tool-pill").filter({ hasText: name })).toBeVisible({ timeout: 15_000 });
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
  const last = await (await import("./realChatFixture")).lastAssistantText(page);
  expect(last).toContain(text);
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
