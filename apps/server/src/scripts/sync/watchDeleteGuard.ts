/**
 * D4锛歸atch unlink 涓庤繍琛屾椂 CRUD 鏀瑰悕绐楀彛鐨勫苟鍙戜繚鎶?
 *
 * 鐩爣琛?updatedAt 鍦?grace 绐楀彛鍐?鈫?璺宠繃鏈 deleteBySlug锛屼氦鐢卞叏閲忛噸鎵敹鏁涖€?
 */

import type { PrismaClient } from "@prisma/client";
import type { Syncer } from "./types.js";

export const WATCH_DELETE_GRACE_MS = 5000;

/** 璇?slug 瀵瑰簲琛屾槸鍚﹀湪 graceMs 鍐呭垰琚洿鏂帮紙鏀瑰悕绐楀彛淇濇姢锛?*/
export async function isWatchDeleteProtected(
  prisma: PrismaClient,
  entityName: string,
  slug: string,
  graceMs: number = WATCH_DELETE_GRACE_MS,
): Promise<boolean> {
  const since = new Date(Date.now() - graceMs);
  // Post:posts / Post:knowledge / Post:resources 鈥斺€?鎸夎姳鍥敹绐勬敼鍚嶇獥鍙?
  if (entityName === "Post" || entityName.startsWith("Post:")) {
    const garden = entityName.startsWith("Post:") ? entityName.slice("Post:".length) : undefined;
    return !!(await prisma.post.findFirst({
      where: {
        slug,
        ...(garden ? { garden } : {}),
        updatedAt: { gte: since },
      },
      select: { id: true },
    }));
  }

  switch (entityName) {
    case "Agent":
      return !!(await prisma.agent.findFirst({
        where: { sourceSlug: slug, updatedAt: { gte: since } },
        select: { id: true },
      }));
    case "Skill":
      return !!(await prisma.skill.findFirst({
        where: { sourceSlug: slug, updatedAt: { gte: since } },
        select: { id: true },
      }));
    case "McpServer":
      return !!(await prisma.mcpServer.findFirst({
        where: { sourceSlug: slug, updatedAt: { gte: since } },
        select: { id: true },
      }));
    case "Memory":
      return !!(await prisma.memory.findFirst({
        where: { sourceSlug: slug, updatedAt: { gte: since } },
        select: { id: true },
      }));
    case "Prompt":
      return !!(await prisma.prompt.findFirst({
        where: { sourceSlug: slug, updatedAt: { gte: since } },
        select: { id: true },
      }));
    case "Task":
      return !!(await prisma.task.findFirst({
        where: { sourceSlug: slug, updatedAt: { gte: since } },
        select: { id: true },
      }));
    case "InfoSource":
      return !!(await prisma.infoSource.findFirst({
        where: { sourceSlug: slug, updatedAt: { gte: since } },
        select: { id: true },
      }));
    default:
      return false;
  }
}

/** watch 璺緞鍙椾繚鎶ゅ垹闄わ細璺宠繃鏃?deleted=0 + skipped=true锛堣皟鐢ㄦ柟鏍囪鍏ㄩ噺閲嶆壂锛?*/
export async function guardedWatchDeleteBySlug(
  prisma: PrismaClient,
  syncer: Syncer,
  slug: string,
  graceMs: number = WATCH_DELETE_GRACE_MS,
): Promise<{ deleted: number; skipped: boolean }> {
  if (!syncer.deleteBySlug) return { deleted: 0, skipped: false };
  if (await isWatchDeleteProtected(prisma, syncer.entityName, slug, graceMs)) {
    return { deleted: 0, skipped: true };
  }
  const deleted = await syncer.deleteBySlug(prisma, slug);
  return { deleted, skipped: false };
}
