/**
 * 任务画布（TencentDB 符号化短期记忆思想落地）— 长任务进度的轻量符号视图。
 *
 * 对标它的「Mermaid 任务画布」：厚重执行细节已卸载（toolResultOffload + path+offset），
 * 上下文里只保留一张轻量状态卡；Agent 需要细节时按 taskId 下钻（async_task_status 等）。
 *
 * 与它的差异：不画 Mermaid（LLM 读紧凑文本列表的 token 效率更高、渲染零成本），
 * 数据源直接是 Task 表权威状态（queued/resuming/running），血缘 = 当前会话 + 其子会话。
 *
 * 注入：contextHooks 内建钩子 task-canvas（order 360，round 1）；空态不注入。
 * 本模块是叶子：只依赖 prisma 句柄，不 import loop/orchestrator。
 */

import type { PrismaClient } from "@prisma/client";

/** 画布最多展示的任务条数（超出按 startedAt/queuedAt 新近度截断） */
const TASK_CANVAS_MAX_ITEMS = 8;
/** 任务名截断 */
const TASK_NAME_MAX_CHARS = 40;

function formatAge(ms: number): string {
  const sec = Math.max(0, Math.round(ms / 1000));
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m${sec % 60}s`;
  return `${Math.floor(min / 60)}h${min % 60}m`;
}

function statusLabel(status: string): string {
  switch (status) {
    case "running":
      return "running";
    case "resuming":
      return "resuming";
    default:
      return "queued";
  }
}

/**
 * 构建任务画布注入块；无进行中任务时返回空串（不注入）。
 *
 * @param sessionId 当前会话 id；血缘含其子会话（spawn 的子 Agent 任务）
 */
export async function buildTaskCanvasHint(
  prisma: PrismaClient,
  opts: { sessionId?: string | null },
): Promise<string> {
  const sessionId = opts.sessionId?.trim();
  if (!sessionId) return "";

  // 血缘：本会话 + 直接子会话
  const children = await prisma.chatSession.findMany({
    where: { parentSessionId: sessionId },
    select: { id: true },
  });
  const lineage = [sessionId, ...children.map((c) => c.id)];

  const tasks = await prisma.task.findMany({
    where: {
      sessionId: { in: lineage },
      status: { in: ["queued", "resuming", "running"] },
    },
    select: {
      id: true,
      name: true,
      status: true,
      queuedAt: true,
      startedAt: true,
      sessionId: true,
    },
    orderBy: [{ startedAt: "desc" }, { queuedAt: "desc" }],
    take: TASK_CANVAS_MAX_ITEMS,
  });
  if (tasks.length === 0) return "";

  const now = Date.now();
  const lines = tasks.map((t) => {
    const name =
      t.name.length > TASK_NAME_MAX_CHARS ? `${t.name.slice(0, TASK_NAME_MAX_CHARS)}…` : t.name;
    const shortId = t.id.slice(0, 8);
    const isChild = t.sessionId !== sessionId;
    const timing =
      t.status === "running" && t.startedAt
        ? `已跑 ${formatAge(now - t.startedAt.getTime())}`
        : t.queuedAt
          ? `排队 ${formatAge(now - t.queuedAt.getTime())}`
          : "";
    return `- [${statusLabel(t.status)}] ${name} (${shortId})${isChild ? " · 子会话" : ""}${timing ? ` · ${timing}` : ""}`;
  });

  return (
    `\n\n## 后台任务画布（本会话血缘 · ${tasks.length} 个进行中）\n` +
    lines.join("\n") +
    `\n任务完成会自动投递结果到本会话，无需轮询；需看状态细节用 async_task_status。`
  );
}
