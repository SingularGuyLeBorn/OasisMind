/**
 * Agent 写路径单一 resolve（WP6）。禁止 DSH 三档 session mode。
 * 调用方：fs / shell / web 下载落盘。content/posts 只走 post_*。
 */

import path from "path";
import {
  resolveSafePath,
  resolveWithinDir,
  assertPathWithinDir,
  assertWritePathSafe,
} from "./safePath.js";
import type { NativeToolContext } from "./tools/native/types.js";
import {
  assertHostReadPathSafe,
  assertHostSessionAllowed,
  assertHostWritePathSafe,
  isAbsInside,
  looksLikeHostPath,
  resolveHostAbsolutePath,
  toHostDisplayPath,
} from "./hostAccess.js";

/** content/ 写入白名单：仅 uploads；其余 content/（含动态花园与 about）禁 write_file */
const CONTENT_WRITE_PREFIXES = ["content/uploads/"] as const;

/** 算法可视化工程：允许 read_file / list_directory；写入走 native:algo_viz_create */
const ALGO_VIZ_ROOT = "apps/algo-viz";

/** data/ 读白名单：其余 data/ 子目录默认拒绝（防 cookies/credentials/db/git/approvals/logs/sessions/messages 等泄漏） */
const DATA_READ_ALLOWLIST = ["data/tool-results/", "data/webpages/", "data/workspace/"] as const;

function isAlgoVizProjectPath(p: string): boolean {
  return p === ALGO_VIZ_ROOT || p.startsWith(`${ALGO_VIZ_ROOT}/`);
}

export function describePolicy(): string {
  return "uploads 可写；content/posts 走 post_*；data/ 仅 tool-results/webpages/workspace 可读；Workspace 相对可写；host: 仅 native:host_access";
}

export function assertWriteAllowed(relPath: string): void {
  const p = String(relPath ?? "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (p === "content/posts" || p.startsWith("content/posts/")) {
    throw new Error("禁止写入 content/posts：文章请走 post_*");
  }
}

/**
 * Agent FS 路径单点（读写对称）：
 * - content/：读任意知识库；写仅 content/uploads/
 * - data/：只读运行时产物（tool-results / webpages / sessions / workspace 审计路径等）
 *   写禁止走 write_file（由 offload / save_webpage / 专用工具落盘；工作产物写 Workspace 相对路径）
 * - apps/algo-viz/：只读（对照样例）；创建/注册动画用 algo_viz_create
 * - host: / 授权绝对路径：须 native:host_access + hostAccess.roots；群聊拒绝
 * - 其余：落到当前 Agent Workspace（无 Workspace → data/workspace/）
 * - list/search 默认 Workspace 根，禁止裸扫项目根
 */
export async function resolveAgentFsPath(
  ctx: NativeToolContext,
  relPath: string,
  mode: "read" | "write",
): Promise<{ abs: string; relForReturn: string }> {
  let p = String(relPath ?? "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (!p || p === ".") p = "";
  if (p.includes("..") || String(relPath ?? "").includes("..")) throw new Error("路径不允许包含 ..");

  if (looksLikeHostPath(relPath) || looksLikeHostPath(p)) {
    await assertHostSessionAllowed({
      config: ctx.config,
      prisma: ctx.prisma,
      sessionId: ctx.sessionId,
      tools: ctx.agentSnapshot?.tools,
      requireCapability: true,
    });
    const hostAbs = resolveHostAbsolutePath(ctx.config, String(relPath ?? p));
    if (!hostAbs) {
      throw new Error(
        `路径不在 hostAccess.roots 内：${relPath}。下一步：先调 host_access 查看允许的本机目录。`,
      );
    }
    if (isAbsInside(ctx.config.projectRoot, hostAbs)) {
      const relInside = path.relative(ctx.config.projectRoot, hostAbs).replace(/\\/g, "/");
      if (!relInside || relInside.startsWith("..")) {
        throw new Error(`无法把主机路径映射回项目内：${hostAbs}`);
      }
      return resolveAgentFsPath(ctx, relInside, mode);
    }
    if (mode === "write") assertHostWritePathSafe(ctx.config, hostAbs);
    else assertHostReadPathSafe(ctx.config, hostAbs);
    return { abs: hostAbs, relForReturn: toHostDisplayPath(hostAbs) };
  }

  if (/^[a-zA-Z]:[\\/]/.test(p) || /^[\\/]/.test(p) || p.startsWith("//")) {
    throw new Error(`路径不允许为绝对路径：${relPath}`);
  }
  if (mode === "write") assertWriteAllowed(p || ".");

  // data/* 相对 projectRoot 只读白名单：其余 data/ 子目录默认拒绝
  if (p === "data" || p.startsWith("data/")) {
    if (mode === "write") {
      throw new Error(
        "禁止 write_file 直写 data/：运行时目录只读。工作产物请写 Workspace 相对路径（如 notes.md）；" +
          "大工具结果 / 网页存档由运行时自动落盘后用 read_file 读回。",
      );
    }
    const allowed = DATA_READ_ALLOWLIST.some((prefix) => p === prefix.slice(0, -1) || p.startsWith(prefix));
    if (!allowed) {
      throw new Error(
        `禁止 read_file 读取 ${p}：data/ 目录仅允许 ${DATA_READ_ALLOWLIST.join(", ")}（运行时产物）。` +
          "敏感数据请走对应实体 procedure；工作产物请写 Workspace 相对路径。",
      );
    }
    const abs = resolveSafePath(ctx.config, p === "data" ? "data" : p);
    return { abs, relForReturn: p === "data" ? "data" : p };
  }
  // workspaces/*：仅允许当前 Agent 自己的 Workspace；无 Workspace 则全拒
  if (p === "workspaces" || p.startsWith("workspaces/")) {
    const wsId = ctx.agentSnapshot?.workspaceId;
    if (!wsId) {
      throw new Error("禁止 read_file 读取 workspaces/：当前 Agent 未绑定 Workspace。工作产物请写 Workspace 相对路径。");
    }
    const ws = await ctx.prisma?.workspace.findUnique({ where: { id: wsId }, select: { path: true } });
    const wsPath = (ws as { path?: string } | null)?.path?.trim();
    if (!wsPath) {
      throw new Error(`禁止 read_file 读取 workspaces/：当前 Agent 的 Workspace ${wsId} 缺少 path 字段。`);
    }
    const wsAbs = path.isAbsolute(wsPath) ? path.resolve(wsPath) : resolveSafePath(ctx.config, wsPath);
    if (p === "workspaces") {
      throw new Error("禁止 read_file 裸扫 workspaces/ 根目录：只允许访问当前 Agent 自己的 Workspace 子目录。");
    }
    const abs = resolveSafePath(ctx.config, p);
    if (!isAbsInside(wsAbs, abs)) {
      throw new Error(
        `禁止 read_file 读取 ${p}：只允许访问当前 Agent 自己的 Workspace（${wsPath}）。`,
      );
    }
    if (mode === "write") assertWritePathSafe(ctx.config, abs);
    return { abs, relForReturn: p };
  }
  // 日记 / pinned 工具会回传 config/memories/…；只读开放，其它 config 仍禁止裸扫
  if (p === "config/memories" || p.startsWith("config/memories/")) {
    if (mode === "write") {
      throw new Error(
        "禁止 write_file 直写 config/memories：请用 memory_create / memory_daily_append / pinned_memory_write",
      );
    }
    const abs = resolveSafePath(ctx.config, p);
    return { abs, relForReturn: p };
  }
  if (p.startsWith("content/") || p === "content") {
    if (mode === "write") {
      const allowed = CONTENT_WRITE_PREFIXES.some((a) => p.startsWith(a));
      if (!allowed) {
        throw new Error(
          `禁止 write_file 直写 ${p}：content/ 仅 uploads 可写；建库/首页走 garden_*，文章走 post_*`,
        );
      }
      // uploads/viz 只收媒体成品；Remotion 源码必须走 algo_viz_create（禁止再甩 deploy 脚本给用户）
      if (
        (p === "content/uploads/viz" || p.startsWith("content/uploads/viz/")) &&
        !/\.(mp4|webm|png|jpe?g|webp|gif|svg)$/i.test(p)
      ) {
        throw new Error(
          `禁止 write_file 写动画源码到 ${p}：请用 native:algo_viz_create（自动写入 apps/algo-viz 并注册）。` +
            "content/uploads/viz/ 仅可放 mp4/海报等媒体。禁止让用户跑 cp/deploy 脚本。",
        );
      }
    }
    if (p === "content") p = "content";
    const abs = resolveSafePath(ctx.config, p || "content");
    if (mode === "write") assertWritePathSafe(ctx.config, abs);
    return { abs, relForReturn: p || "content" };
  }

  if (isAlgoVizProjectPath(p)) {
    if (mode === "write") {
      throw new Error(
        `禁止 write_file 写 ${p}：请用 native:algo_viz_create 创建并自动注册动画组件`,
      );
    }
    const packageRootAbs = resolveSafePath(ctx.config, ALGO_VIZ_ROOT);
    const abs =
      p === ALGO_VIZ_ROOT
        ? packageRootAbs
        : resolveWithinDir(packageRootAbs, p.slice(`${ALGO_VIZ_ROOT}/`.length));
    assertPathWithinDir(packageRootAbs, abs);
    return { abs, relForReturn: p };
  }

  const wsId = ctx.agentSnapshot?.workspaceId;
  let wsRelPath = "";
  if (wsId && ctx.prisma) {
    const ws = await ctx.prisma.workspace.findUnique({ where: { id: wsId } }).catch((err) => {
      console.warn("[writePolicy] best-effort failed:", err instanceof Error ? err.message : err);
      return null;
    });
    wsRelPath = (ws as { path?: string } | null)?.path?.trim() || "";
  }
  if (!wsRelPath) {
    const fallback = p ? `data/workspace/${p}` : "data/workspace";
    const abs = resolveSafePath(ctx.config, fallback);
    if (mode === "write") assertWritePathSafe(ctx.config, abs);
    return { abs, relForReturn: fallback };
  }
  const wsAbs = path.isAbsolute(wsRelPath) ? path.resolve(wsRelPath) : resolveSafePath(ctx.config, wsRelPath);
  const abs = p ? resolveWithinDir(wsAbs, p) : wsAbs;
  if (mode === "write") assertWritePathSafe(ctx.config, abs);
  const relForReturn = path.relative(ctx.config.projectRoot, abs).replace(/\\/g, "/");
  if (mode === "write") assertWriteAllowed(relForReturn);
  return { abs, relForReturn };
}
