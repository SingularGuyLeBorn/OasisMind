/**
 * 同会话对话分支：从这里另写 + 树条换叶。
 * 走 mock-llm HTTP（MOCK_LLM_URL），摘要场景 branch_summary，禁止 spy。
 * 推拉：换叶后开着的页 / 另一标签自己变；刷新仍是当前叶。禁止用 F5 当修复。
 */

import { test, expect, type Page } from "@playwright/test";
import { SERVER_URL, trpcQuery, trpcMutate, trpcQueryVoid } from "./helpers/trpcE2e";
import {
  waitForChatReady,
  openBoundSession,
  sendChatMessage,
  waitForStreamingComplete,
  waitForSessionIdle,
  waitForHubIdle,
  forkFromUserMessage,
  forkFromAssistantMessage,
  retryLastUserMessage,
  regenerateLastAssistant,
  editLastUserMessage,
  editLastAssistantMessage,
  fetchMockLlmHits,
  resetMockLlmHits,
  expectAssistantAnswer,
  expectToolPill,
  enqueueDuringStream,
  enableThinking,
  expectThinkingTimeline,
} from "./helpers/mockChatFixture";
import { saveLastAssistantAsPost } from "./helpers/partialScenarioUi";

const GREETING = "你好！我是 Mock LLM，正在为你服务。";
const SEARCH_PROMPT = "搜索 OasisMind 并一句话介绍";
const SEARCH_ANSWER = "OasisMind 是一个本地优先";
const MOCK_SUMMARY = "【Mock 旁路摘要】";
const FOLLOW_UP = "你好，请简短回复";
const SUMMARY_FAIL_TOKEN = "OM-MOCK-BRANCH-SUMMARY-FAIL";

type ChatListPage = {
  items: Array<{
    id?: string;
    parentId?: string | null;
    kind?: string | null;
    content: string;
    role: string;
    label?: string | null;
  }>;
};
type SessionTree = {
  activeLeafId: string | null;
  nodes: Array<{
    id: string;
    kind: string | null;
    role: string;
    contentPreview: string;
  }>;
  children: Record<string, string[]>;
};
type InspectTurn = {
  lastUserPreview: string | null;
  pathMessageCount: number;
  activeLeafId: string | null;
};

async function listChat(sessionId: string): Promise<ChatListPage> {
  return trpcQuery<ChatListPage>("message.listForChat", { sessionId, limit: 50 });
}

async function waitForMockBranchSummaryHit(): Promise<void> {
  await expect
    .poll(
      async () => {
        const hits = await fetchMockLlmHits();
        return hits.some(
          (h) =>
            h.scenario === "branch_summary" &&
            h.lastUserText.includes("请摘要以下被切换离开的对话分支"),
        );
      },
      { timeout: 15_000 },
    )
    .toBe(true);
}

async function countBranchSummaries(sessionId: string): Promise<number> {
  const all = await trpcQuery<ChatListPage>("message.listForChat", {
    sessionId,
    limit: 50,
    tree: true,
  });
  return all.items.filter((m) => m.kind === "branch_summary").length;
}

async function waitForAbandonedGone(sessionId: string, abandoned: string, keepUser: string): Promise<void> {
  await expect
    .poll(
      async () => {
        const chat = await listChat(sessionId);
        const hasSummary = chat.items.some((m) => m.content.includes(MOCK_SUMMARY));
        const hasAbandoned = chat.items.some((m) => m.content.includes(abandoned));
        const hasUser = chat.items.some((m) => m.role === "user" && m.content.includes(keepUser));
        return hasSummary && hasUser && !hasAbandoned;
      },
      { timeout: 20_000 },
    )
    .toBe(true);
}

async function pauseStandingGoal(sessionId: string): Promise<void> {
  await trpcMutate("session.pauseGoal", { sessionId });
  await expect
    .poll(async () => {
      const dumped = await trpcQuery<{ goal: { status: string } }>("session.getGoal", { sessionId });
      return dumped.goal.status;
    })
    .toBe("paused");
}

function llmChatHits(hits: Awaited<ReturnType<typeof fetchMockLlmHits>>) {
  return hits.filter((h) => h.scenario !== "branch_summary");
}

function expectTranscriptOmits(
  hits: Awaited<ReturnType<typeof fetchMockLlmHits>>,
  forbidden: string[],
): void {
  for (const h of hits) {
    const t = h.transcriptText ?? "";
    for (const needle of forbidden) {
      expect(t).not.toContain(needle);
    }
  }
}

/** 树条必须切到子树叶（通常是助手），不能停在分叉上的用户气泡。 */
async function expectActiveLeaf(
  sessionId: string,
  opts: { role: string; preview: string },
): Promise<void> {
  await expect
    .poll(
      async () => {
        const tree = await trpcQuery<SessionTree>("session.tree", { sessionId });
        const leaf = tree.nodes.find((n) => n.id === tree.activeLeafId);
        if (!leaf) return "no-leaf";
        if (leaf.role !== opts.role) return `role:${leaf.role}`;
        if (!leaf.contentPreview.includes(opts.preview)) return `preview:${leaf.contentPreview}`;
        return "ok";
      },
      { timeout: 15_000 },
    )
    .toBe("ok");
}

function pane(page: Page) {
  return page.getByTestId("chat-session-pane");
}

async function expectSummaryHasNoFork(page: Page): Promise<void> {
  await expect(page.getByTestId("branch-summary-card").getByTestId("message-fork-from-btn")).toHaveCount(0);
}

async function expectSessionIdUnchanged(page: Page, sessionId: string): Promise<void> {
  expect(new URL(page.url()).searchParams.get("sessionId")).toBe(sessionId);
}

async function expectNotACopiedSession(sessionId: string): Promise<void> {
  const listed = await trpcQuery<{ items: Array<{ id: string }> }>("session.list", {
    page: 1,
    pageSize: 100,
  });
  expect(listed.items.filter((s) => s.id === sessionId)).toHaveLength(1);
}

async function expectAssistantParentedToUser(
  sessionId: string,
  userNeedle: string,
  assistantNeedle: string,
): Promise<void> {
  const all = await trpcQuery<ChatListPage>("message.listForChat", {
    sessionId,
    limit: 50,
    tree: true,
  });
  const user = all.items.find((m) => m.role === "user" && m.content.includes(userNeedle));
  expect(user?.id).toBeTruthy();
  const kids = all.items.filter((m) => m.parentId === user!.id && m.role === "assistant");
  expect(kids.some((m) => m.content.includes(assistantNeedle))).toBe(true);
}

/** 新测例共用：你好 → 另写 → 搜索，树条出现。 */
async function seedGreetingSearchFork(page: Page): Promise<string> {
  await waitForChatReady(page);
  const sessionId = new URL(page.url()).searchParams.get("sessionId");
  expect(sessionId).toBeTruthy();
  await sendChatMessage(page, "你好");
  await waitForStreamingComplete(page);
  await expectAssistantAnswer(page, GREETING);
  await waitForSessionIdle(page);
  await forkFromUserMessage(page, 0);
  await waitForAbandonedGone(sessionId!, GREETING, "你好");
  await expect(
    pane(page).getByTestId("assistant-message-bubble").filter({ hasText: GREETING }),
  ).toHaveCount(0, { timeout: 15_000 });
  await sendChatMessage(page, SEARCH_PROMPT);
  await waitForStreamingComplete(page);
  await expectAssistantAnswer(page, SEARCH_ANSWER);
  await waitForSessionIdle(page);
  await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });
  return sessionId!;
}

test.describe("Chat Mock — 对话分支", () => {
  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("线性一轮：没有树条", async ({ page }) => {
    await waitForChatReady(page);
    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-session-tree-bar")).toHaveCount(0);
  });

  test("从这里另写后发新问，开着的页换叶；刷新不丢当前枝", async ({ page }) => {
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    await resetMockLlmHits();
    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");
    await waitForMockBranchSummaryHit();

    await expect(page.getByText(GREETING)).toHaveCount(0, { timeout: 15_000 });
    await expect(page.getByTestId("user-message-bubble")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("branch-summary-card")).toBeVisible({ timeout: 10_000 });
    await expectSummaryHasNoFork(page);
    await expectSessionIdUnchanged(page, sessionId!);
    await expect(page.getByTestId("branch-summary-preview")).toContainText(MOCK_SUMMARY);
    await expectActiveLeaf(sessionId!, { role: "user", preview: "你好" });
    await page.getByTestId("branch-summary-toggle").click();
    await expect(page.getByTestId("branch-summary-body")).toContainText(MOCK_SUMMARY);
    await expectActiveLeaf(sessionId!, { role: "user", preview: "你好" });
    await page.getByTestId("branch-summary-toggle").click();
    await expect(page.getByTestId("branch-summary-preview")).toBeVisible();
    await expectActiveLeaf(sessionId!, { role: "user", preview: "你好" });

    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);

    const chatAfterSearch = await listChat(sessionId!);
    expect(chatAfterSearch.items.some((m) => m.content.includes(GREETING))).toBe(false);
    const searchHits = await fetchMockLlmHits();
    const searchLlm = llmChatHits(searchHits);
    expect(
      searchLlm.some((h) => h.scenario === "web_search" || h.scenario === "web_search_final"),
    ).toBe(true);
    expectTranscriptOmits(searchLlm, [GREETING]);
    expect(searchHits.some((h) => h.scenario === "greeting")).toBe(false);

    const inspectSearch = await trpcQuery<InspectTurn>("session.inspectTurn", { sessionId });
    expect(inspectSearch.lastUserPreview).toContain("搜索 OasisMind");

    const bar = page.getByTestId("chat-session-tree-bar");
    await expect(bar).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(2);

    const tree = await trpcQuery<SessionTree>("session.tree", { sessionId });
    const forkParents = Object.keys(tree.children).filter((pid) => {
      const kids = (tree.children[pid] ?? []).filter((id) => {
        const n = tree.nodes.find((x) => x.id === id);
        return n && n.kind !== "branch_summary";
      });
      return kids.length >= 2;
    });
    expect(forkParents.length).toBeGreaterThanOrEqual(1);

    const activeBtn = page.locator('[data-testid="chat-tree-branch-btn"][data-active="true"]');
    await expect(activeBtn).toHaveCount(1);
    await expect(activeBtn).toBeDisabled();
    await activeBtn.click({ force: true });
    await expect(page.getByText(SEARCH_ANSWER)).toBeVisible();
    await expect(page.getByText(GREETING)).toHaveCount(0);

    const inactive = page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]');
    await expect(inactive).toHaveCount(1);
    await inactive.click();

    await expect(page.getByText(GREETING)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible();

    const inspectGreet = await trpcQuery<InspectTurn>("session.inspectTurn", { sessionId });
    expect(inspectGreet.lastUserPreview).toContain("你好");
    expect(inspectGreet.lastUserPreview).not.toContain("搜索 OasisMind");

    const greetPath = await listChat(sessionId!);
    expect(greetPath.items.some((m) => m.content.includes(GREETING))).toBe(true);
    expect(greetPath.items.some((m) => m.content.includes(SEARCH_ANSWER))).toBe(false);
    const greetTree = await trpcQuery<ChatListPage>("message.listForChat", {
      sessionId,
      limit: 50,
      tree: true,
    });
    expect(greetTree.items.some((m) => m.content.includes(SEARCH_ANSWER))).toBe(true);
    await expectActiveLeaf(sessionId!, { role: "assistant", preview: GREETING });

    const searchBranchBtn = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ });
    await expect(searchBranchBtn).toBeVisible();
    await searchBranchBtn.click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: SEARCH_PROMPT })).toBeVisible();
    await expectActiveLeaf(sessionId!, { role: "assistant", preview: SEARCH_ANSWER });
    const inspectSearchTip = await trpcQuery<InspectTurn>("session.inspectTurn", { sessionId });
    expect(inspectSearchTip.lastUserPreview).toContain("搜索 OasisMind");

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(SEARCH_ANSWER)).toHaveCount(0);

    await resetMockLlmHits();
    await sendChatMessage(page, FOLLOW_UP);
    await waitForStreamingComplete(page);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible();
    await expect(page.getByText(SEARCH_ANSWER)).toHaveCount(0);
    const followHits = llmChatHits(await fetchMockLlmHits());
    expectTranscriptOmits(followHits, [SEARCH_ANSWER, SEARCH_PROMPT, MOCK_SUMMARY]);
    expect(followHits.some((h) => (h.transcriptText ?? "").includes(GREETING))).toBe(true);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expectAssistantAnswer(page, GREETING);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible();
    await expect(page.getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible();
  });

  test("从助手气泡另写：放弃后续追问，摘要走 mock-llm", async ({ page }) => {
    test.setTimeout(120_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);

    await resetMockLlmHits();
    await forkFromAssistantMessage(page, 0);
    await waitForAbandonedGone(sessionId!, SEARCH_ANSWER, "你好");
    await waitForMockBranchSummaryHit();

    await expect(page.getByText(SEARCH_ANSWER)).toHaveCount(0, { timeout: 15_000 });
    await expect(page.getByText(GREETING)).toBeVisible();
    await expect(page.getByTestId("branch-summary-card")).toBeVisible();

    await resetMockLlmHits();
    await sendChatMessage(page, FOLLOW_UP);
    await waitForStreamingComplete(page);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible();
    await expect(page.getByText(SEARCH_ANSWER)).toHaveCount(0);
    const afterForkHits = llmChatHits(await fetchMockLlmHits());
    expectTranscriptOmits(afterForkHits, [SEARCH_ANSWER, SEARCH_PROMPT, MOCK_SUMMARY]);

    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });
    const searchBranchBtn = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ });
    await expect(searchBranchBtn).toBeVisible();
    await searchBranchBtn.click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expectToolPill(page, "web_search");
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0);
    await expectActiveLeaf(sessionId!, { role: "assistant", preview: SEARCH_ANSWER });

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expectToolPill(page, "web_search");
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expect(page.locator('[data-testid="tool-pill"][data-tool="web_search"]')).toHaveCount(0);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expectAssistantAnswer(page, GREETING);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible();
    await expect(page.getByText(SEARCH_ANSWER)).toHaveCount(0);
  });

  test("另一标签开着同一会话，另写后自己换叶（不 F5）", async ({ page, context }) => {
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();
    const url = page.url();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByText(GREETING)).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page2);

    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");

    await expect(page2.getByText(GREETING)).toHaveCount(0, { timeout: 15_000 });
    await expect(page2.getByTestId("user-message-bubble")).toBeVisible();
    await expect(page2.getByTestId("branch-summary-card")).toBeVisible({ timeout: 15_000 });

    await page2.reload();
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByText(GREETING)).toHaveCount(0, { timeout: 15_000 });
    await expect(page2.getByTestId("user-message-bubble")).toBeVisible();
    await expect(page2.getByTestId("branch-summary-card")).toBeVisible({ timeout: 15_000 });
    await page2.close();
  });

  test("另一标签点另写，本页自己换叶（不 F5）", async ({ page, context }) => {
    test.setTimeout(90_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();
    const url = page.url();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByText(GREETING)).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page2);

    await forkFromUserMessage(page2, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");

    await expect(page.getByText(GREETING)).toHaveCount(0, { timeout: 15_000 });
    await expect(page.getByTestId("user-message-bubble")).toBeVisible();
    await expect(page.getByTestId("branch-summary-card")).toBeVisible({ timeout: 15_000 });
    await expect(page2.getByText(GREETING)).toHaveCount(0);
    await expectSessionIdUnchanged(page, sessionId!);
    await page2.close();
  });

  test("从这里另写失败：toast「换叶失败」，气泡不换", async ({ page }) => {
    await waitForChatReady(page);
    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    await page.route("**/api/trpc/session.switchBranch**", (route) => route.abort("failed"));

    await forkFromUserMessage(page, 0);
    await expect(page.getByTestId("chat-toast")).toContainText("换叶失败", { timeout: 8_000 });
    await expect(page.getByText(GREETING)).toBeVisible();
  });

  test("来回切两叉：旁路摘要条数不涨（复用）", async ({ page }) => {
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");
    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });

    const inactive = page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]');
    await expect(inactive).toHaveCount(1);
    await inactive.click();
    await expect(page.getByText(GREETING)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(SEARCH_ANSWER)).toHaveCount(0);

    const afterFirstSwitch = await countBranchSummaries(sessionId!);
    expect(afterFirstSwitch).toBeGreaterThanOrEqual(1);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByText(SEARCH_ANSWER)).toBeVisible({ timeout: 15_000 });
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByText(GREETING)).toBeVisible({ timeout: 15_000 });

    expect(await countBranchSummaries(sessionId!)).toBe(afterFirstSwitch);
  });

  test("树条换叶失败：条上「换叶失败」，当前枝不丢", async ({ page }) => {
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);
    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");
    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });

    await page.route("**/api/trpc/session.switchBranch**", (route) => route.abort("failed"));
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("chat-tree-switch-error")).toHaveText("换叶失败", { timeout: 8_000 });
    await expect(page.getByText(SEARCH_ANSWER)).toBeVisible();
    await expect(page.getByText(GREETING)).toHaveCount(0);
  });

  test("当前叶「从这里另写」幂等：不摘要、不出现树条", async ({ page }) => {
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    await resetMockLlmHits();
    const switchWait = page.waitForResponse(
      (r) => r.url().includes("session.switchBranch") && r.request().method() === "POST",
      { timeout: 8_000 },
    );
    await forkFromAssistantMessage(page, 0);
    await switchWait;

    await expect(page.getByText(GREETING)).toBeVisible();
    await expect(page.getByTestId("branch-summary-card")).toHaveCount(0);
    await expect(page.getByTestId("chat-session-tree-bar")).toHaveCount(0);
    const chat = await listChat(sessionId!);
    expect(chat.items.some((m) => m.content.includes(GREETING))).toBe(true);
    expect(chat.items.some((m) => m.content.includes(MOCK_SUMMARY))).toBe(false);
    expect((await fetchMockLlmHits()).some((h) => h.scenario === "branch_summary")).toBe(false);
  });

  test("嵌套两处分叉：树条出现 ≥4 个枝按钮", async ({ page }) => {
    test.setTimeout(120_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");
    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByText(GREETING)).toBeVisible({ timeout: 15_000 });

    await sendChatMessage(page, FOLLOW_UP);
    await waitForStreamingComplete(page);
    await waitForSessionIdle(page);

    await resetMockLlmHits();
    const followUpUser = page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP });
    await expect(followUpUser).toBeVisible();
    await followUpUser.hover();
    await followUpUser.getByTestId("message-fork-from-btn").click({ force: true });
    await waitForMockBranchSummaryHit();
    await waitForSessionIdle(page);

    await sendChatMessage(page, "你好");
    await waitForSessionIdle(page);

    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(4);

    const innerGroup = page
      .getByTestId("chat-session-tree-bar")
      .locator("span")
      .filter({ has: page.getByTestId("chat-tree-branch-btn") })
      .filter({ hasText: FOLLOW_UP });
    const innerInactive = innerGroup.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]');
    await expect(innerInactive).toHaveCount(1);
    await innerInactive.click();
    await expect
      .poll(async () => (await trpcQuery<InspectTurn>("session.inspectTurn", { sessionId })).lastUserPreview, {
        timeout: 15_000,
      })
      .toContain(FOLLOW_UP);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible();
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(4, { timeout: 15_000 });

    const tree = await trpcQuery<SessionTree>("session.tree", { sessionId });
    const forkParents = Object.keys(tree.children).filter((pid) => {
      const kids = (tree.children[pid] ?? []).filter((id) => {
        const n = tree.nodes.find((x) => x.id === id);
        return n && n.kind !== "branch_summary";
      });
      return kids.length >= 2;
    });
    expect(forkParents.length).toBeGreaterThanOrEqual(2);

    const searchBranchBtn = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ });
    await expect(searchBranchBtn).toBeVisible();
    if ((await searchBranchBtn.getAttribute("data-active")) !== "true") {
      await searchBranchBtn.click();
    }
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(4, { timeout: 15_000 });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0);
  });

  test("树条换叶：另一标签自己变（不 F5）", async ({ page, context }) => {
    test.setTimeout(120_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();
    const url = page.url();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);
    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");
    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });

    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByText(SEARCH_ANSWER)).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page2);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByText(GREETING)).toBeVisible({ timeout: 15_000 });

    await expect(page2.getByText(GREETING)).toBeVisible({ timeout: 15_000 });
    await expect(page2.getByText(SEARCH_ANSWER)).toHaveCount(0);

    await page2.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page2.getByText(SEARCH_ANSWER)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(SEARCH_ANSWER)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(GREETING)).toHaveCount(0);
    await expectActiveLeaf(sessionId!, { role: "assistant", preview: SEARCH_ANSWER });

    await page2.reload();
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByText(SEARCH_ANSWER)).toBeVisible({ timeout: 15_000 });
    await expect(page2.getByText(GREETING)).toHaveCount(0);
    await page2.close();
  });

  test("另写后重试当前问：另一叉还在，开着的页自己更新", async ({ page, context }) => {
    test.setTimeout(120_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();
    const url = page.url();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);
    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");
    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByText(GREETING)).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page);

    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });

    await resetMockLlmHits();
    await retryLastUserMessage(page);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 20_000,
    });
    await expectAssistantAnswer(page, GREETING);
    expect((await fetchMockLlmHits()).some((h) => h.scenario === "greeting")).toBe(true);
    await expect(page.getByTestId("branch-summary-card").first()).toBeVisible();

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(2, { timeout: 15_000 });
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByText(SEARCH_ANSWER)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(GREETING)).toHaveCount(0);

    const all = await trpcQuery<ChatListPage>("message.listForChat", {
      sessionId,
      limit: 50,
      tree: true,
    });
    expect(all.items.some((m) => m.content.includes(SEARCH_ANSWER))).toBe(true);
    await page2.close();
  });

  test("另写后重新生成：另一叉还在，开着的页自己更新", async ({ page, context }) => {
    test.setTimeout(120_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();
    const url = page.url();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);
    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");
    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByText(GREETING)).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page);

    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });

    await resetMockLlmHits();
    await regenerateLastAssistant(page);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 20_000,
    });
    await expectAssistantAnswer(page, GREETING);
    expect((await fetchMockLlmHits()).some((h) => h.scenario === "greeting")).toBe(true);
    await expect(page.getByTestId("branch-summary-card").first()).toBeVisible();
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(2);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(2, { timeout: 15_000 });
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByText(SEARCH_ANSWER)).toBeVisible({ timeout: 15_000 });
    const all = await trpcQuery<ChatListPage>("message.listForChat", {
      sessionId,
      limit: 50,
      tree: true,
    });
    expect(all.items.some((m) => m.content.includes(SEARCH_ANSWER))).toBe(true);
    await page2.close();
  });

  test("另写后编辑用户消息：不截断旁路，开着的页自己更新", async ({ page, context }) => {
    test.setTimeout(120_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();
    const url = page.url();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);
    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");
    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByText(GREETING)).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page);

    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByText(GREETING)).toBeVisible({ timeout: 15_000 });

    await editLastUserMessage(page, "你好（编辑）");
    await expect(pane(page).getByTestId("user-message-bubble").filter({ hasText: "你好（编辑）" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page2).getByTestId("user-message-bubble").filter({ hasText: "你好（编辑）" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(2, { timeout: 15_000 });
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByText(SEARCH_ANSWER)).toBeVisible({ timeout: 15_000 });
    await page2.close();
  });

  test("Goal revision 切回锚点叶：旁路摘要走 mock-llm，开着的页自己更新", async ({ page, context }) => {
    test.setTimeout(180_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();
    const url = page.url();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    await trpcMutate("session.setGoal", {
      sessionId,
      text: "写一篇关于猫的文章",
      mode: "goal",
      startNow: false,
    });
    await expect(page.getByTestId("chat-goal-bar")).toContainText("猫", { timeout: 15_000 });
    await pauseStandingGoal(sessionId!);
    await waitForSessionIdle(page);

    await sendChatMessage(page, FOLLOW_UP);
    await waitForStreamingComplete(page);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible({
      timeout: 15_000,
    });

    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page2);

    await resetMockLlmHits();
    await sendChatMessage(page, "改成狗，不要猫");
    await waitForSessionIdle(page);
    await expect(page.getByText("现行目标是狗").first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("chat-goal-bar")).toContainText("狗");
    await expect(page.getByTestId("chat-goal-bar")).not.toContainText("猫");
    await waitForAbandonedGone(sessionId!, FOLLOW_UP, "改成狗，不要猫");
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "改成狗，不要猫" })).toBeVisible();
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0, {
      timeout: 15_000,
    });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("branch-summary-card")).toBeVisible({ timeout: 15_000 });
    const inspectRev = await trpcQuery<InspectTurn>("session.inspectTurn", { sessionId });
    expect(inspectRev.lastUserPreview).toContain("改成狗");
    expect(inspectRev.lastUserPreview).not.toContain(FOLLOW_UP);
    await expect
      .poll(
        async () => {
          const hits = await fetchMockLlmHits();
          return hits.some((h) => {
            if (h.scenario !== "branch_summary") return false;
            const blob = `${h.lastSystemText ?? ""}\n${h.transcriptText ?? ""}`;
            return blob.includes("Intent tombstone") && blob.includes("猫");
          });
        },
        { timeout: 15_000 },
      )
      .toBe(true);

    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: "现行目标是狗" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page2.getByTestId("chat-goal-bar")).toContainText("狗");
    await expect(page2.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0, {
      timeout: 15_000,
    });
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible();

    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });
    const followBranch = page.getByTestId("chat-tree-branch-btn").filter({ hasText: FOLLOW_UP });
    await expect(followBranch).toBeVisible();
    if ((await followBranch.getAttribute("data-active")) !== "true") {
      await followBranch.click();
    }
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "改成狗，不要猫" })).toHaveCount(0);
    await expect(page.getByTestId("chat-goal-bar")).toContainText("狗");
    await expect(page.getByTestId("chat-goal-bar")).not.toContainText("猫");
    await expect(page2.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page2.getByTestId("chat-goal-bar")).toContainText("狗");
    await expect(page2.getByTestId("chat-goal-bar")).not.toContainText("猫");

    await page.reload();
    await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "改成狗，不要猫" })).toHaveCount(0);
    await expect(page.getByTestId("chat-goal-bar")).toContainText("狗");
    await expect(page.getByTestId("chat-goal-bar")).not.toContainText("猫");
    const inspectFollow = await trpcQuery<InspectTurn>("session.inspectTurn", { sessionId });
    expect(inspectFollow.lastUserPreview).toContain(FOLLOW_UP);
    expect(inspectFollow.lastUserPreview).not.toContain("改成狗");

    await pauseStandingGoal(sessionId!);
    await resetMockLlmHits();
    await sendChatMessage(page, "你好");
    await waitForSessionIdle(page);
    await expect
      .poll(
        async () => {
          const hits = llmChatHits(await fetchMockLlmHits());
          expectTranscriptOmits(hits, ["改成狗", "现行目标是狗"]);
          return hits.some((h) => (h.transcriptText ?? "").includes(FOLLOW_UP));
        },
        { timeout: 15_000 },
      )
      .toBe(true);
    await expect(page.getByTestId("chat-goal-bar")).toContainText("狗");
    await expect(page.getByTestId("chat-goal-bar")).not.toContainText("猫");

    const dogBranch = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /改成狗/ });
    await expect(dogBranch).toBeVisible();
    await dogBranch.click();
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "改成狗，不要猫" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0);
    await expectActiveLeaf(sessionId!, { role: "assistant", preview: "现行目标是狗" });
    await expect(page.getByTestId("chat-goal-bar")).toContainText("狗");
    await expect(page2.getByTestId("user-message-bubble").filter({ hasText: "改成狗，不要猫" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page2.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0);
    await expect(page2.getByTestId("chat-goal-bar")).toContainText("狗");

    await pauseStandingGoal(sessionId!);
    await resetMockLlmHits();
    await sendChatMessage(page, "你好");
    await waitForSessionIdle(page);
    await expect
      .poll(
        async () => {
          const hits = llmChatHits(await fetchMockLlmHits());
          expectTranscriptOmits(hits, [FOLLOW_UP]);
          return hits.some((h) => (h.transcriptText ?? "").includes("改成狗"));
        },
        { timeout: 15_000 },
      )
      .toBe(true);

    await page.reload();
    await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
    await expect(page.getByText(GREETING)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("chat-goal-bar")).toContainText("狗");
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "改成狗，不要猫" })).toBeVisible();
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0);
    await page2.close();
  });

  test("Goal switch 切回锚点叶：旁路摘要走 mock-llm，目标条换成周报", async ({ page, context }) => {
    test.setTimeout(180_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();
    const url = page.url();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    await trpcMutate("session.setGoal", {
      sessionId,
      text: "写一篇关于猫的文章",
      mode: "goal",
      startNow: false,
    });
    await expect(page.getByTestId("chat-goal-bar")).toContainText("猫", { timeout: 15_000 });
    await pauseStandingGoal(sessionId!);
    await waitForSessionIdle(page);

    await sendChatMessage(page, FOLLOW_UP);
    await waitForStreamingComplete(page);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible({
      timeout: 15_000,
    });

    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page2);

    await resetMockLlmHits();
    await sendChatMessage(page, "另外做一个周报");
    await waitForSessionIdle(page);
    await expect(page.getByText("已切换到周报").first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("chat-goal-bar")).toContainText("周报");
    await expect(page.getByTestId("chat-goal-bar")).not.toContainText("猫");
    await expect(page.getByTestId("branch-summary-card")).toBeVisible({ timeout: 15_000 });
    await waitForAbandonedGone(sessionId!, FOLLOW_UP, "另外做一个周报");
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "另外做一个周报" })).toBeVisible();
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0, {
      timeout: 15_000,
    });
    const path = await listChat(sessionId!);
    expect(path.items.some((m) => m.content.includes(GREETING))).toBe(true);
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expectActiveLeaf(sessionId!, { role: "assistant", preview: "已切换到周报" });
    await expect
      .poll(
        async () => {
          const hits = await fetchMockLlmHits();
          return hits.some((h) => {
            if (h.scenario !== "branch_summary") return false;
            const blob = `${h.lastSystemText ?? ""}\n${h.transcriptText ?? ""}`;
            return blob.includes("Intent tombstone") && blob.includes("猫");
          });
        },
        { timeout: 15_000 },
      )
      .toBe(true);

    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: "已切换到周报" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page2.getByTestId("chat-goal-bar")).toContainText("周报");
    await expect(page2.getByTestId("user-message-bubble").filter({ hasText: "另外做一个周报" })).toBeVisible();
    await expect(page2.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0, {
      timeout: 15_000,
    });
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible();

    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });
    const followBranch = page.getByTestId("chat-tree-branch-btn").filter({ hasText: FOLLOW_UP });
    await expect(followBranch).toBeVisible();
    if ((await followBranch.getAttribute("data-active")) !== "true") {
      await followBranch.click();
    }
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "另外做一个周报" })).toHaveCount(0);
    await expect(page.getByTestId("chat-goal-bar")).toContainText("周报");
    await expect(page.getByTestId("chat-goal-bar")).not.toContainText("猫");
    await expect(page2.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page2.getByTestId("chat-goal-bar")).toContainText("周报");

    await page.reload();
    await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "另外做一个周报" })).toHaveCount(0);
    await expect(page.getByTestId("chat-goal-bar")).toContainText("周报");
    await expect(page.getByTestId("chat-goal-bar")).not.toContainText("猫");

    const weeklyBranch = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /另外做一个周报/ });
    await expect(weeklyBranch).toBeVisible();
    await weeklyBranch.click();
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "另外做一个周报" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0);
    await expectActiveLeaf(sessionId!, { role: "assistant", preview: "已切换到周报" });
    await expect(page.getByTestId("chat-goal-bar")).toContainText("周报");
    await expect(page2.getByTestId("user-message-bubble").filter({ hasText: "另外做一个周报" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page2.getByTestId("chat-goal-bar")).toContainText("周报");

    await pauseStandingGoal(sessionId!);
    await resetMockLlmHits();
    await sendChatMessage(page, "你好");
    await waitForSessionIdle(page);
    await expect
      .poll(
        async () => {
          const hits = llmChatHits(await fetchMockLlmHits());
          expectTranscriptOmits(hits, [FOLLOW_UP]);
          return hits.some((h) => (h.transcriptText ?? "").includes("另外做一个周报"));
        },
        { timeout: 15_000 },
      )
      .toBe(true);

    await page.reload();
    await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
    await expect(page.getByTestId("chat-goal-bar")).toContainText("周报");
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "另外做一个周报" })).toBeVisible();
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0);
    await page2.close();
  });

  test("旁路摘要失败仍换叶：开着的页自己切，不卡住", async ({ page }) => {
    test.setTimeout(120_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    await editLastAssistantMessage(page, `${GREETING}\n${SUMMARY_FAIL_TOKEN}`);
    await expect(page.getByText(SUMMARY_FAIL_TOKEN)).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page);

    await resetMockLlmHits();
    await forkFromUserMessage(page, 0);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "你好" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(GREETING)).toHaveCount(0, { timeout: 15_000 });
    await waitForSessionIdle(page);
    await expect(page.getByTestId("branch-summary-card")).toHaveCount(0);
    await expect
      .poll(
        async () =>
          (await fetchMockLlmHits()).some(
            (h) => h.scenario === "branch_summary" && h.lastUserText.includes(SUMMARY_FAIL_TOKEN),
          ),
        { timeout: 15_000 },
      )
      .toBe(true);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "你好" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(GREETING)).toHaveCount(0);
    await expect(page.getByTestId("branch-summary-card")).toHaveCount(0);

    await resetMockLlmHits();
    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);
    await expect(page.getByText(GREETING)).toHaveCount(0);
    const afterFailHits = llmChatHits(await fetchMockLlmHits());
    expectTranscriptOmits(afterFailHits, [GREETING, SUMMARY_FAIL_TOKEN]);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });
  });

  test("另写后编辑助手：不截断旁路，开着的页自己更新", async ({ page, context }) => {
    test.setTimeout(120_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();
    const url = page.url();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);
    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");
    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByText(GREETING)).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page);

    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByText(GREETING)).toBeVisible({ timeout: 15_000 });

    await editLastAssistantMessage(page, `${GREETING}（编辑）`);
    await expect(page.getByText("（编辑）")).toBeVisible({ timeout: 15_000 });
    await expect(page2.getByText("（编辑）")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(2, { timeout: 15_000 });
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByText(SEARCH_ANSWER)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("（编辑）")).toHaveCount(0);
    await page2.close();
  });

  test("两个会话：A 分叉不污染 B 的线性时间线", async ({ page, context }) => {
    await waitForChatReady(page);
    const sessionA = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionA).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);
    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionA!, GREETING, "你好");
    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });

    const page2 = await context.newPage();
    await waitForChatReady(page2);
    const sessionB = new URL(page2.url()).searchParams.get("sessionId");
    expect(sessionB).toBeTruthy();
    expect(sessionB).not.toBe(sessionA);

    await sendChatMessage(page2, "你好");
    await waitForStreamingComplete(page2);
    await expectAssistantAnswer(page2, GREETING);
    await waitForSessionIdle(page2);
    await expect(page2.getByTestId("chat-session-tree-bar")).toHaveCount(0);
    await expect(page2.getByTestId("branch-summary-card")).toHaveCount(0);
    await expect(page2.getByText(GREETING)).toBeVisible();

    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible();
    await expect(page.getByText(SEARCH_ANSWER)).toBeVisible();
    await page2.close();
  });

  test("另写后不等摘要就能发新问，摘要随后自己出现", async ({ page }) => {
    test.setTimeout(120_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    await resetMockLlmHits();
    await forkFromUserMessage(page, 0);
    await expect(
      pane(page).getByTestId("assistant-message-bubble").filter({ hasText: GREETING }),
    ).toHaveCount(0, { timeout: 15_000 });
    await expectSessionIdUnchanged(page, sessionId!);

    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);
    await expect(pane(page).getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toHaveCount(
      0,
    );
    const searchHits = llmChatHits(await fetchMockLlmHits());
    expectTranscriptOmits(searchHits, [GREETING]);
    await waitForMockBranchSummaryHit();
    await expect(page.getByTestId("branch-summary-card")).toBeVisible({ timeout: 15_000 });
    await expectSummaryHasNoFork(page);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });
    await expectActiveLeaf(sessionId!, { role: "assistant", preview: SEARCH_ANSWER });
    await expectSessionIdUnchanged(page, sessionId!);
  });

  test("同标签切走再点回来，直达 URL 也 PULL 当前叶", async ({ page }) => {
    test.setTimeout(120_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);
    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");
    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("complementary").getByRole("button", { name: "新建对话" }).click();
    await expect(page.getByText("今天想种点什么？")).toBeVisible({ timeout: 10_000 });
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toHaveCount(0);

    const listItem = page.locator(`[data-testid="session-list-item"][data-session-id="${sessionId}"]`).first();
    await expect(listItem).toBeVisible({ timeout: 10_000 });
    await listItem.scrollIntoViewIfNeeded();
    await listItem.click({ force: true });
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await expect(pane(page).getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toHaveCount(
      0,
    );
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible();
    await expect(page.getByTestId("branch-summary-card")).toBeVisible();
    await expectActiveLeaf(sessionId!, { role: "assistant", preview: SEARCH_ANSWER });

    await page.goto("/chat");
    await expect(page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`)).toHaveCount(
      0,
      { timeout: 10_000 },
    );
    await openBoundSession(page, sessionId!);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await expect(pane(page).getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toHaveCount(
      0,
    );
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("branch-summary-card")).toBeVisible();
    await expectActiveLeaf(sessionId!, { role: "assistant", preview: SEARCH_ANSWER });
  });

  test("同一分叉点三叉：树条三钮各切到对应叶", async ({ page }) => {
    test.setTimeout(120_000);
    const thirdPrompt = FOLLOW_UP;
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);
    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");
    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(2, { timeout: 15_000 });

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);

    await forkFromUserMessage(page, 0);
    await expect(
      pane(page).getByTestId("assistant-message-bubble").filter({ hasText: GREETING }),
    ).toHaveCount(0, { timeout: 15_000 });
    await sendChatMessage(page, thirdPrompt);
    await waitForStreamingComplete(page);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: thirdPrompt })).toBeVisible();
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(3, { timeout: 15_000 });

    const searchBtn = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ });
    await searchBtn.click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: thirdPrompt })).toHaveCount(0);
    await expectActiveLeaf(sessionId!, { role: "assistant", preview: SEARCH_ANSWER });
    const inspectSearch = await trpcQuery<InspectTurn>("session.inspectTurn", { sessionId });
    expect(inspectSearch.lastUserPreview).toContain("搜索 OasisMind");
    expect(inspectSearch.lastUserPreview).not.toContain(thirdPrompt);

    const thirdBtn = page.getByTestId("chat-tree-branch-btn").filter({ hasText: thirdPrompt });
    await thirdBtn.click();
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: thirdPrompt })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expectActiveLeaf(sessionId!, { role: "assistant", preview: GREETING });
    const inspectThird = await trpcQuery<InspectTurn>("session.inspectTurn", { sessionId });
    expect(inspectThird.lastUserPreview).toContain(thirdPrompt);

    await page.getByTestId("chat-tree-branch-btn").filter({ hasText: /你好！我是 Mock LLM/ }).click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: thirdPrompt })).toHaveCount(0);
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expectActiveLeaf(sessionId!, { role: "assistant", preview: GREETING });
    const inspectGreet = await trpcQuery<InspectTurn>("session.inspectTurn", { sessionId });
    expect(inspectGreet.lastUserPreview).toContain("你好");
    expect(inspectGreet.lastUserPreview).not.toContain("搜索 OasisMind");
    expect(inspectGreet.lastUserPreview).not.toContain(thirdPrompt);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(3, { timeout: 15_000 });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible();
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: thirdPrompt })).toHaveCount(0);
  });

  test("另写前打好的草稿还在，发出去挂在新叶", async ({ page }) => {
    test.setTimeout(90_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    const input = page.getByTestId("chat-input");
    await input.fill(SEARCH_PROMPT);
    await expect(input).toHaveValue(SEARCH_PROMPT);

    await forkFromUserMessage(page, 0);
    await expect(
      pane(page).getByTestId("assistant-message-bubble").filter({ hasText: GREETING }),
    ).toHaveCount(0, { timeout: 15_000 });
    await expect(input).toHaveValue(SEARCH_PROMPT);

    await expect(page.getByTestId("chat-send")).toBeEnabled();
    await page.getByTestId("chat-send").click();
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);
    await expect(pane(page).getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toHaveCount(
      0,
    );
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });
    await expectActiveLeaf(sessionId!, { role: "assistant", preview: SEARCH_ANSWER });
    await expectSessionIdUnchanged(page, sessionId!);
  });

  test("从中间用户气泡另写：问候还在，只放弃该问的答", async ({ page }) => {
    test.setTimeout(90_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);
    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);

    await resetMockLlmHits();
    await forkFromUserMessage(page, 1);
    await waitForAbandonedGone(sessionId!, SEARCH_ANSWER, SEARCH_PROMPT);
    await waitForMockBranchSummaryHit();

    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING }).first()).toBeVisible();
    await expect(page.getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: SEARCH_PROMPT })).toBeVisible();
    await expectSessionIdUnchanged(page, sessionId!);

    await sendChatMessage(page, FOLLOW_UP);
    await waitForStreamingComplete(page);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toHaveCount(2);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible();
    await expect(page.getByText(SEARCH_ANSWER)).toHaveCount(0);
    const followHits = llmChatHits(await fetchMockLlmHits());
    expectTranscriptOmits(followHits, [SEARCH_ANSWER, MOCK_SUMMARY]);
    expect(followHits.some((h) => (h.transcriptText ?? "").includes(GREETING))).toBe(true);

    const searchTip = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /web_search|已完成/ });
    await expect(searchTip).toBeVisible({ timeout: 15_000 });
    await searchTip.click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    const searchPath = await listChat(sessionId!);
    expect(searchPath.items.filter((m) => m.role === "assistant" && m.content.includes(GREETING))).toHaveLength(1);
    expect(searchPath.items.some((m) => m.content.includes(FOLLOW_UP))).toBe(false);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0);
    await expectToolPill(page, "web_search");
    await expectActiveLeaf(sessionId!, { role: "assistant", preview: SEARCH_ANSWER });

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    const pulled = await listChat(sessionId!);
    expect(pulled.items.some((m) => m.content.includes(GREETING))).toBe(true);
    expect(pulled.items.some((m) => m.content.includes(SEARCH_ANSWER))).toBe(true);
    expect(pulled.items.some((m) => m.content.includes(FOLLOW_UP))).toBe(false);
    await expectToolPill(page, "web_search");
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0);
  });

  test("另写后在搜索枝重试：问候枝还在", async ({ page }) => {
    test.setTimeout(90_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);
    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");
    await sendChatMessage(page, SEARCH_PROMPT);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    await waitForSessionIdle(page);

    await resetMockLlmHits();
    await retryLastUserMessage(page);
    await waitForSessionIdle(page);
    await expectAssistantAnswer(page, SEARCH_ANSWER);
    expect((await fetchMockLlmHits()).some((h) => h.scenario === "web_search" || h.scenario === "web_search_final")).toBe(
      true,
    );

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(2);
    await expectActiveLeaf(sessionId!, { role: "assistant", preview: GREETING });
  });

  test("书签 API：换叶后全树仍能读到 label", async ({ page }) => {
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    const path = await listChat(sessionId!);
    const asst = path.items.find((m) => m.role === "assistant" && m.content.includes(GREETING));
    expect(asst?.id).toBeTruthy();
    await trpcMutate("message.setLabel", { messageId: asst!.id, label: "问候锚点" });

    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");

    const pathAfter = await listChat(sessionId!);
    expect(pathAfter.items.some((m) => m.id === asst!.id)).toBe(false);
    const tree = await trpcQuery<ChatListPage>("message.listForChat", {
      sessionId,
      limit: 50,
      tree: true,
    });
    expect(tree.items.find((m) => m.id === asst!.id)?.label).toBe("问候锚点");

    await trpcMutate("session.switchBranch", { sessionId, messageId: asst!.id });
    await expect(page.getByText(GREETING)).toBeVisible({ timeout: 15_000 });
    const back = await listChat(sessionId!);
    expect(back.items.find((m) => m.id === asst!.id)?.label).toBe("问候锚点");

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(GREETING)).toBeVisible({ timeout: 15_000 });
    const afterReload = await listChat(sessionId!);
    expect(afterReload.items.find((m) => m.id === asst!.id)?.label).toBe("问候锚点");

    await trpcMutate("message.setLabel", { messageId: asst!.id, label: null });
    const cleared = await trpcQuery<ChatListPage>("message.listForChat", {
      sessionId,
      limit: 50,
      tree: true,
    });
    expect(cleared.items.find((m) => m.id === asst!.id)?.label ?? null).toBeNull();
  });

  test("书签 UI：钉助手 → 树条芯片 → 点芯片切回 → F5 仍钉", async ({ page }) => {
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    const asstBubble = pane(page)
      .getByTestId("assistant-message-bubble")
      .filter({ hasText: GREETING });
    await asstBubble.hover();
    const bookmarkBtn = asstBubble.getByTestId("message-bookmark-btn");
    await bookmarkBtn.click({ force: true });
    await expect(bookmarkBtn).toHaveAttribute("aria-label", "去书签", { timeout: 8_000 });

    const path = await listChat(sessionId!);
    const asst = path.items.find((m) => m.role === "assistant" && m.content.includes(GREETING));
    expect(asst?.id).toBeTruthy();

    // 另写 → 钉过的助手落到旁路枝；再发一条后续生成第二枝，树条才出现（用户消息需有 ≥2 子节点）
    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");
    await waitForSessionIdle(page);
    await sendChatMessage(page, FOLLOW_UP);
    await waitForStreamingComplete(page);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });

    // 书签芯片出现，指向钉过的助手，当前叶在另一枝 → 可点
    const chip = page.getByTestId("chat-bookmark-chip");
    await expect(chip).toBeVisible({ timeout: 10_000 });
    await expect(chip).toHaveAttribute("data-message-id", asst!.id);
    await expect(chip).not.toBeDisabled();
    await chip.click();

    // 切回原枝，助手气泡重现，书签仍钉
    await expect(asstBubble).toBeVisible({ timeout: 15_000 });
    await asstBubble.hover();
    await expect(bookmarkBtn).toHaveAttribute("aria-label", "去书签", { timeout: 8_000 });

    // F5 后书签仍在（PULL：listForChat 带回 label）
    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(asstBubble).toBeVisible({ timeout: 15_000 });
    await asstBubble.hover();
    await expect(bookmarkBtn).toHaveAttribute("aria-label", "去书签", { timeout: 8_000 });

    // 清理：取消书签
    await bookmarkBtn.click({ force: true });
    await expect(bookmarkBtn).toHaveAttribute("aria-label", "加书签", { timeout: 8_000 });
  });

  test("W7 Goal 顶栏已核实步骤：注入 fixture 后展开列表，F5 仍在", async ({ page }) => {
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    await trpcMutate("session.setGoal", {
      sessionId,
      text: "过夜目标：把 W7 做完",
      mode: "goal",
      startNow: false,
    });
    await expect(page.getByTestId("chat-goal-bar")).toContainText("W7", { timeout: 15_000 });
    await pauseStandingGoal(sessionId!);

    // 注入 1 条已核实步骤 fixture（测试专用接口，仅 E2E 暴露）
    await trpcMutate("session.__setVerifiedProgressForTest", {
      sessionId,
      items: [
        {
          id: "v1",
          claim: "已核实：W7 顶栏列出已核实步骤",
          evidenceRefs: ["e2e-verified"],
          auditedAt: "2026-08-29T00:00:00.000Z",
          auditor: "system",
        },
      ],
    });
    await expect(page.getByTestId("chat-goal-verified-count")).toContainText("已核实 1 步", { timeout: 10_000 });

    // 展开核实列表
    const toggle = page.getByTestId("chat-goal-verified");
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByTestId("chat-goal-verified-item")).toContainText("W7 顶栏列出已核实步骤", {
      timeout: 10_000,
    });

    // F5 后仍在（PULL：getGoal 带回 goalState 含 verifiedProgress）
    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("chat-goal-bar")).toContainText("W7", { timeout: 15_000 });
    await expect(page.getByTestId("chat-goal-verified-count")).toContainText("已核实 1 步", { timeout: 10_000 });
    await page.getByTestId("chat-goal-verified").click();
    await expect(page.getByTestId("chat-goal-verified-item")).toContainText("W7 顶栏列出已核实步骤", {
      timeout: 10_000,
    });

    await trpcMutate("session.clearGoal", { sessionId });
  });

  test("另写仍是同一会话，不是 session.fork 复制", async ({ page }) => {
    const sessionId = await seedGreetingSearchFork(page);
    await expectSessionIdUnchanged(page, sessionId);
    await expectNotACopiedSession(sessionId);
    await expect(
      page.locator(`[data-testid="session-list-item"][data-session-id="${sessionId}"]`),
    ).toHaveCount(1);
    await expectActiveLeaf(sessionId, { role: "assistant", preview: SEARCH_ANSWER });
  });

  test("流式中树条与另写禁用，停后可另写", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);
    const stopVisible = page.getByTestId("chat-stop").waitFor({ state: "visible", timeout: 10_000 });
    await sendChatMessage(page, "请慢慢说，多讲几句。");
    await stopVisible;
    await expect(page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]')).toBeDisabled();
    const liveUser = page.getByTestId("user-message-bubble").filter({ hasText: "请慢慢说" });
    await liveUser.hover();
    await expect(liveUser.getByTestId("message-fork-from-btn")).toBeDisabled();
    const staleFork = page.locator('[data-testid="message-fork-from-btn"]:not([disabled])');
    if ((await staleFork.count()) > 0) {
      await staleFork.first().click({ force: true });
    }
    await expect(page.getByTestId("chat-stop")).toBeVisible();
    await expect
      .poll(async () => (await trpcQuery<InspectTurn>("session.inspectTurn", { sessionId })).lastUserPreview)
      .toContain("请慢慢说");
    await page.getByTestId("chat-stop").click();
    await expect(page.getByText("已停止生成").first()).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page);
    await expect(page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]')).toBeEnabled();
    await expectNotACopiedSession(sessionId);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible();
  });

  test("停生成后另写：中断枝还在，切回去仍是已停止", async ({ page }) => {
    test.setTimeout(90_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    const stopVisible = page.getByTestId("chat-stop").waitFor({ state: "visible", timeout: 10_000 });
    await sendChatMessage(page, "请慢慢说，多讲几句。");
    await stopVisible;
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "请慢慢说" })).toBeVisible({
      timeout: 10_000,
    });
    await page.getByTestId("chat-stop").click();
    await expect(page.getByText("已停止生成").first()).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page);

    await forkFromUserMessage(page, 1);
    await expect(pane(page).getByText("已停止生成")).toHaveCount(0, { timeout: 15_000 });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "请慢慢说" })).toBeVisible();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible();

    await sendChatMessage(page, FOLLOW_UP);
    await waitForStreamingComplete(page);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible();
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });
    await expect(pane(page).getByText("已停止生成")).toHaveCount(0);

    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(2, { timeout: 15_000 });
    const stoppedBtn = page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]');
    await expect(stoppedBtn).toHaveCount(1);
    await stoppedBtn.click();
    await expect(page.getByText("已停止生成").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0);
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(2);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("已停止生成").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0);
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible();
  });

  test("压缩后切旁路：压缩卡不跟搜索枝走", async ({ page }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);
    await sendChatMessage(page, "上下文已经很长了，请压缩会话后继续");
    await expect(page.locator('[data-testid="tool-pill"][data-tool="session_compact"]')).toBeVisible({
      timeout: 20_000,
    });
    await waitForSessionIdle(page);

    const greetHasCompact =
      (await page.getByTestId("compact-boundary-card").count()) > 0 ||
      (await listChat(sessionId)).items.some(
        (m) => m.kind === "compact" || m.content.includes("压缩会话"),
      );
    expect(greetHasCompact).toBe(true);

    const searchBtn = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ });
    await searchBtn.click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-testid="tool-pill"][data-tool="session_compact"]')).toHaveCount(0);
    await expect(page.getByTestId("compact-boundary-card")).toHaveCount(0);
    const searchPath = await listChat(sessionId);
    expect(searchPath.items.some((m) => m.kind === "compact")).toBe(false);
    expect(searchPath.items.some((m) => m.content.includes("压缩会话"))).toBe(false);
    expect(searchPath.items.some((m) => m.content.includes(SEARCH_ANSWER))).toBe(true);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "压缩会话" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expect(page.locator('[data-testid="tool-pill"][data-tool="session_compact"]')).toBeVisible({
      timeout: 15_000,
    });

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "压缩会话" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-testid="tool-pill"][data-tool="session_compact"]')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toHaveCount(
      0,
    );

    const searchAfterReload = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ });
    await searchAfterReload.click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-testid="tool-pill"][data-tool="session_compact"]')).toHaveCount(0);
    await expect(page.getByTestId("compact-boundary-card")).toHaveCount(0);
    const searchAfterF5 = await listChat(sessionId);
    expect(searchAfterF5.items.some((m) => m.kind === "compact")).toBe(false);
  });

  test("树条换叶失败后再点：能切过去", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.route("**/api/trpc/session.switchBranch**", (route) => route.abort("failed"));
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("chat-tree-switch-error")).toHaveText("换叶失败", { timeout: 8_000 });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible();
    await expect(pane(page).getByText(GREETING)).toHaveCount(0);

    await page.unroute("**/api/trpc/session.switchBranch**");
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expect(page.getByTestId("chat-tree-switch-error")).toHaveCount(0);
    await expectActiveLeaf(sessionId, { role: "assistant", preview: GREETING });
  });

  test("编辑取消不换叶、旁路还在", async ({ page }) => {
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    const bubble = page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING });
    await bubble.hover();
    await bubble.getByTestId("message-edit-btn").click({ force: true });
    await expect(page.getByTestId("message-markdown-source")).toBeVisible({ timeout: 8_000 });
    await page.getByTestId("message-edit-cancel").click();
    await expect(page.getByTestId("message-markdown-source")).toHaveCount(0);
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible();
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(2);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expectActiveLeaf(sessionId, { role: "assistant", preview: SEARCH_ANSWER });
  });

  test("树条换叶后输入框草稿还在，发出去挂当前叶", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    const input = page.getByTestId("chat-input");
    await input.fill(FOLLOW_UP);
    await expect(input).toHaveValue(FOLLOW_UP);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(input).toHaveValue(FOLLOW_UP);

    await sendChatMessage(page, FOLLOW_UP);
    await waitForStreamingComplete(page);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible();
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expectActiveLeaf(sessionId, { role: "assistant", preview: GREETING });

    const searchBtn = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ });
    await searchBtn.click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toHaveCount(0);
  });

  test("队列两条都挂当前枝，切旁路看不到", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);

    await sendChatMessage(page, "队列测试第一条");
    await enqueueDuringStream(page, "队列测试第二条");
    await waitForSessionIdle(page);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "队列测试第一条" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "队列测试第二条" })).toBeVisible();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: "队列慢流" })).toHaveCount(2);
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    const searchBtn = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ });
    await searchBtn.click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "队列测试" })).toHaveCount(0);
    await expect(pane(page).getByText("队列慢流")).toHaveCount(0);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "队列测试第二条" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "队列测试第二条" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
  });

  test("另一标签流式中不能换叶；助手钉在本轮 user", async ({ page, context }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    const url = page.url();
    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByText(SEARCH_ANSWER)).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page2);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);
    await waitForSessionIdle(page2);

    const stopVisible = page.getByTestId("chat-stop").waitFor({ state: "visible", timeout: 10_000 });
    await sendChatMessage(page, "请慢慢说，多讲几句。");
    await stopVisible;

    await expect(page2.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]')).toBeDisabled({
      timeout: 15_000,
    });
    const tree = await trpcQuery<SessionTree>("session.tree", { sessionId });
    const searchLeaf = tree.nodes.find(
      (n) => n.role === "assistant" && n.contentPreview.includes("已完成 web_search"),
    );
    expect(searchLeaf?.id).toBeTruthy();
    let switchErr = "";
    try {
      await trpcMutate("session.switchBranch", { sessionId, messageId: searchLeaf!.id });
    } catch (err) {
      switchErr = err instanceof Error ? err.message : String(err);
    }
    expect(switchErr).toMatch(/正在回复/);

    await waitForSessionIdle(page);
    await expect(page.getByText("故意拉长")).toBeVisible({ timeout: 20_000 });
    await expectAssistantParentedToUser(sessionId, "请慢慢说", "故意拉长");
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expect(page2.getByText("请慢慢说")).toBeVisible({ timeout: 15_000 });
    await expect(page2.getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expectNotACopiedSession(sessionId);

    await page2.reload();
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByText("请慢慢说")).toBeVisible({ timeout: 15_000 });
    await expect(page2.getByText(SEARCH_ANSWER)).toHaveCount(0);
    await page2.close();
  });

  test("流式中 F5 续传仍在当前枝，不串到旁路", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);

    const stopVisible = page.getByTestId("chat-stop").waitFor({ state: "visible", timeout: 10_000 });
    await sendChatMessage(page, "请慢慢说，多讲几句。");
    await stopVisible;
    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "请慢慢说" })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);
    await expect(page.getByText("故意拉长")).toBeVisible({ timeout: 20_000 });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expectAssistantParentedToUser(sessionId, "请慢慢说", "故意拉长");
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible();
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByTestId("user-message-bubble").filter({ hasText: "请慢慢说" })).toHaveCount(0);
    await expect(pane(page).getByText("故意拉长")).toHaveCount(0);
  });

  test("思考时间线只挂当前枝，切旁路消失，切回还在", async ({ page }) => {
    test.setTimeout(120_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();

    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);
    await forkFromUserMessage(page, 0);
    await waitForAbandonedGone(sessionId!, GREETING, "你好");

    await enableThinking(page);
    await sendChatMessage(page, "请解释你的思考过程");
    await expectThinkingTimeline(page);
    await waitForStreamingComplete(page);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("thinking-timeline")).toBeVisible();
    await expect(page.getByText("最终回答")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("chat-session-tree-bar")).toBeVisible({ timeout: 15_000 });

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText("最终回答")).toHaveCount(0);
    await expect(pane(page).getByText("让我逐步思考")).toHaveCount(0);

    await page.getByTestId("chat-tree-branch-btn").filter({ hasText: /请解释你的思考/ }).click();
    await expect(page.getByText("最终回答")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("thinking-timeline")).toBeVisible();
    await expect(page.getByText("让我逐步思考")).toBeVisible();
    await expect(pane(page).getByText(GREETING)).toHaveCount(0);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("最终回答")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("让我逐步思考")).toBeVisible();
    await expect(pane(page).getByText(GREETING)).toHaveCount(0);
  });

  test("切问候枝再发：LLM 上下文不含摘要与搜索枝", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);

    await resetMockLlmHits();
    await sendChatMessage(page, FOLLOW_UP);
    await waitForStreamingComplete(page);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible();
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    const hits = llmChatHits(await fetchMockLlmHits());
    expect(hits.length).toBeGreaterThan(0);
    expectTranscriptOmits(hits, [MOCK_SUMMARY, SEARCH_ANSWER, "已完成 web_search"]);
    await expectNotACopiedSession(sessionId);
  });

  test("两标签同时点两叉：最后写入赢，仍是同一会话", async ({ page, context }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);
    await forkFromUserMessage(page, 0);
    await expect(pane(page).getByText(GREETING)).toHaveCount(0, { timeout: 15_000 });
    await sendChatMessage(page, FOLLOW_UP);
    await waitForStreamingComplete(page);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(3, { timeout: 15_000 });

    const url = page.url();
    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByTestId("chat-tree-branch-btn")).toHaveCount(3, { timeout: 15_000 });
    await waitForSessionIdle(page2);

    const greetBtn = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /你好！我是 Mock LLM/ });
    const searchBtn2 = page2.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ });
    await Promise.all([greetBtn.click(), searchBtn2.click()]);

    await expect
      .poll(
        async () => {
          const a = await trpcQuery<SessionTree>("session.tree", { sessionId });
          const b = await trpcQuery<SessionTree>("session.tree", { sessionId });
          if (!a.activeLeafId || a.activeLeafId !== b.activeLeafId) return "";
          return a.nodes.find((n) => n.id === a.activeLeafId)?.contentPreview ?? "";
        },
        { timeout: 15_000 },
      )
      .toMatch(/Mock LLM|已完成 web_search|本地优先/);

    const tree = await trpcQuery<SessionTree>("session.tree", { sessionId });
    const winnerLeaf = tree.nodes.find((n) => n.id === tree.activeLeafId);
    expect(winnerLeaf).toBeTruthy();
    await expectNotACopiedSession(sessionId);

    const isSearch = /已完成 web_search|本地优先/.test(winnerLeaf!.contentPreview);
    if (isSearch) {
      await expect(page.getByText(SEARCH_ANSWER)).toBeVisible({ timeout: 15_000 });
      await expect(page2.getByText(SEARCH_ANSWER)).toBeVisible({ timeout: 15_000 });
    } else {
      await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
        timeout: 15_000,
      });
      await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByText(SEARCH_ANSWER)).toHaveCount(0);
    }
    await page2.close();
  });

  test("流式结束后另一标签树条能换叶（listRunning 收尾）", async ({ page, context }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    const url = page.url();
    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await waitForSessionIdle(page2);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);

    const stopVisible = page.getByTestId("chat-stop").waitFor({ state: "visible", timeout: 10_000 });
    await sendChatMessage(page, "请慢慢说，多讲几句。");
    await stopVisible;
    await expect(page2.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]')).toBeDisabled({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);
    await waitForHubIdle(sessionId);
    await expect
      .poll(
        async () => {
          const running = await trpcQueryVoid<{ items: Array<{ sessionId: string }> }>("session.listRunning");
          return running.items.some((item) => item.sessionId === sessionId);
        },
        { timeout: 15_000 },
      )
      .toBe(false);

    const searchBtn = page2.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]');
    await expect(searchBtn).toBeEnabled({ timeout: 15_000 });
    await searchBtn.click();
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText("请慢慢说")).toHaveCount(0);
    await expectActiveLeaf(sessionId, { role: "assistant", preview: SEARCH_ANSWER });
    await page2.reload();
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await page2.close();
  });

  test("目标条是会话级：切枝不换目标，刷新还在", async ({ page, context }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    await trpcMutate("session.setGoal", {
      sessionId,
      text: "写一篇关于猫的文章",
      mode: "goal",
      startNow: false,
    });
    await expect(page.getByTestId("chat-goal-bar")).toContainText("猫", { timeout: 15_000 });
    await pauseStandingGoal(sessionId);
    await waitForSessionIdle(page);

    const url = page.url();
    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(page2.getByTestId("chat-goal-bar")).toContainText("猫", { timeout: 15_000 });

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("chat-goal-bar")).toContainText("猫");
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page2.getByTestId("chat-goal-bar")).toContainText("猫");

    await page.reload();
    await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
    await expect(page.getByTestId("chat-goal-bar")).toContainText("猫");
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await page2.close();
  });

  test("后台标签再聚焦：当前叶自己到，不必 F5", async ({ page, context }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    const url = page.url();
    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await waitForSessionIdle(page2);

    await page2.bringToFront();
    const tree = await trpcQuery<SessionTree>("session.tree", { sessionId });
    const greetLeaf = tree.nodes.find((n) => n.role === "assistant" && n.contentPreview.includes("你好！我是 Mock LLM"));
    expect(greetLeaf?.id).toBeTruthy();
    await trpcMutate("session.switchBranch", { sessionId, messageId: greetLeaf!.id });

    await page.bringToFront();
    await page.evaluate(() => {
      window.dispatchEvent(new Event("focus"));
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expectActiveLeaf(sessionId, { role: "assistant", preview: GREETING });
    await page2.close();
  });

  test("另写后立刻 F5：换叶与摘要不丢", async ({ page }) => {
    test.setTimeout(90_000);
    await waitForChatReady(page);
    const sessionId = new URL(page.url()).searchParams.get("sessionId");
    expect(sessionId).toBeTruthy();
    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, GREETING);
    await waitForSessionIdle(page);

    await forkFromUserMessage(page, 0);
    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await waitForAbandonedGone(sessionId!, GREETING, "你好");
    await expect(page.getByTestId("branch-summary-card")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "你好" })).toBeVisible();
    await expectActiveLeaf(sessionId!, { role: "user", preview: "你好" });
    await expectNotACopiedSession(sessionId!);
  });

  test("搜索枝写入知识库后切旁路：文章正文仍是搜索答", async ({ page }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    const href = await saveLastAssistantAsPost(page, `分支落库-${Date.now()}`);
    await page.getByTestId("save-message-as-post-success").getByRole("button", { name: "关闭" }).click();
    await expect(page.getByTestId("save-message-as-post-dialog")).toHaveCount(0);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    const postPage = await page.context().newPage();
    await postPage.goto(href);
    await expect(postPage.getByText(SEARCH_ANSWER)).toBeVisible({ timeout: 15_000 });
    await postPage.close();
    await expectNotACopiedSession(sessionId);
  });

  test("搜索枝与问候枝都看得见旁路摘要；刷新还在", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    const searchPath = await listChat(sessionId);
    expect(searchPath.items.some((m) => m.content.includes(MOCK_SUMMARY))).toBe(true);
    await page.getByTestId("user-message-bubble").filter({ hasText: "你好" }).scrollIntoViewIfNeeded();
    await expect(page.getByTestId("branch-summary-card").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("branch-summary-preview").first()).toContainText(MOCK_SUMMARY);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    const greetPath = await listChat(sessionId);
    expect(greetPath.items.some((m) => m.content.includes(MOCK_SUMMARY))).toBe(true);
    await expect(page.getByTestId("branch-summary-card").first()).toBeVisible({ timeout: 15_000 });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("branch-summary-card").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible();
    await expectNotACopiedSession(sessionId);
  });

  test("刷新后 inspectTurn 仍是当前叶", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expectActiveLeaf(sessionId, { role: "assistant", preview: GREETING });

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    const inspect = await trpcQuery<InspectTurn>("session.inspectTurn", { sessionId });
    expect(inspect.lastUserPreview).toContain("你好");
    expect(inspect.lastUserPreview).not.toContain("搜索 OasisMind");
    await expectActiveLeaf(sessionId, { role: "assistant", preview: GREETING });
  });

  test("树条按钮文案截到 18 字，点叉切到子树叶", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    const labels = await page.getByTestId("chat-tree-branch-btn").allTextContents();
    expect(labels.length).toBe(2);
    for (const label of labels) {
      expect(label.trim().length).toBeLessThanOrEqual(18);
    }
    expect(labels.some((t) => t.includes("搜索 OasisMind"))).toBe(true);
    expect(labels.some((t) => t.includes("你好！我是 Mock"))).toBe(true);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expectActiveLeaf(sessionId, { role: "assistant", preview: GREETING });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("另一标签点停：两边已停止生成，搜索枝还在，刷新不丢", async ({ page, context }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    const url = page.url();
    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByText(SEARCH_ANSWER)).toBeVisible({ timeout: 15_000 });

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);
    await waitForSessionIdle(page2);

    const stopOnPage1 = page.getByTestId("chat-stop").waitFor({ state: "visible", timeout: 10_000 });
    await sendChatMessage(page, "请慢慢说，多讲几句。");
    await stopOnPage1;
    await expect(page2.getByTestId("chat-stop")).toBeVisible({ timeout: 15_000 });
    await page2.getByTestId("chat-stop").click();

    await expect(page.getByText("已停止生成").first()).toBeVisible({ timeout: 15_000 });
    await expect(page2.getByText("已停止生成").first()).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page);
    const stoppedTree = await trpcQuery<ChatListPage>("message.listForChat", {
      sessionId,
      limit: 50,
      tree: true,
    });
    const stoppedUser = stoppedTree.items.find(
      (m) => m.role === "user" && m.content.includes("请慢慢说"),
    );
    expect(stoppedUser?.id).toBeTruthy();
    const stoppedKids = stoppedTree.items.filter(
      (m) => m.parentId === stoppedUser!.id && m.role === "assistant",
    );
    expect(stoppedKids.some((m) => /已中断|故意拉长|^这是/.test(m.content))).toBe(true);

    const searchBtn = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ });
    await searchBtn.click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText("已停止生成")).toHaveCount(0);
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page2.getByText("已停止生成")).toHaveCount(0);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByText("已停止生成").first()).toBeVisible({ timeout: 15_000 });

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("已停止生成").first()).toBeVisible({ timeout: 15_000 });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
    await page2.close();
  });

  test("别的会话流式中，本会话树条仍能换叶", async ({ page, context }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    const page2 = await context.newPage();
    await waitForChatReady(page2);
    const otherId = new URL(page2.url()).searchParams.get("sessionId");
    expect(otherId).toBeTruthy();
    expect(otherId).not.toBe(sessionId);

    const stopOther = page2.getByTestId("chat-stop").waitFor({ state: "visible", timeout: 10_000 });
    await sendChatMessage(page2, "请慢慢说，多讲几句。");
    await stopOther;
    await expect(page2.getByTestId("chat-stop")).toBeVisible();

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expectActiveLeaf(sessionId, { role: "assistant", preview: GREETING });
    await expect(page2.getByTestId("chat-stop")).toBeVisible();
    await expect(page2.getByTestId("user-message-bubble").filter({ hasText: "请慢慢说" })).toBeVisible();

    await page2.getByTestId("chat-stop").click();
    await expect(page2.getByText("已停止生成").first()).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page2);
    await page2.close();
  });

  test("派子 pill 只挂问候枝，切搜索消失，切回还在", async ({ page }) => {
    test.setTimeout(180_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);

    await sendChatMessage(page, "非阻塞派子去调研");
    await expect(page.locator('[data-testid="tool-pill"][data-tool="spawn_subagent"]')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("已派非阻塞子 Agent").first()).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page);
    await expect(page.getByText("非阻塞子结果已送达").first()).toBeVisible({ timeout: 20_000 });
    await waitForSessionIdle(page);
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    const searchBtn = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ });
    await searchBtn.click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-testid="tool-pill"][data-tool="spawn_subagent"]')).toHaveCount(0);
    await expect(pane(page).getByText("非阻塞派子去调研")).toHaveCount(0);
    await expect(pane(page).getByText("已派非阻塞子 Agent")).toHaveCount(0);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByText("非阻塞子结果已送达").first()).toBeVisible({ timeout: 15_000 });
    const greetPath = await listChat(sessionId);
    expect(greetPath.items.some((m) => m.content.includes("非阻塞派子去调研"))).toBe(true);
    expect(greetPath.items.some((m) => m.content.includes("已派非阻塞子 Agent"))).toBe(true);
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    const afterSpawn = await listChat(sessionId);
    expect(afterSpawn.items.some((m) => m.content.includes("非阻塞派子去调研"))).toBe(true);
    expect(afterSpawn.items.some((m) => m.content.includes("已派非阻塞子 Agent"))).toBe(true);
    await expect(page.getByText("非阻塞子结果已送达").first()).toBeVisible({ timeout: 15_000 });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
  });

  test("工具失败只挂当前枝，切旁路没有红 hint", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);

    await sendChatMessage(page, "读取文章 https://example.com/broken");
    await expect(page.getByText("读取文章失败").first()).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page);
    await expectToolPill(page, "read_article");
    const hint = page.getByTestId("tool-timing-hint").first();
    await expect(hint).toBeVisible({ timeout: 10_000 });
    await expect(hint).toContainText("失败");
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    const searchBtn = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ });
    await searchBtn.click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-testid="tool-pill"][data-tool="read_article"]')).toHaveCount(0);
    await expect(pane(page).getByText("读取文章失败")).toHaveCount(0);
    await expect(pane(page).getByText("https://example.com/broken")).toHaveCount(0);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.locator('[data-testid="tool-pill"][data-tool="read_article"]')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("tool-timing-hint").first()).toContainText("失败");

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("读取文章失败").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-testid="tool-pill"][data-tool="read_article"]')).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
  });

  test("复制当前枝助手正文，不是旁路问候", async ({ page }) => {
    test.setTimeout(90_000);
    await seedGreetingSearchFork(page);
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    const searchBubble = page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER });
    await expect(searchBubble).toBeVisible();
    await searchBubble.hover();
    await searchBubble.getByRole("button", { name: "复制" }).click();
    await expect(page.getByText("已复制").first()).toBeVisible({ timeout: 8_000 });
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain(SEARCH_ANSWER);
    expect(copied).not.toContain(GREETING);
  });

  test("队列第二条另一标签自己出现，切旁路两边都看不到", async ({ page, context }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    const url = page.url();
    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);
    await waitForSessionIdle(page2);

    await sendChatMessage(page, "队列测试第一条");
    await enqueueDuringStream(page, "队列测试第二条");
    await expect(page2.getByTestId("user-message-bubble").filter({ hasText: "队列测试第二条" })).toBeVisible({
      timeout: 30_000,
    });
    await waitForSessionIdle(page);
    await expect(page2.getByTestId("user-message-bubble").filter({ hasText: "队列测试第一条" })).toBeVisible();
    await expect(page2.getByTestId("user-message-bubble").filter({ hasText: "队列测试第二条" })).toBeVisible();

    const searchBtn = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ });
    await searchBtn.click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "队列测试" })).toHaveCount(0);
    await expect(page2.getByTestId("user-message-bubble").filter({ hasText: "队列测试" })).toHaveCount(0);
    await page2.close();
  });

  test("思考时间线另一标签自己出现，切旁路两边都没了", async ({ page, context }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    const url = page.url();
    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);
    await waitForSessionIdle(page2);
    await enableThinking(page);

    await sendChatMessage(page, "请解释你的思考过程");
    await expectThinkingTimeline(page);
    await expect(page2.getByTestId("thinking-timeline")).toBeVisible({ timeout: 15_000 });
    await waitForStreamingComplete(page);
    await waitForSessionIdle(page);
    await expect(page.getByText("最终回答")).toBeVisible({ timeout: 15_000 });
    await expect(page2.getByText("最终回答")).toBeVisible({ timeout: 15_000 });

    const searchBtn = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ });
    await searchBtn.click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText("最终回答")).toHaveCount(0);
    await expect(page2.getByText("最终回答")).toHaveCount(0);
    await page2.close();
  });

  test("编辑搜索问刷新不丢，问候枝看不到改文", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    await editLastUserMessage(page, "搜索 OasisMind 并一句话介绍（改过）");
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "（改过）" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible();

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "（改过）" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible();

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "（改过）" })).toHaveCount(0);
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
  });

  test("切搜索后再发：挂搜索枝，LLM 上下文含搜索不含问候", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    const searchFollow = "这是搜索枝的第二问，请简短确认";
    await resetMockLlmHits();
    await sendChatMessage(page, searchFollow);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: searchFollow })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(GREETING)).toHaveCount(0);

    await expect
      .poll(async () => llmChatHits(await fetchMockLlmHits()).length, { timeout: 15_000 })
      .toBeGreaterThan(0);
    const hits = llmChatHits(await fetchMockLlmHits());
    expectTranscriptOmits(hits, [GREETING, MOCK_SUMMARY]);
    expect(
      hits.some(
        (h) =>
          (h.transcriptText ?? "").includes(SEARCH_ANSWER) ||
          (h.transcriptText ?? "").includes("搜索 OasisMind"),
      ),
    ).toBe(true);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: searchFollow })).toHaveCount(0);
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    await page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ }).click();
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: searchFollow })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(GREETING)).toHaveCount(0);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: searchFollow })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(GREETING)).toHaveCount(0);
  });

  test("本页点停，另一标签自己出现已停止生成", async ({ page, context }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    const url = page.url();
    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);
    await waitForSessionIdle(page2);

    const stopVisible = page.getByTestId("chat-stop").waitFor({ state: "visible", timeout: 10_000 });
    await sendChatMessage(page, "请慢慢说，多讲几句。");
    await stopVisible;
    await page.getByTestId("chat-stop").click();
    await expect(page.getByText("已停止生成").first()).toBeVisible({ timeout: 15_000 });
    await expect(page2.getByText("已停止生成").first()).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page);
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expect(page2.getByText(SEARCH_ANSWER)).toHaveCount(0);
    await page2.close();
  });

  test("中断枝上重试：搜索枝还在，重试结果仍挂问候", async ({ page }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);

    const stopVisible = page.getByTestId("chat-stop").waitFor({ state: "visible", timeout: 10_000 });
    await sendChatMessage(page, "请慢慢说，多讲几句。");
    await stopVisible;
    await page.getByTestId("chat-stop").click();
    await expect(page.getByText("已停止生成").first()).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page);

    await retryLastUserMessage(page);
    await waitForSessionIdle(page);
    await expect(page.getByText("故意拉长").first()).toBeVisible({ timeout: 20_000 });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    await page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ }).click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText("请慢慢说")).toHaveCount(0);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText("请慢慢说")).toHaveCount(0);
  });

  test("inspectTurn 路径条数不含旁路摘要", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    const inspect = await trpcQuery<InspectTurn>("session.inspectTurn", { sessionId });
    const path = await listChat(sessionId);
    const nonSummary = path.items.filter((m) => m.kind !== "branch_summary");
    expect(inspect.pathMessageCount).toBe(nonSummary.length);
    expect(path.items.some((m) => m.content.includes(MOCK_SUMMARY))).toBe(true);
    expect(inspect.pathMessageCount).toBeLessThan(path.items.length);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    const greetInspect = await trpcQuery<InspectTurn>("session.inspectTurn", { sessionId });
    const greetPath = await listChat(sessionId);
    expect(greetInspect.pathMessageCount).toBe(
      greetPath.items.filter((m) => m.kind !== "branch_summary").length,
    );
    expect(greetInspect.lastUserPreview).toContain("你好");
    expect(greetInspect.lastUserPreview).not.toContain("搜索 OasisMind");
  });

  test("压缩后再发：LLM 上下文不含搜索枝", async ({ page }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);
    await sendChatMessage(page, "上下文已经很长了，请压缩会话后继续");
    await expect(page.locator('[data-testid="tool-pill"][data-tool="session_compact"]')).toBeVisible({
      timeout: 20_000,
    });
    await waitForSessionIdle(page);

    await resetMockLlmHits();
    await sendChatMessage(page, FOLLOW_UP);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible({
      timeout: 15_000,
    });
    await expect
      .poll(async () => llmChatHits(await fetchMockLlmHits()).length, { timeout: 15_000 })
      .toBeGreaterThan(0);
    const hits = llmChatHits(await fetchMockLlmHits());
    expectTranscriptOmits(hits, [SEARCH_ANSWER, SEARCH_PROMPT, MOCK_SUMMARY]);
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
  });

  test("提问卡未答时不能换叶；答完只挂问候枝", async ({ page }) => {
    test.setTimeout(180_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);

    await sendChatMessage(page, "请用提问卡问我选 knowledge 还是 posts");
    await expect(page.getByTestId("session-ask-user-bar")).toBeVisible({ timeout: 40_000 });
    await expect(page.getByTestId("ask-user-option-1")).toBeVisible();

    const occupied = await page.getByTestId("chat-stop").count();
    if (occupied > 0) {
      await expect(page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]')).toBeDisabled();
      const tree = await trpcQuery<SessionTree>("session.tree", { sessionId });
      const searchLeaf = tree.nodes.find(
        (n) => n.role === "assistant" && n.contentPreview.includes("已完成 web_search"),
      );
      expect(searchLeaf?.id).toBeTruthy();
      let switchErr = "";
      try {
        await trpcMutate("session.switchBranch", { sessionId, messageId: searchLeaf!.id });
      } catch (err) {
        switchErr = err instanceof Error ? err.message : String(err);
      }
      expect(switchErr).toMatch(/正在回复/);
    }

    await page.getByTestId("ask-user-option-1").click();
    await waitForSessionIdle(page);
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: /已按你的选择/ })).toBeVisible({
      timeout: 20_000,
    });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    await page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ }).click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText("已按你的选择")).toHaveCount(0);
    await expect(page.getByTestId("session-ask-user-bar")).toHaveCount(0);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByText("已按你的选择").first()).toBeVisible({ timeout: 15_000 });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
  });

  test("队列去掉第二条：切旁路仍看不到第一条", async ({ page }) => {
    test.setTimeout(90_000);
    await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);

    await sendChatMessage(page, "队列测试第一条");
    await enqueueDuringStream(page, "队列测试第二条");
    await page.getByTitle("移除").click();
    await waitForSessionIdle(page);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "队列测试第一条" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "队列测试第二条" })).toHaveCount(0);

    await page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ }).click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: "队列测试" })).toHaveCount(0);
  });

  test("派子后立刻切走：子结果仍挂问候枝，不偷叶、不串搜索", async ({ page }) => {
    test.setTimeout(180_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);

    await sendChatMessage(page, "非阻塞派子去调研");
    await expect(page.getByText("已派非阻塞子 Agent").first()).toBeVisible({ timeout: 15_000 });
    await waitForSessionIdle(page);

    const searchBtn = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ });
    await searchBtn.click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expectActiveLeaf(sessionId, { role: "assistant", preview: SEARCH_ANSWER });

    await expect
      .poll(
        async () => {
          const all = await trpcQuery<ChatListPage>("message.listForChat", {
            sessionId,
            limit: 50,
            tree: true,
          });
          return all.items.some((m) => m.content.includes("非阻塞子结果已送达"));
        },
        { timeout: 40_000 },
      )
      .toBe(true);

    await waitForHubIdle(sessionId);
    await waitForSessionIdle(page);
    const searchPath = await listChat(sessionId);
    expect(searchPath.items.some((m) => m.content.includes("非阻塞子结果已送达"))).toBe(false);
    expect(searchPath.items.some((m) => m.content.includes(SEARCH_ANSWER))).toBe(true);
    await expect(pane(page).getByText("非阻塞子结果已送达")).toHaveCount(0);
    await expectActiveLeaf(sessionId, { role: "assistant", preview: SEARCH_ANSWER });

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByText("非阻塞子结果已送达").first()).toBeVisible({ timeout: 15_000 });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("非阻塞子结果已送达").first()).toBeVisible({ timeout: 15_000 });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
  });

  test("HTML 预览只挂问候枝，切搜索消失，切回还在", async ({ page }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);

    await sendChatMessage(page, "写一个可预览的计数按钮 HTML 小页面");
    await waitForSessionIdle(page);
    const preview = page.getByRole("button", { name: "预览视图" });
    await expect(preview).toBeVisible({ timeout: 15_000 });
    await preview.click();
    await expect(page.getByRole("button", { name: "代码视图" })).toBeVisible();
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    await page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ }).click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("button", { name: "预览视图" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "代码视图" })).toHaveCount(0);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByRole("button", { name: "代码视图" })).toBeVisible({ timeout: 15_000 });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: "预览视图" }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
  });

  test("另一标签看见压缩卡：不必 F5；切搜索两边都没卡", async ({ page, context }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    const url = page.url();
    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await waitForSessionIdle(page2);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page2.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);

    await sendChatMessage(page, "上下文已经很长了，请压缩会话后继续");
    await expect(page.locator('[data-testid="tool-pill"][data-tool="session_compact"]')).toBeVisible({
      timeout: 20_000,
    });
    await waitForSessionIdle(page);
    await expect(page2.locator('[data-testid="tool-pill"][data-tool="session_compact"]')).toBeVisible({
      timeout: 15_000,
    });

    await page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ }).click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-testid="tool-pill"][data-tool="session_compact"]')).toHaveCount(0);
    await expect(page2.locator('[data-testid="tool-pill"][data-tool="session_compact"]')).toHaveCount(0);
    await page2.close();
  });

  test("另一标签 F5 时本页正在流：续传仍在问候枝", async ({ page, context }) => {
    test.setTimeout(120_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);
    const url = page.url();
    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });

    const stopVisible = page.getByTestId("chat-stop").waitFor({ state: "visible", timeout: 10_000 });
    await sendChatMessage(page, "请慢慢说，多讲几句。");
    await stopVisible;
    await page2.reload();
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page2.getByTestId("user-message-bubble").filter({ hasText: "请慢慢说" })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page2);
    await expect(
      pane(page2).getByTestId("assistant-message-bubble").filter({ hasText: "故意拉长" }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(pane(page2).getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expectAssistantParentedToUser(sessionId, "请慢慢说", "故意拉长");
    await page2.close();
  });

  test("编辑助手后刷新：改文还在，旁路还在", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);
    await editLastAssistantMessage(page, `${GREETING}（编辑后刷新）`);
    await expect(page.getByText("（编辑后刷新）")).toBeVisible({ timeout: 15_000 });

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("（编辑后刷新）")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(2);
    await page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ }).click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("（编辑后刷新）")).toHaveCount(0);
  });

  test("树条按钮 title 是完整预览，文案截 18 字", async ({ page }) => {
    await seedGreetingSearchFork(page);
    const searchBtn = page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ });
    await expect(searchBtn).toBeVisible();
    const title = await searchBtn.getAttribute("title");
    expect(title).toContain("搜索 OasisMind");
    expect((await searchBtn.innerText()).length).toBeLessThanOrEqual(18);
  });

  test("用量面板只挂当前助手，切问候关掉", async ({ page }) => {
    test.setTimeout(90_000);
    await seedGreetingSearchFork(page);
    const searchBubble = page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER });
    await searchBubble.hover();
    await searchBubble.getByTestId("message-usage-btn").click();
    await expect(page.getByTestId("message-usage-details")).toBeVisible({ timeout: 8_000 });

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("message-usage-details")).toHaveCount(0);
  });

  test("Ctrl+Enter 在当前枝发出去", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);
    const input = page.getByTestId("chat-input");
    await input.fill(FOLLOW_UP);
    await input.press("Control+Enter");
    await waitForSessionIdle(page);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expectActiveLeaf(sessionId, { role: "assistant", preview: GREETING });
  });

  test("重命名后仍是一条会话，树还在；开着的页和另一标签自己改名", async ({ page, context }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    const url = page.url();
    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(
      page2.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });

    const name = `分支改名${Date.now().toString(36).slice(-4)}`;
    await trpcMutate("session.update", { id: sessionId, autoName: name });
    const listItem = (p: Page) =>
      p.locator(`[data-testid="session-list-item"][data-session-id="${sessionId}"]`).filter({ hasText: name }).first();
    await expect(listItem(page)).toBeVisible({ timeout: 15_000 });
    await expect(listItem(page2)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name })).toBeVisible({ timeout: 15_000 });
    await expect(page2.getByRole("heading", { name })).toBeVisible({ timeout: 15_000 });
    await expectNotACopiedSession(sessionId);
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(2);

    await page.reload();
    await expect(
      page.locator(`[data-testid="chat-session-pane"][data-session-id="${sessionId}"]`),
    ).toBeVisible({ timeout: 10_000 });
    await expect(listItem(page)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("chat-tree-branch-btn")).toHaveCount(2);
    await expectNotACopiedSession(sessionId);
  });

  test("口头停止只挂问候枝，切搜索消失", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);
    await sendChatMessage(page, "停，别做了");
    await waitForSessionIdle(page);
    await expect(page.getByText(/已停止/).first()).toBeVisible({ timeout: 15_000 });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    await page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ }).click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(/已停止/)).toHaveCount(0);
    await expectActiveLeaf(sessionId, { role: "assistant", preview: SEARCH_ANSWER });
  });

  test("空输入换叶后发送钮仍禁用", async ({ page }) => {
    await seedGreetingSearchFork(page);
    await expect(page.getByTestId("chat-send")).toBeDisabled();
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("chat-send")).toBeDisabled();
  });

  test("Markdown 源码只挂当前枝，切问候关掉", async ({ page }) => {
    test.setTimeout(90_000);
    await seedGreetingSearchFork(page);
    const searchBubble = page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER });
    await searchBubble.hover();
    await searchBubble.getByTestId("message-edit-btn").click();
    await expect(page.getByTestId("message-markdown-source")).toBeVisible({ timeout: 8_000 });
    await expect(page.getByTestId("message-markdown-source")).toHaveValue(new RegExp(SEARCH_ANSWER));

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("message-markdown-source")).toHaveCount(0);
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
  });

  test("工具 JSON 只挂搜索枝，切问候消失，切回 pill 还在", async ({ page }) => {
    test.setTimeout(90_000);
    await seedGreetingSearchFork(page);
    const searchPill = page.locator('[data-testid="tool-pill"][data-tool="web_search"]');
    await expect(searchPill).toBeVisible({ timeout: 15_000 });
    await searchPill.locator("summary").click();
    await expect(page.getByTestId("tool-json-view-toggle").first()).toBeVisible({ timeout: 8_000 });

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-testid="tool-pill"][data-tool="web_search"]')).toHaveCount(0);
    await expect(page.getByTestId("tool-json-view-toggle")).toHaveCount(0);

    await page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ }).click();
    await expect(page.locator('[data-testid="tool-pill"][data-tool="web_search"]')).toBeVisible({
      timeout: 15_000,
    });
  });

  test("write_file 文件面板只列当前枝，切搜索变空，切回还在", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await waitForSessionIdle(page);
    await sendChatMessage(page, "请把草稿写到 mock-branch-draft.md");
    await waitForSessionIdle(page);
    await expect(page.getByText("已把草稿写到 mock-branch-draft.md").first()).toBeVisible({ timeout: 15_000 });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);

    await page.getByTestId("chat-open-files-panel").click();
    await expect(page.getByTestId("chat-files-panel")).toBeVisible();
    await expect(page.getByTestId("chat-file-item").filter({ hasText: "mock-branch-draft.md" })).toBeVisible({
      timeout: 10_000,
    });

    await page.getByTestId("chat-tree-branch-btn").filter({ hasText: /搜索 OasisMind/ }).click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("chat-files-empty")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("chat-file-item")).toHaveCount(0);

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("chat-file-item").filter({ hasText: "mock-branch-draft.md" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expectActiveLeaf(sessionId, { role: "assistant", preview: "mock-branch-draft" });
  });

  test("上下文占用条是会话级：切枝还在，不必 F5", async ({ page }) => {
    await seedGreetingSearchFork(page);
    await expect(page.getByTestId("session-context-pill").first()).toBeVisible();
    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("session-context-pill").first()).toBeVisible();
    await expect(page.getByTestId("scroll-to-bottom")).toHaveCount(0);
  });

  test("输入框附件切枝还在，发出去挂当前叶", async ({ page }) => {
    test.setTimeout(90_000);
    const sessionId = await seedGreetingSearchFork(page);
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    await page.getByTestId("chat-file-input").setInputFiles({
      name: "branch.png",
      mimeType: "image/png",
      buffer: png,
    });
    await expect(page.getByTestId("chat-image-preview")).toBeVisible({ timeout: 10_000 });

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("chat-image-preview")).toBeVisible();
    await waitForSessionIdle(page);
    await sendChatMessage(page, FOLLOW_UP);
    await waitForSessionIdle(page);
    await expect(page.getByTestId("user-message-bubble").filter({ hasText: FOLLOW_UP })).toBeVisible({
      timeout: 15_000,
    });
    await expect(pane(page).getByText(SEARCH_ANSWER)).toHaveCount(0);
    await expectActiveLeaf(sessionId, { role: "assistant", preview: GREETING });
  });

  test("朗读钮只挂当前助手；切问候后不保持停止朗读", async ({ page }) => {
    test.setTimeout(90_000);
    await seedGreetingSearchFork(page);
    const searchBubble = page.getByTestId("assistant-message-bubble").filter({ hasText: SEARCH_ANSWER });
    await searchBubble.hover();
    const speak = searchBubble.getByTestId("message-speak-btn");
    await expect(speak).toBeVisible();
    await speak.click();
    await expect(speak).toHaveAttribute("aria-label", "停止朗读");

    await page.locator('[data-testid="chat-tree-branch-btn"][data-active="false"]').click();
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: GREETING })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-testid="message-speak-btn"][aria-label="停止朗读"]')).toHaveCount(0);
    const greetSpeak = page
      .getByTestId("assistant-message-bubble")
      .filter({ hasText: GREETING })
      .getByTestId("message-speak-btn");
    if ((await greetSpeak.count()) > 0) {
      await expect(greetSpeak).toHaveAttribute("aria-label", "朗读");
    }
  });

});
