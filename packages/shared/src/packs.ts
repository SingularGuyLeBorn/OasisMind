/**
 * OasisMind 能力包（Core + Packs）
 *
 * - core / chat：始终启用，不可关
 * - 可选 pack：swarm / im / mail / browser / research / viz
 * - 配置：config.yaml packs: + env OM_PACKS=lite|full 或 OM_PACKS_DISABLE=viz,research
 */

export const OPTIONAL_PACK_IDS = [
  "swarm",
  "im",
  "mail",
  "browser",
  "research",
  "viz",
] as const;

export type OptionalPackId = (typeof OPTIONAL_PACK_IDS)[number];
export type PackId = "core" | "chat" | OptionalPackId;

export type PackFlags = Record<OptionalPackId, boolean> & {
  core: true;
  chat: true;
};

/** 全功能（保持现网默认行为） */
export const PACKS_FULL: PackFlags = {
  core: true,
  chat: true,
  swarm: true,
  im: true,
  mail: true,
  browser: true,
  research: true,
  viz: true,
};

/** 轻量：花园 + Chat，无 Swarm/IM/邮件/浏览器预热/研究/可视化 */
export const PACKS_LITE: PackFlags = {
  core: true,
  chat: true,
  swarm: false,
  im: false,
  mail: false,
  browser: false,
  research: false,
  viz: false,
};

export function isOptionalPackId(id: string): id is OptionalPackId {
  return (OPTIONAL_PACK_IDS as readonly string[]).includes(id);
}

/**
 * 解析 packs：
 * 1. OM_PACKS=lite|full 优先（整包 profile）
 * 2. 否则用 yaml/base 布尔
 * 3. OM_PACKS_DISABLE=im,viz 再关掉列出的包
 * 4. OM_PACKS_ENABLE=im 再打开（便于 lite 上点开）
 */
export function resolvePackFlags(input?: {
  profile?: string;
  yaml?: Partial<Record<OptionalPackId, boolean>>;
  envProfile?: string;
  envDisable?: string;
  envEnable?: string;
}): PackFlags {
  const envProfile = (input?.envProfile ?? process.env.OM_PACKS ?? "").trim().toLowerCase();
  const yamlProfile = (input?.profile ?? "").trim().toLowerCase();
  const profile = envProfile || yamlProfile;

  let flags: PackFlags =
    profile === "lite"
      ? { ...PACKS_LITE }
      : profile === "full"
        ? { ...PACKS_FULL }
        : {
            ...PACKS_FULL,
            ...Object.fromEntries(
              OPTIONAL_PACK_IDS.map((id) => [id, input?.yaml?.[id] ?? true]),
            ),
          };

  const disable = (input?.envDisable ?? process.env.OM_PACKS_DISABLE ?? "")
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  for (const id of disable) {
    if (isOptionalPackId(id)) flags = { ...flags, [id]: false };
  }

  const enable = (input?.envEnable ?? process.env.OM_PACKS_ENABLE ?? "")
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  for (const id of enable) {
    if (isOptionalPackId(id)) flags = { ...flags, [id]: true };
  }

  return { ...flags, core: true, chat: true };
}

export function isPackEnabled(packs: PackFlags, id: PackId): boolean {
  if (id === "core" || id === "chat") return true;
  return packs[id] === true;
}

export function listEnabledOptionalPacks(packs: PackFlags): OptionalPackId[] {
  return OPTIONAL_PACK_IDS.filter((id) => packs[id]);
}

export function formatPacksSummary(packs: PackFlags): string {
  const on = listEnabledOptionalPacks(packs);
  if (on.length === OPTIONAL_PACK_IDS.length) return "full";
  if (on.length === 0) return "lite";
  return on.join("+");
}

/** 管理侧栏 href → 所需 pack（未列出 = core，始终显示） */
export const ADMIN_NAV_PACK: Record<string, OptionalPackId | "core"> = {
  "/agents": "swarm",
  "/subagents": "swarm",
  "/session-lineage": "swarm",
  "/workspaces": "swarm",
  "/cron": "swarm",
  "/approvals": "swarm",
  "/triggers": "swarm",
  "/tasks": "swarm",
  "/channels": "im",
  "/inbox": "research",
  "/platform-sync": "research",
  "/sources": "research",
  "/free-models": "core",
};

export function navItemAllowed(href: string, packs: PackFlags): boolean {
  const need = ADMIN_NAV_PACK[href];
  if (!need || need === "core") return true;
  return isPackEnabled(packs, need);
}

/**
 * Native 工具域名 → pack。未列出的域视为 core。
 * 注册时按域跳过；已落库 Agent.tools 若指向未注册工具会自然失败。
 */
export type NativeToolDomain =
  | "fs"
  | "web"
  | "shell"
  | "swarm"
  | "session"
  | "memory"
  | "integration"
  | "notify"
  | "askUser"
  | "skills"
  | "inbox"
  | "deploy"
  | "algoViz"
  | "articleVideo"
  | "mediaStt"
  | "agentCron"
  | "literature"
  | "document"
  | "qq";

export const NATIVE_DOMAIN_PACK: Record<NativeToolDomain, PackId> = {
  fs: "core",
  shell: "core",
  memory: "core",
  skills: "core",
  askUser: "core",
  document: "core",
  session: "chat",
  deploy: "core",
  web: "research", // 浏览器类工具运行时仍受 browser pack 启动影响；web 搜索归 research
  swarm: "swarm",
  notify: "swarm",
  agentCron: "swarm",
  qq: "im",
  integration: "research", // email 在 integration 内；关 research 仍可用 mail boot 单独通道
  inbox: "research",
  articleVideo: "research",
  mediaStt: "research",
  literature: "research",
  algoViz: "viz",
};

export function domainAllowed(domain: NativeToolDomain, packs: PackFlags): boolean {
  const need = NATIVE_DOMAIN_PACK[domain];
  // web：research 或 browser 任一开即可（截图/登录 vs 搜索读文）
  if (domain === "web") {
    return isPackEnabled(packs, "research") || isPackEnabled(packs, "browser");
  }
  // integration：research / mail / browser（platform_login）任一开
  if (domain === "integration") {
    return (
      isPackEnabled(packs, "research") ||
      isPackEnabled(packs, "mail") ||
      isPackEnabled(packs, "browser") ||
      isPackEnabled(packs, "im")
    );
  }
  return isPackEnabled(packs, need);
}
