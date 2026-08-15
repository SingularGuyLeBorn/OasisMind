/**
 * DSH §7 严酷验收（Chat 脸）。dshAcceptance 单测不能替代本文件。
 * 禁止 retries 盖红；禁止只断言 tRPC。
 */

import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { SERVER_URL, trpcQuery, trpcMutate } from "./helpers/trpcE2e";
import {
  waitForChatReady,
  sendChatMessage,
  waitForStreamingComplete,
  waitForSessionIdle,
} from "./helpers/mockChatFixture";

function findOffloadJsons(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...findOffloadJsons(full));
    else if (name.endsWith(".json") && !name.endsWith(".meta.json")) out.push(full);
  }
  return out;
}

test.describe("DSH §7 严酷验收 Mock", () => {
  test.beforeEach(async ({ request }) => {
    await expect
      .poll(async () => (await request.get(`${SERVER_URL}/health`)).ok())
      .toBe(true);
  });

  test("DSH-E2E-1 — sub 误写 spawn_subagent：硬调是 NOT_VISIBLE 失败脸", async ({ page }) => {
    const agents = await trpcQuery<{
      items: Array<{ id: string; name: string; tier: string; workspaceId: string | null; model: string }>;
    }>("agent.list", { page: 1, pageSize: 50 });
    const parent =
      agents.items.find((a) => a.name === "assistant" && a.tier === "manager") ??
      agents.items.find((a) => a.tier === "manager" && a.workspaceId) ??
      agents.items.find((a) => a.tier === "super");
    if (!parent) throw new Error("E2E-1 需要 manager 或 super 作为 parent");

    const created = await trpcMutate<{
      success: boolean;
      data?: { id: string; name: string };
      error?: { message?: string };
    }>("agent.create", {
      name: `DSH-E2E-1-sub-${Date.now().toString(36)}`,
      tier: "sub",
      parentId: parent.id,
      workspaceId: parent.workspaceId ?? undefined,
      model: parent.model,
      systemPrompt: "测试子 Agent，tools 里误写了 spawn_subagent",
      tools: ["native:spawn_subagent", "native:read_file", "native:agent_report_back"],
      source: "e2e-dsh",
    });
    if (!created.success || !created.data) {
      throw new Error(created.error?.message ?? "创建 sub Agent 失败");
    }
    const subId = created.data.id;
    const subName = created.data.name;

    await waitForChatReady(page);
    await page.getByTestId("agent-tree-select").click();
    const option = page.getByTestId(`agent-tree-option-${subId}`);
    await expect(option).toBeVisible({ timeout: 15_000 });
    await option.click();
    await expect(page.getByTestId("agent-tree-select")).toContainText(subName, { timeout: 15_000 });
    await waitForSessionIdle(page);

    const streamPost = page.waitForRequest(
      (req) => req.method() === "POST" && /\/api\/agent\/chat\/stream/.test(req.url()),
      { timeout: 15_000 },
    );
    await sendChatMessage(page, "硬调派生子代理");
    const posted = await streamPost;
    expect(
      posted.url(),
      "流式必须直连 mock server 3011；若打到 3003 rewrite 会卡死 SSE。请先 pnpm --filter @knowpilot/web run build:mock",
    ).toContain("3011");
    expect(posted.postDataJSON()?.message ?? "").toContain("硬调派生子代理");

    const pill = page.locator('[data-testid="tool-pill"][data-tool="spawn_subagent"]');
    await expect(pill).toBeVisible({ timeout: 25_000 });
    await expect(pill).toHaveAttribute("data-status", "error");
    await expect(page.getByTestId("tool-timing-hint").first()).toContainText(/NOT_VISIBLE|VisibleSet/);
    await waitForStreamingComplete(page);
    await waitForSessionIdle(page);
  });

  test("DSH-E2E-2 — mask allow=read_file + report_back 气泡推拉 F5", async ({ page }) => {
    test.setTimeout(180_000);
    const agents = await trpcQuery<{
      items: Array<{ id: string; name: string; tier: string; workspaceId: string | null; model: string }>;
    }>("agent.list", { page: 1, pageSize: 50 });
    const parent =
      agents.items.find((a) => a.name === "assistant" && a.tier === "manager") ??
      agents.items.find((a) => a.tier === "manager" && a.workspaceId) ??
      agents.items.find((a) => a.tier === "super");
    if (!parent) throw new Error("E2E-2 需要 manager 或 super");

    const created = await trpcMutate<{ success: boolean; data?: { id: string }; error?: { message?: string } }>(
      "session.create",
      { title: `dsh-e2e-2-${Date.now()}`, model: parent.model, agentId: parent.id },
    );
    if (!created.success || !created.data?.id) {
      throw new Error(created.error?.message ?? "E2E-2 创建会话失败");
    }
    const sessionId = created.data.id;
    await page.goto(`/chat?sessionId=${sessionId}&agentId=${parent.id}`);
    await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
    await waitForSessionIdle(page);

    const streamPost = page.waitForRequest(
      (req) => req.method() === "POST" && /\/api\/agent\/chat\/stream/.test(req.url()),
      { timeout: 15_000 },
    );
    await sendChatMessage(page, "派只读文件的子 Agent");
    const posted = await streamPost;
    expect(posted.url(), "流式必须直连 mock server 3011").toContain("3011");

    const pill = page.locator('[data-testid="tool-pill"][data-tool="spawn_subagent"]');
    await expect(pill).toBeVisible({ timeout: 40_000 });
    await expect(pill).toHaveAttribute("data-status", "done", { timeout: 90_000 });
    await expect(page.getByText("DSH-E2E-2 子已回报").first()).toBeVisible({ timeout: 90_000 });
    await expect(page.getByTestId("assistant-message-bubble").getByText("DSH-E2E-2 子已回报")).toBeVisible();
    await waitForSessionIdle(page);

    await page.reload();
    await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
    await expect(page.getByText("DSH-E2E-2 子已回报").first()).toBeVisible({ timeout: 20_000 });

    const children = await trpcQuery<{
      items: Array<{
        id: string;
        tools: string[];
        toolInheritMask: { allow?: string[]; deny?: string[] } | null;
      }>;
    }>("agent.list", { page: 1, pageSize: 50, parentId: parent.id, tier: "sub" });
    const child = children.items.find((a) => {
      const allow = a.toolInheritMask?.allow ?? [];
      return allow.includes("read_file") || allow.includes("native:read_file");
    });
    if (!child) {
      throw new Error(
        `E2E-2 找不到 inheritMask.allow=read_file 的子 Agent：${JSON.stringify(children.items)}`,
      );
    }
    const allow = child.toolInheritMask?.allow ?? [];
    expect(allow.some((n) => n === "read_file" || n === "native:read_file")).toBe(true);
    const toolNames = child.tools.map((t) => t.replace(/^native:/, ""));
    expect(toolNames).toContain("read_file");
    expect(toolNames).toContain("agent_report_back");
    expect(toolNames).not.toContain("web_search");
  });

  test("DSH-E2E-3 — read_article 长文：气泡不灌全文 + 磁盘全文 + read path", async ({ page }) => {
    test.setTimeout(120_000);
    const agents = await trpcQuery<{
      items: Array<{ id: string; name: string; tier: string; model: string }>;
    }>("agent.list", { page: 1, pageSize: 50 });
    const parent =
      agents.items.find((a) => a.name === "assistant" && a.tier === "manager") ??
      agents.items.find((a) => a.tier === "manager") ??
      agents.items.find((a) => a.tier === "super");
    if (!parent) throw new Error("E2E-3 需要 manager 或 super");

    const created = await trpcMutate<{ success: boolean; data?: { id: string }; error?: { message?: string } }>(
      "session.create",
      { title: `dsh-e2e-3-${Date.now()}`, model: parent.model, agentId: parent.id },
    );
    if (!created.success || !created.data?.id) {
      throw new Error(created.error?.message ?? "E2E-3 创建会话失败");
    }
    await page.goto(`/chat?sessionId=${created.data.id}&agentId=${parent.id}`);
    await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
    await waitForSessionIdle(page);

    const streamPost = page.waitForRequest(
      (req) => req.method() === "POST" && /\/api\/agent\/chat\/stream/.test(req.url()),
      { timeout: 15_000 },
    );
    await sendChatMessage(page, "读取长文 https://example.com/dsh-e2e-3-long");
    expect((await streamPost).url()).toContain("3011");

    const pill = page.locator('[data-testid="tool-pill"][data-tool="read_article"]');
    await expect(pill).toBeVisible({ timeout: 25_000 });
    await expect(pill).toHaveAttribute("data-status", "done", { timeout: 25_000 });
    await waitForSessionIdle(page);

    const bubble = page.getByTestId("assistant-message-bubble").last();
    await expect(bubble).toBeVisible({ timeout: 20_000 });
    const text = (await bubble.innerText()).trim();
    expect(text.length).toBeLessThan(8000);
    expect(text).toContain("DSH-E2E-3 长文标题");

    const toolResultsDir = path.resolve(process.cwd(), "../../.test-data-e2e/tool-results");
    const files = findOffloadJsons(toolResultsDir);
    const hit = files
      .map((file) => {
        const raw = fs.readFileSync(file, "utf8");
        try {
          return { file, raw, parsed: JSON.parse(raw) as { content?: string; title?: string; _kp_result_path?: string } };
        } catch {
          return { file, raw, parsed: {} };
        }
      })
      .find((row) => String(row.parsed.content ?? "").length >= 20_000);
    if (!hit) {
      throw new Error(`E2E-3 未找到 ≥20k content 的 tool-results JSON（扫了 ${files.length} 个）`);
    }
    expect(String(hit.parsed.title ?? "")).toContain("DSH-E2E-3");
    const rel = path.relative(path.resolve(process.cwd(), "../.."), hit.file).replace(/\\/g, "/");
    const payload = await trpcQuery<{ content: string; totalChars: number }>("session.readToolResult", {
      path: rel,
      offset: 0,
      maxChars: 100_000,
    });
    expect(payload.totalChars).toBeGreaterThanOrEqual(20_000);
    expect(payload.content).toContain("DSH-E2E-3 长文段落");
  });

  test("DSH-E2E-5 — 同 session 第二轮 runtime-context 换登录列表", async ({ page, request }) => {
    test.setTimeout(120_000);
    const setLogin = async (loggedIn: string[]) => {
      const res = await request.post(`${SERVER_URL}/debug/platform-login`, { data: { loggedIn } });
      expect(res.ok()).toBe(true);
    };

    const agents = await trpcQuery<{
      items: Array<{ id: string; name: string; tier: string; model: string }>;
    }>("agent.list", { page: 1, pageSize: 50 });
    const parent =
      agents.items.find((a) => a.name === "assistant" && a.tier === "manager") ??
      agents.items.find((a) => a.tier === "manager") ??
      agents.items.find((a) => a.tier === "super");
    if (!parent) throw new Error("E2E-5 需要 manager 或 super");
    const created = await trpcMutate<{ success: boolean; data?: { id: string }; error?: { message?: string } }>(
      "session.create",
      { title: `dsh-e2e-5-${Date.now()}`, model: parent.model, agentId: parent.id },
    );
    if (!created.success || !created.data?.id) {
      throw new Error(created.error?.message ?? "E2E-5 创建会话失败");
    }

    await setLogin(["zhihu"]);
    await page.goto(`/chat?sessionId=${created.data.id}&agentId=${parent.id}`);
    await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
    await waitForSessionIdle(page);
    await sendChatMessage(page, "你好");
    await waitForSessionIdle(page);

    await setLogin(["bilibili"]);
    await sendChatMessage(page, "你现在登录了哪些平台");
    await expect(page.getByText("钩子回声登录平台：bilibili")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("钩子回声登录平台：zhihu")).toHaveCount(0);
    await waitForSessionIdle(page);

    const logPath = path.resolve(process.cwd(), "../../.test-data-e2e/mock-llm.log");
    const log = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf8") : "";
    const lines = log.split(/\r?\n/).filter((l) => l.includes("RUNTIME_CTX") && l.includes("你现在登录了哪些平台"));
    expect(lines.length, `mock-llm.log 应有第二轮 RUNTIME_CTX：${log.slice(-800)}`).toBeGreaterThan(0);
    expect(lines[lines.length - 1]).toMatch(/count=1/);
    expect(lines[lines.length - 1]).toMatch(/login=bilibili/);
    expect(lines[lines.length - 1]).not.toMatch(/login=zhihu/);
  });
});
