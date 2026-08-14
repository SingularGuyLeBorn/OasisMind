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

/** content/ 写入白名单：仅 uploads；其余 content/（含动态花园与 about）禁 write_file */
const CONTENT_WRITE_PREFIXES = ["content/uploads/"] as const;

/** 算法可视化工程：允许 read_file / list_directory；写入走 native:algo_viz_create */
const ALGO_VIZ_ROOT = "apps/algo-viz";

function isAlgoVizProjectPath(p: string): boolean {
  return p === ALGO_VIZ_ROOT || p.startsWith(`${ALGO_VIZ_ROOT}/`);
}

export function describePolicy(): string {
  return "uploads 可写；content/posts 走 post_*；data/ 只读；Workspace 相对可写";
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
  if (p.includes("..")) throw new Error("路径不允许包含 ..");
  if (/^[a-zA-Z]:[\\/]/.test(p) || /^[\\/]/.test(p) || p.startsWith("//")) {
    throw new Error(`路径不允许为绝对路径：${relPath}`);
  }
  if (mode === "write") assertWriteAllowed(p || ".");
  // data/* 相对 projectRoot 只读：与 offload / save_webpage / document_to_markdown 返回路径对齐
  if (p === "data" || p.startsWith("data/")) {
    if (mode === "write") {
      throw new Error(
        "禁止 write_file 直写 data/：运行时目录只读。工作产物请写 Workspace 相对路径（如 notes.md）；" +
          "大工具结果 / 网页存档由运行时自动落盘后用 read_file 读回。",
      );
    }
    const abs = resolveSafePath(ctx.config, p === "data" ? "data" : p);
    return { abs, relForReturn: p === "data" ? "data" : p };
  }
  // workspaces/*：write_file/search/list 常返回 projectRoot 相对路径；再读时禁止二次嵌进当前 Workspace
  if (p === "workspaces" || p.startsWith("workspaces/")) {
    const abs = resolveSafePath(ctx.config, p === "workspaces" ? "workspaces" : p);
    if (mode === "write") assertWritePathSafe(ctx.config, abs);
    return { abs, relForReturn: p === "workspaces" ? "workspaces" : p };
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
