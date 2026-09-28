/**
 * WP5：运行时上下文快照 + VisibleSet 内工具 promptSection 拼装。
 * fs-policy 文案来自 writePolicy.describePolicy。
 */

import { getTool } from "./tools/registry.js";
import { listPlatformLoginStatus } from "./metablog/auth/platformLogin.js";
import { getLlmBudgetStatus } from "./llmBudget.js";
import { describePolicy } from "./writePolicy.js";
import type { NativeToolContext } from "./tools/native/types.js";

export const LOGIN_WALL_PROMPT_SECTION =
  "- 登录墙 / 已在 Chrome 打开的页：优先 `dokobot_read`/`dokobot_search`（本机扩展）；否则 `browser_login_status`/`platform_doctor` → `platform_login` → `read_article`。禁止截图查登录态、禁止让用户 F12 抄 cookie。";

export function collectVisiblePromptSections(
  visibleNative: string[],
  tier?: string,
): string {
  const items: { order: number; name: string; text: string }[] = [];
  for (const name of visibleNative) {
    const sec = getTool(name)?.promptSection;
    if (!sec) continue;
    const text = typeof sec.text === "function" ? sec.text({ tier }) : sec.text;
    if (!text?.trim()) continue;
    items.push({ order: sec.order, name, text });
  }
  items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  return items.map((i) => i.text).join("\n\n");
}

export async function buildRuntimeContextBlock(input: {
  ctx: NativeToolContext;
  workspace?: string;
  login?: string[];
  budget?: string;
  fsPolicy?: string;
}): Promise<string> {
  const workspace = input.workspace ?? (await resolveWorkspaceLine(input.ctx));
  const fsPolicy = input.fsPolicy ?? describePolicy();
  const loginNames = input.login ?? listPlatformLoginStatus()
    .filter((p) => p.loggedIn)
    .map((p) => p.platform);
  const login = loginNames.length ? loginNames.join(", ") : "none";
  const budget = input.budget ?? formatBudgetLine(input.ctx);
  return [
    "<!-- om-runtime-context -->",
    "Current runtime context. This snapshot supersedes earlier runtime-context snapshots.",
    "",
    `workspace: ${workspace}`,
    `fs-policy: ${fsPolicy}`,
    `login: ${login}`,
    `budget: ${budget}`,
    "<!-- /om-runtime-context -->",
  ].join("\n");
}

function formatBudgetLine(ctx: NativeToolContext): string {
  try {
    const s = getLlmBudgetStatus(ctx.config);
    const remaining = Math.max(0, s.limitUsd - s.spentUsd - s.reservedUsd);
    return `remaining=$${remaining.toFixed(2)} / limit=$${s.limitUsd.toFixed(2)}`;
  } catch {
    return "unknown";
  }
}

async function resolveWorkspaceLine(ctx: NativeToolContext): Promise<string> {
  const id = ctx.agentSnapshot?.workspaceId;
  if (!id) return "none";
  const prisma = ctx.prisma ?? (ctx.services as { prisma?: NativeToolContext["prisma"] })?.prisma;
  if (!prisma) return `none (${id})`;
  try {
    const ws = await prisma.workspace.findUnique({
      where: { id },
      select: { id: true, path: true },
    });
    if (!ws) return "none";
    return `${ws.path} (${ws.id})`;
  } catch {
    return "none";
  }
}
