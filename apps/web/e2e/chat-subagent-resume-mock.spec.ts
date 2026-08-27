import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { SERVER_URL, trpcMutate } from "./helpers/trpcE2e";
import {
  waitForChatReady,
  sendChatMessage,
  waitForStreamingComplete,
  expectToolPill,
  expectAssistantAnswer,
  openBoundSession,
  listE2eAssistant,
} from "./helpers/mockChatFixture";

async function waitForSessionId(page: import("@playwright/test").Page): Promise<string> {
  await expect
    .poll(() => new URL(page.url()).searchParams.get("sessionId"), {
      timeout: 8_000,
      intervals: [50, 100, 200],
    })
    .toBeTruthy();
  return new URL(page.url()).searchParams.get("sessionId") as string;
}

test.describe("Subagent Mock — 刷新后父会话流式恢复", () => {
  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("spawn_subagent waitForResult=true 时刷新，父会话应恢复并收到子 Agent 结果", async ({ page }, testInfo) => {
    const logs: string[] = [];
    page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
    page.on("pageerror", (err) => logs.push(`[pageerror] ${err.message}`));

    try {
      await waitForChatReady(page);
      await sendChatMessage(page, "派子 Agent 慢速总结");
      await expectToolPill(page, "spawn_subagent");
      const parentSessionId = await waitForSessionId(page);
      const agentId = new URL(page.url()).searchParams.get("agentId") ?? undefined;

      await page.reload();
      await openBoundSession(page, parentSessionId, agentId);
      await waitForStreamingComplete(page);
      await expectAssistantAnswer(page, "父 Agent 已收到子 Agent 结果");
      await expectAssistantAnswer(page, "慢速总结已完成");
    } finally {
      const logPath = path.join(testInfo.outputDir, "browser-logs.txt");
      fs.mkdirSync(testInfo.outputDir, { recursive: true });
      fs.writeFileSync(logPath, logs.join("\n"), "utf8");
    }
  });

  test("spawn_subagent waitForResult=true 不刷新也应正常完成", async ({ page }) => {
    await waitForChatReady(page);
    await sendChatMessage(page, "派子 Agent 慢速总结");
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, "父 Agent 已收到子 Agent 结果");
    await expectAssistantAnswer(page, "慢速总结已完成");
  });

  test("spawn_subagent waitForResult=true 时切到别的 session 再切回，父会话应恢复并完成", async ({ page }) => {
    await waitForChatReady(page);
    await sendChatMessage(page, "派子 Agent 慢速总结");
    await expectToolPill(page, "spawn_subagent");

    const parentSessionId = await waitForSessionId(page);
    const agentId = new URL(page.url()).searchParams.get("agentId") ?? (await listE2eAssistant()).id;

    const other = await trpcMutate<{
      success: boolean;
      data?: { id: string };
      error?: { message?: string };
    }>("session.create", {
      title: `e2e-switch-${Date.now()}`,
      agentId,
      model: "deepseek-v4-flash",
    });
    const otherId = other.data?.id;
    if (!other.success || !otherId) {
      throw new Error(other.error?.message ?? "创建切换会话失败");
    }
    await openBoundSession(page, otherId, agentId);
    await expect(page.getByTestId("chat-stop")).toHaveCount(0);
    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);

    await openBoundSession(page, parentSessionId, agentId);
    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, "父 Agent 已收到子 Agent 结果");
    await expectAssistantAnswer(page, "慢速总结已完成");
  });

  test("spawn_subagent waitForResult=true 时切换 Workspace 再切回，父会话仍应在后台更新并完成", async ({ page }) => {
    await waitForChatReady(page);
    await sendChatMessage(page, "派子 Agent 慢速总结");
    await expectToolPill(page, "spawn_subagent");

    const currentWorkspaceName = (await page.getByTestId("workspace-select").textContent())?.trim() ?? "";
    expect(currentWorkspaceName.length).toBeGreaterThan(0);
    const parentSessionId = await waitForSessionId(page);

    await page.getByTestId("workspace-select").click();
    const menu = page.getByTestId("workspace-select-menu");
    await menu.waitFor({ state: "visible", timeout: 8_000 });
    const options = menu.locator("button");
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(1);

    let switched = false;
    for (let i = 0; i < optionCount; i++) {
      const text = (await options.nth(i).textContent())?.trim() ?? "";
      if (text && !text.includes(currentWorkspaceName)) {
        await options.nth(i).click();
        switched = true;
        break;
      }
    }
    expect(switched).toBe(true);

    await expect(page.getByTestId("workspace-select")).not.toContainText(currentWorkspaceName);

    await page.getByTestId("workspace-select").click();
    const menu2 = page.getByTestId("workspace-select-menu");
    await menu2.locator("button").filter({ hasText: currentWorkspaceName }).first().click();
    const agentId = new URL(page.url()).searchParams.get("agentId") ?? undefined;
    await openBoundSession(page, parentSessionId, agentId);

    await waitForStreamingComplete(page);
    await expectAssistantAnswer(page, "父 Agent 已收到子 Agent 结果");
    await expectAssistantAnswer(page, "慢速总结已完成");
  });
});
