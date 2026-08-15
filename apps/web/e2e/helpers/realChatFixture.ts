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

  if ((await page.getByTestId("chat-stop").count()) > 0) {
    await page.getByTestId("chat-stop").click({ force: true, timeout: 8_000 }).catch(() => {});
    await expect(page.getByTestId("chat-send")).toBeVisible({ timeout: 30_000 });
  }

  const focusedPane = page.getByTestId("chat-session-pane").filter({
    has: page.locator('[data-focused="true"]'),
  });
  const input =
    (await focusedPane.count()) > 0
      ? focusedPane.getByTestId("chat-input")
      : page.getByTestId("chat-input").last();
  await expect(input).toBeEnabled({ timeout: 15_000 });
  await input.fill(text);
  const sendBtn =
    (await focusedPane.count()) > 0
      ? focusedPane.getByTestId("chat-send")
      : page.getByTestId("chat-send").last();
  await expect(sendBtn).toBeEnabled({ timeout: 15_000 });
  await sendBtn.click();
}

export function getAssistBaseline(page: Page): { count: number; text: string; sent: string; pills: number } {
  return assistBaseline.get(page) ?? { count: 0, text: "", sent: "", pills: 0 };
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
  const bubbles = page.getByTestId("assistant-message-bubble");
  const count = await bubbles.count();
  if (count === 0) return "";
  return bubbles.nth(count - 1).innerText();
}
