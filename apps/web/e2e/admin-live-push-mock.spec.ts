/**
 * 场景 6/7：开着的管理页收到 PUSH 后自己拉，禁止 F5。
 * 写库走 tRPC（模拟其它标签/Agent）；本页 BC 为推，refetchInterval 为拉。
 */
import { test, expect } from "@playwright/test";
import { SERVER_URL, trpcMutate, trpcQuery } from "./helpers/trpcE2e";
import {
  pushAdminUiState,
  APPROVAL_REFETCH_PENDING_MS,
  CRON_REFETCH_IDLE_MS,
} from "./helpers/uiStatePush";

const CRON_VISIBLE_MS = CRON_REFETCH_IDLE_MS + 4_000;
const APPROVAL_VISIBLE_MS = APPROVAL_REFETCH_PENDING_MS + 4_000;

test.describe("管理页 PUSH — 开着页自己动", () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("/cron 他处写入后开着页自己出现卡片，无需刷新", async ({ page }) => {
    await page.goto("/cron");
    await expect(page.getByRole("heading", { name: "定时节律", level: 1 })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/还没有定时节律|节律配置/)).toBeVisible({ timeout: 15_000 });

    const agents = await trpcQuery<{
      items: { id: string; name: string; tier: string }[];
    }>("agent.list", { page: 1, pageSize: 20 });
    const agent =
      agents.items.find((a) => a.tier === "manager") ??
      agents.items.find((a) => a.tier === "super");
    if (!agent) throw new Error("[e2e] 没有可绑 cron 的 Agent");

    const name = `e2e-live-${Date.now()}`;
    try {
      await trpcMutate("agentCron.upsert", {
        agentId: agent.id,
        name,
        cron: "0 8 * * *",
        prompt: "e2e live push briefing 至少八字",
        enabled: true,
      });
      const listed = await trpcQuery<{ items: { name: string }[] }>("agentCron.list", {});
      expect(listed.items.some((j) => j.name === name)).toBe(true);

      const heading = page.getByRole("heading", { name, level: 2 });
      await expect(heading).toHaveCount(0);

      await pushAdminUiState(page, { type: "cron_job_updated" });
      await expect(heading).toBeVisible({ timeout: CRON_VISIBLE_MS });
    } finally {
      await trpcMutate("agentCron.clear", { agentId: agent.id, name }).catch(() => {});
    }
  });

  test("/approvals 他处创建 pending 后开着页自己出现卡片，无需刷新", async ({ page }) => {
    await page.goto("/approvals");
    await expect(page.getByRole("heading", { name: "待你点头", level: 1 })).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByText(/暂无待你点头的事项|没有匹配的审批记录/).or(page.getByTestId("approval-card").first()),
    ).toBeVisible({ timeout: 15_000 });

    const marker = `e2e-appr-${Date.now()}`;
    let approvalId: string | undefined;
    try {
      const created = await trpcMutate<{ success: boolean; data: { id: string } }>(
        "approval.create",
        {
          toolName: "git_push",
          args: { marker },
          status: "pending",
        },
      );
      approvalId = created.data.id;
      const card = page.getByTestId("approval-card").filter({ hasText: marker });
      await expect(card).toHaveCount(0);

      await pushAdminUiState(page, { type: "approval_updated" });
      await expect(card).toBeVisible({ timeout: APPROVAL_VISIBLE_MS });
    } finally {
      if (approvalId) {
        await trpcMutate("approval.delete", { id: approvalId }).catch(() => {});
      }
    }
  });
});
