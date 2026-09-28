/**
 * Chat URL ↔ 焦点：首屏深链必须压过 sessionStorage 旧焦点；前进后退跟查询串。
 */
import { test, expect } from "@playwright/test";
import { SERVER_URL } from "./helpers/trpcE2e";
import {
  createE2eSession,
  listE2eAssistant,
  openBoundSession,
  openFreshChat,
} from "./helpers/mockChatFixture";
import { CHAT_TABS_STORAGE_KEY, serializeChatTabsState } from "../lib/chatTabsState";

test.describe("Chat Mock — URL 深链与焦点", () => {
  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("首屏 sessionStorage 旧焦点不得盖住 URL 深链", async ({ page }) => {
    const stored = await createE2eSession(`e2e-stored-${Date.now()}`);
    const deep = await createE2eSession(`e2e-deep-${Date.now()}`);
    await page.addInitScript(
      ({ key, raw }) => {
        sessionStorage.setItem(key, raw);
      },
      {
        key: CHAT_TABS_STORAGE_KEY,
        raw: serializeChatTabsState({
          openTabIds: [stored.sessionId],
          layout: "single",
          primarySessionId: stored.sessionId,
          secondarySessionId: null,
          focusedPane: "primary",
        }),
      },
    );

    await page.goto(`/chat?sessionId=${deep.sessionId}&agentId=${deep.agentId}`);
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${deep.sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${stored.sessionId}"]`),
    ).toHaveCount(0);
    expect(new URL(page.url()).searchParams.get("sessionId")).toBe(deep.sessionId);
  });

  test("切到另一会话后再后退，焦点回到原 URL 会话", async ({ page }) => {
    await openFreshChat(page);
    const firstId = new URL(page.url()).searchParams.get("sessionId");
    expect(firstId).toBeTruthy();
    const assistant = await listE2eAssistant();
    const other = await createE2eSession(`e2e-back-${Date.now()}`);
    await openBoundSession(page, other.sessionId, assistant.id);
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${other.sessionId}"]`),
    ).toBeVisible();

    await page.goBack();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${firstId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    expect(new URL(page.url()).searchParams.get("sessionId")).toBe(firstId);
  });
});
