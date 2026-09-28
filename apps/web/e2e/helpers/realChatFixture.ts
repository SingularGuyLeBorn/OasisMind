/**
 * 真实 LLM Chat E2E 辅助函数（走完整 UI + SSE，不 mock）
 */

import { expect, type Page, type Locator } from "@playwright/test";

export const DEFAULT_TIMEOUT = 120_000;
export const STREAMING_TIMEOUT = 90_000;

export async function waitForChatReady(page: Page): Promise<Locator> {
  await page.goto("/chat");
  // 分屏时可能有两个 chat-input：取焦点侧 / 首个
  const input = page.getByTestId("chat-input").first();
  await input.waitFor({ state: "visible", timeout: 30_000 });
  await expect(input).toBeEnabled({ timeout: 30_000 });
  const stop = page.getByTestId("chat-stop");
  if ((await stop.count()) > 0) {
    await stop.click({ force: true, timeout: 8_000 }).catch(() => {});
    await expect(page.getByTestId("chat-send")).toBeVisible({ timeout: 30_000 });
  }
  return input;
}

/** DSH / mock E2E：打开可发送的 Chat（当前即 waitForChatReady）。 */
export async function openFreshChat(page: Page): Promise<Locator> {
  return waitForChatReady(page);
}

const assistBaseline = new WeakMap<Page, { count: number; text: string; sent: string; pills: number }>();

export async function sendChatMessage(page: Page, text: string): Promise<void> {
  const assistants = page.getByTestId("assistant-message-bubble");
  const beforeCount = await assistants.count();
  assistBaseline.set(page, {
    count: beforeCount,
    text: beforeCount > 0 ? (await assistants.last().innerText()).trim() : "",
    sent: text,
    pills: await page.getByTestId("tool-pill").count(),
  });

  const focusedPane = page.getByTestId("chat-session-pane").filter({
    has: page.locator('[data-focused="true"]'),
  });
  const pane =
    (await focusedPane.count()) > 0
      ? focusedPane
      : page.getByTestId("chat-session-pane").last();
  // 只停本 pane 的 chat-stop。禁止回退点全局 stop：新建对话未切焦点时会误停后台父流。
  const stopInPane = pane.getByTestId("chat-stop");
  if ((await stopInPane.count()) > 0) {
    await stopInPane.click({ force: true, timeout: 8_000 }).catch(() => {});
    await expect(pane.getByTestId("chat-send")).toBeVisible({ timeout: 30_000 });
  }
  const input = pane.getByTestId("chat-input");
  await expect(input).toBeEnabled({ timeout: 15_000 });
  await input.fill(text);
  const sendBtn = pane.getByTestId("chat-send");
  await expect(sendBtn).toBeEnabled({ timeout: 15_000 });
  await sendBtn.click();
}

export function getAssistBaseline(page: Page): { count: number; text: string; sent: string; pills: number } {
  return assistBaseline.get(page) ?? { count: 0, text: "", sent: "", pills: 0 };
}

/** 取走本次 sendChatMessage 的基线；没有则返回 undefined（刷新/切会话续跑路径）。 */
export function consumeAssistBaseline(
  page: Page,
): { count: number; text: string; sent: string; pills: number } | undefined {
  const value = assistBaseline.get(page);
  if (value) assistBaseline.delete(page);
  return value;
}

export async function waitForStreamingComplete(page: Page): Promise<void> {
  const streamingBubble = page.getByTestId("streaming-assistant-bubble");
  const assistantBubbles = page.getByTestId("assistant-message-bubble");
  const start = Date.now();
  const prevCount = await assistantBubbles.count();
  const prevText = prevCount > 0 ? await assistantBubbles.nth(prevCount - 1).innerText() : "";

  const isResponseReady = async () => {
    const currentCount = await assistantBubbles.count();
    if (currentCount > prevCount) return true;
    if (currentCount > 0 && currentCount >= prevCount) {
      const currentText = await assistantBubbles.nth(currentCount - 1).innerText();
      if (currentText !== prevText && currentText.trim().length > 0) return true;
    }
    return false;
  };

  while (Date.now() - start < STREAMING_TIMEOUT) {
    // 正常路径：流式气泡出现后等待其消失，再确认最终消息已落地
    const bubbleCount = await streamingBubble.count();
    if (bubbleCount > 0) {
      const visible = await streamingBubble.first().isVisible().catch(() => false);
      if (visible) {
        await streamingBubble.waitFor({ state: "hidden", timeout: STREAMING_TIMEOUT });
        continue;
      }
    }

    // 极快响应：流式气泡可能在我们检查前就已经完成，以 assistant 消息出现或内容变化视为结束
    if (await isResponseReady()) return;

    await page.waitForTimeout(100);
  }
  throw new Error("流式响应未在预期时间内完成");
}

export function countUserMessages(page: Page): Promise<number> {
  return page.getByTestId("user-message-bubble").count();
}

export function countAssistantMessages(page: Page): Promise<number> {
  return page.getByTestId("assistant-message-bubble").count();
}

export async function lastAssistantText(page: Page): Promise<string> {
  const withText = page.getByTestId("assistant-message-bubble").filter({ hasText: /\S/ });
  const count = await withText.count();
  if (count === 0) return "";
  return (await withText.last().innerText()).trim();
}

/**
 * 展开折叠的待发面板后断言可见 user 队列项。
 * 默认折叠只显示「待发消息 N」，DOM 里没有 chat-queue-item-*。
 */
export async function expectVisibleQueuedUser(page: Page): Promise<void> {
  const panel = page.getByTestId("chat-queue-panel");
  await expect(panel).toBeVisible({ timeout: 8_000 });
  await expect(panel).toContainText("待发消息");
  const expand = page.getByTestId("chat-queue-expand");
  const expandByLabel = panel.getByRole("button").filter({ hasText: "待发消息" });
  if ((await expand.count()) > 0) {
    await expand.click();
  } else if ((await expandByLabel.count()) > 0) {
    await expandByLabel.click();
  }
  await expect(page.getByTestId("chat-queue-item-user").first()).toBeVisible({ timeout: 5_000 });
}

/**
 * 流式占用时入队：发送钮已是 chat-stop，入队走 Ctrl+Enter（产品路径）。
 * 断言仍在流式中且出现可见队列项（INV-Send：占用必须 visible）。
 */
export async function enqueueDuringStream(
  page: Page,
  text: string,
  opts?: { stopTimeoutMs?: number },
): Promise<void> {
  await expect(page.getByTestId("chat-stop")).toBeVisible({
    timeout: opts?.stopTimeoutMs ?? 15_000,
  });
  const input = page.getByTestId("chat-input").first();
  await input.fill(text);
  await expect(page.getByTestId("chat-stop")).toBeVisible();
  await input.press("Control+Enter");
  await expect(input).toHaveValue("");
  await expectVisibleQueuedUser(page);
  await expect(page.getByTestId("chat-stop")).toBeVisible();
}
