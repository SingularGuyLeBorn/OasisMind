/**
 * RSI P0：IntentContract revision / switch 的 Chat 脸。
 * 关键词独立，禁止抢「你好 / 搜索 / 派子 Agent / 硬调派生子代理」。
 */
import { test, expect } from "@playwright/test";
import { SERVER_URL, trpcQuery, trpcMutate } from "./helpers/trpcE2e";
import { sendChatMessage, waitForSessionIdle } from "./helpers/mockChatFixture";

async function pickParent() {
  const agents = await trpcQuery<{
    items: Array<{ id: string; name: string; tier: string; model: string }>;
  }>("agent.list", { page: 1, pageSize: 50 });
  const parent =
    agents.items.find((a) => a.name === "assistant" && a.tier === "manager") ??
    agents.items.find((a) => a.tier === "manager") ??
    agents.items.find((a) => a.tier === "super");
  if (!parent) throw new Error("evolving-intent 需要 manager 或 super");
  return parent;
}

test.describe("evolving-intent mock", () => {
  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("revision：改成狗后 Goal 条不再以猫为现行目标", async ({ page }) => {
    test.setTimeout(120_000);
    const parent = await pickParent();
    const created = await trpcMutate<{ success: boolean; data?: { id: string }; error?: { message?: string } }>(
      "session.create",
      { title: `evolving-rev-${Date.now()}`, model: parent.model, agentId: parent.id },
    );
    if (!created.success || !created.data?.id) throw new Error(created.error?.message ?? "创建会话失败");
    const sessionId = created.data.id;

    await trpcMutate("session.setGoal", {
      sessionId,
      text: "写一篇关于猫的文章",
      mode: "goal",
      startNow: false,
    });

    await page.goto(`/chat?sessionId=${sessionId}&agentId=${parent.id}`);
    await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-goal-bar")).toContainText("猫");
    await expect(page.getByTestId("chat-goal-verified-count")).toContainText("已核实 0 步");

    await sendChatMessage(page, "改成狗，不要猫");
    await expect(page.getByText("现行目标是狗").first()).toBeVisible({ timeout: 30_000 });
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-goal-bar")).toContainText("狗");
    await expect(page.getByTestId("chat-goal-bar")).not.toContainText("猫");

    const dumped = await trpcQuery<{ goal: { text: string; intent?: { kind?: string } } }>(
      "session.getGoal",
      { sessionId },
    );
    expect(dumped.goal.text).toContain("狗");
    expect(dumped.goal.text).not.toContain("猫");
    expect(dumped.goal.intent?.kind).toBe("revision");

    await page.reload();
    await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
    await expect(page.getByTestId("chat-goal-bar")).toContainText("狗");
    await expect(page.getByTestId("chat-goal-bar")).not.toContainText("猫");
  });

  test("switch：另外做周报后旧 goal 不再续跑", async ({ page }) => {
    test.setTimeout(120_000);
    const parent = await pickParent();
    const created = await trpcMutate<{ success: boolean; data?: { id: string }; error?: { message?: string } }>(
      "session.create",
      { title: `evolving-sw-${Date.now()}`, model: parent.model, agentId: parent.id },
    );
    if (!created.success || !created.data?.id) throw new Error(created.error?.message ?? "创建会话失败");
    const sessionId = created.data.id;

    await trpcMutate("session.setGoal", {
      sessionId,
      text: "写一篇关于猫的文章",
      mode: "goal",
      startNow: false,
    });

    await page.goto(`/chat?sessionId=${sessionId}&agentId=${parent.id}`);
    await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-goal-bar")).toContainText("猫");

    await sendChatMessage(page, "另外做一个周报");
    await expect(page.getByText("已切换到周报").first()).toBeVisible({ timeout: 30_000 });
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-goal-bar")).toContainText("周报");
    await expect(page.getByTestId("chat-goal-bar")).not.toContainText("猫");

    const dumped = await trpcQuery<{
      goal: { text: string; status: string; pendingContinue?: { reason: string } | null; intent?: { kind?: string } };
    }>("session.getGoal", { sessionId });
    expect(dumped.goal.text).toMatch(/周报/);
    expect(dumped.goal.status).toBe("active");
    expect(dumped.goal.pendingContinue ?? null).toBeNull();
    expect(dumped.goal.intent?.kind).toBe("switch");
  });
});
