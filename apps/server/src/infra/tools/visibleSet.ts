/**
 * VisibleSet — 本 Agent 此刻能看见 / 能调哪些工具的唯一派生。
 *
 * 派生顺序（测试按此断言）：
 * 1. 全集 = universe 中 kind==="native"；带 domain 且 !domainAllowed → 剔除（reason=pack）。
 *    缺省 universe = listTools("native")。registry 无 domain 时：未注册 = 不在全集。
 * 2. 规范化 agentTools：无前缀当 native:；完全空数组 → getTierTemplate(tier).tools。
 * 3. 与 parseAgentTools 相同规则拆 native / skills / skillWildcard / mcp。
 *    无 native 前缀但有 skill/mcp → native 回退 DEFAULT_AGENT_NATIVE。
 * 4. defaultHidden：不在显式名单的 hidden 剔除。native:all 仍跳过 hidden。显式点名的 hidden 保留。
 * 5. tier：getAllowedToolsForTier（禁止复制 TIER_RESTRICTED_TOOLS）。
 * 6. own = (childOwn ?? []) ∩ 全集（步骤1）；own 仍过 hidden/pack/tier。
 * 7. inherited = 步骤5结果 − own。
 * 8. mask 只打 inherited。allow+deny 都非空 → InheritMaskConflictError。
 *    deny ∩ own → 不删 own，console.warn。
 * 9. visible.native = unique(maskedInherited ∪ own)，字母序。
 * 10. nativeAll = 显式 native:all 且没有 allow/deny mask。
 * 11. reasonByName：own 标 own；被 hidden/tier/mask/pack 丢掉的标对应原因。
 */

import {
  DEFAULT_AGENT_NATIVE,
  domainAllowed,
  type AgentTier,
  type NativeToolDomain,
  type PackFlags,
} from "@knowpilot/shared";
import { getTierTemplate } from "../agentFactory.js";
import { getAllowedToolsForTier } from "../swarmPermissionGuard.js";
import { getTool, listTools } from "./registry.js";

export type VisibleUniverseEntry = {
  name: string;
  kind: "native" | "skill" | "mcp";
  domain?: NativeToolDomain;
  defaultHidden?: boolean;
};

export type InheritMask = { allow?: string[]; deny?: string[] };

export type VisibleSetInput = {
  agentId: string;
  tier: string;
  agentTools: string[];
  packs: PackFlags;
  inheritMask?: InheritMask;
  childOwn?: string[];
  universe?: VisibleUniverseEntry[];
};

export type VisibleReason = "hidden" | "tier" | "mask" | "pack" | "own";

export type VisibleSet = {
  native: string[];
  skills: string[];
  mcpServers: string[];
  skillWildcard: boolean;
  nativeAll: boolean;
  reasonByName: Record<string, VisibleReason>;
};

export class InheritMaskConflictError extends Error {
  constructor() {
    super("inheritMask.allow 与 inheritMask.deny 互斥，只传一个");
    this.name = "InheritMaskConflictError";
  }
}

function bareNative(name: string): string {
  return name.startsWith("native:") ? name.slice("native:".length) : name;
}

function normalizeAgentTools(tools: string[]): string[] {
  return tools.map((tool) => {
    if (tool.startsWith("native:") || tool.startsWith("skill:") || tool.startsWith("mcp:")) return tool;
    if (tool.includes(":")) return tool;
    return `native:${tool}`;
  });
}

export function deriveVisibleSet(input: VisibleSetInput): VisibleSet {
  const tier = input.tier || "sub";
  const reasonByName: Record<string, VisibleReason> = {};

  const universeEntries: VisibleUniverseEntry[] =
    input.universe ??
    listTools("native").map((t) => ({
      name: t.name,
      kind: "native" as const,
      defaultHidden: t.defaultHidden,
    }));

  const universe = new Set<string>();
  const hiddenByName = new Map<string, boolean>();
  for (const entry of universeEntries) {
    if (entry.kind !== "native") continue;
    if (entry.domain && !domainAllowed(entry.domain, input.packs)) {
      reasonByName[entry.name] = "pack";
      continue;
    }
    universe.add(entry.name);
    if (entry.defaultHidden !== undefined) {
      hiddenByName.set(entry.name, entry.defaultHidden);
    } else {
      hiddenByName.set(entry.name, getTool(entry.name)?.defaultHidden === true);
    }
  }

  let agentTools = normalizeAgentTools(input.agentTools ?? []);
  if (agentTools.length === 0) {
    agentTools = [...getTierTemplate(tier as AgentTier).tools];
  }

  const nativeRefs = agentTools.filter((t) => t.startsWith("native:")).map((t) => t.slice("native:".length));
  const skillRefs = agentTools.filter((t) => t.startsWith("skill:")).map((t) => t.slice("skill:".length));
  const skillWildcard = skillRefs.includes("*");
  const skills = skillRefs.filter((s) => s !== "*");
  const mcpServers = agentTools.filter((t) => t.startsWith("mcp:")).map((t) => t.slice("mcp:".length));

  const explicitNativeAll = nativeRefs.includes("all");
  const explicitNamed = new Set(nativeRefs.filter((n) => n !== "all"));

  let requested: string[];
  if (nativeRefs.length > 0) {
    requested = explicitNativeAll ? [...universe] : nativeRefs.filter((n) => n !== "all");
  } else {
    requested = [...DEFAULT_AGENT_NATIVE];
  }

  const afterHidden: string[] = [];
  for (const raw of requested) {
    const name = bareNative(raw);
    if (!universe.has(name)) continue;
    if (hiddenByName.get(name) === true && !explicitNamed.has(name)) {
      reasonByName[name] = "hidden";
      continue;
    }
    afterHidden.push(name);
  }

  const afterTier = getAllowedToolsForTier(tier, afterHidden).map(bareNative);
  const afterTierSet = new Set(afterTier);
  for (const name of afterHidden) {
    if (!afterTierSet.has(name)) reasonByName[name] = "tier";
  }

  const childOwn = (input.childOwn ?? []).map(bareNative);
  const ownRaw: string[] = [];
  for (const name of childOwn) {
    if (!universe.has(name)) continue;
    if (hiddenByName.get(name) === true && !explicitNamed.has(name)) {
      reasonByName[name] = "hidden";
      continue;
    }
    ownRaw.push(name);
  }
  const ownFinal = getAllowedToolsForTier(tier, ownRaw).map(bareNative);
  for (const name of ownRaw) {
    if (!ownFinal.includes(name)) reasonByName[name] = "tier";
  }
  const ownSet = new Set(ownFinal);
  for (const name of ownFinal) reasonByName[name] = "own";

  let inherited = [...afterTierSet].filter((n) => !ownSet.has(n));

  const allow = (input.inheritMask?.allow ?? []).map(bareNative).filter(Boolean);
  const deny = (input.inheritMask?.deny ?? []).map(bareNative).filter(Boolean);
  if (allow.length > 0 && deny.length > 0) {
    throw new InheritMaskConflictError();
  }
  if (allow.length > 0) {
    const allowSet = new Set(allow);
    const next: string[] = [];
    for (const name of inherited) {
      if (allowSet.has(name)) next.push(name);
      else reasonByName[name] = "mask";
    }
    inherited = next;
  } else if (deny.length > 0) {
    const denySet = new Set(deny);
    const ignoredOwn: string[] = [];
    const next: string[] = [];
    for (const name of inherited) {
      if (denySet.has(name)) reasonByName[name] = "mask";
      else next.push(name);
    }
    inherited = next;
    for (const name of deny) {
      if (ownSet.has(name)) ignoredOwn.push(name);
    }
    if (ignoredOwn.length > 0) {
      console.warn(`[visibleSet] inheritMask.deny 忽略 own 工具: ${ignoredOwn.join(", ")}`);
    }
  }

  const native = [...new Set([...inherited, ...ownFinal])].sort((a, b) => a.localeCompare(b));
  const hasMask = allow.length > 0 || deny.length > 0;

  return {
    native,
    skills,
    mcpServers,
    skillWildcard,
    nativeAll: explicitNativeAll && !hasMask,
    reasonByName,
  };
}

export function visibleSetToAgentTools(v: VisibleSet): string[] {
  const out = v.native.map((n) => `native:${n}`);
  for (const s of v.skills) out.push(`skill:${s}`);
  if (v.skillWildcard) out.push("skill:*");
  for (const m of v.mcpServers) out.push(`mcp:${m}`);
  return out;
}

/** 仅类型占位：parsed 转换放 agentTools.ts，避免 visibleSet ↔ agentTools 环。 */
export type { InheritMask as VisibleInheritMask };
