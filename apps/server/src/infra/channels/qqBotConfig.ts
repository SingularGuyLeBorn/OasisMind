/**
 * QQ 官方机器人本地配置。
 *
 * 这个模块只解析环境变量和账号映射，不连接平台，也不依赖消息网关或数据库。
 * 因此 CLI 可以在服务端未启动时安全地做配置体检。
 */

export type QqBotConfig = {
  appId: string;
  secret: string;
  enabled: boolean;
  /** 用户 openid 白名单；空=拒绝所有人，*=全开。 */
  allowedOpenIds: string[];
  /** 群 openid 白名单；空=拒绝全部群，*=任意群。 */
  allowedGroups: string[];
  useWs: boolean;
};

function parseCsvEnv(raw: string | undefined): string[] {
  return (raw || "")
    .split("#")[0]!
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

/** 同一 QQ 号可对应多串 openid，例如私聊与群聊身份。 */
export function splitMappedOpenIds(mapped: string | undefined): string[] {
  if (!mapped) return [];
  return [...new Set(mapped.split("|").map((value) => value.trim()).filter(Boolean))];
}

/** 解析 `数字号=openid` 映射；多项可用逗号或分号分隔。 */
export function parseQqIdOpenIdMap(raw: string | undefined): Map<string, string> {
  const map = new Map<string, string>();
  const body = (raw || "").split("#")[0] || "";
  for (const part of body.split(/[,;]/)) {
    const entry = part.trim();
    if (!entry) continue;
    const separator = entry.indexOf("=");
    if (separator <= 0) continue;
    const id = entry.slice(0, separator).trim();
    const openid = entry.slice(separator + 1).trim();
    if (!/^\d{5,12}$/.test(id) || !openid) continue;
    const previous = map.get(id);
    map.set(id, splitMappedOpenIds(previous ? `${previous}|${openid}` : openid).join("|"));
  }
  return map;
}

/** 根据本地映射把平台 openid 反查为数字 QQ 号。 */
export function resolveQqNumberForOpenId(
  openid: string,
  idToOpenId: Map<string, string> = parseQqIdOpenIdMap(process.env.QQ_BOT_QQ_OPENID_MAP),
): string | undefined {
  const normalized = openid.trim();
  if (!normalized) return undefined;
  for (const [qq, mapped] of idToOpenId) {
    if (mapped === normalized || splitMappedOpenIds(mapped).includes(normalized)) return qq;
  }
  return undefined;
}

/**
 * 把白名单中的数字 QQ/群号展开为 openid；已经是 openid 或 `*` 的条目原样保留。
 */
export function expandAllowedIds(
  entries: string[],
  idToOpenId: Map<string, string>,
  label: string,
): string[] {
  const output = new Set<string>();
  for (const entry of entries) {
    if (entry === "*") {
      output.add("*");
      continue;
    }
    if (/^\d{5,12}$/.test(entry)) {
      const openids = splitMappedOpenIds(idToOpenId.get(entry));
      if (openids.length > 0) {
        for (const openid of openids) output.add(openid);
        output.add(entry);
      } else {
        console.warn(`[qq] ${label} 含数字号 ${entry}，但没有对应的 OPENID_MAP`);
        output.add(entry);
      }
      continue;
    }
    output.add(entry);
  }
  for (const [id, mapped] of idToOpenId) {
    const openids = splitMappedOpenIds(mapped);
    if (entries.includes(id) || openids.some((openid) => entries.includes(openid)) || entries.includes("*")) {
      for (const openid of openids) output.add(openid);
      output.add(id);
    }
  }
  return [...output];
}

export function loadQqBotConfigFromEnv(): QqBotConfig {
  const appId = (process.env.QQ_BOT_APP_ID || "").trim();
  const secret = (process.env.QQ_BOT_SECRET || "").trim();
  const qqMap = parseQqIdOpenIdMap(process.env.QQ_BOT_QQ_OPENID_MAP);
  const groupMap = parseQqIdOpenIdMap(process.env.QQ_BOT_GROUP_OPENID_MAP);
  return {
    appId,
    secret,
    enabled: Boolean(appId && secret) && process.env.QQ_BOT_ENABLED !== "false",
    allowedOpenIds: expandAllowedIds(
      parseCsvEnv(process.env.QQ_BOT_ALLOWED_OPENIDS),
      qqMap,
      "QQ_BOT_ALLOWED_OPENIDS",
    ),
    allowedGroups: expandAllowedIds(
      parseCsvEnv(process.env.QQ_BOT_ALLOWED_GROUPS),
      groupMap,
      "QQ_BOT_ALLOWED_GROUPS",
    ),
    useWs: process.env.QQ_BOT_WS === "1" || process.env.QQ_BOT_WS === "true",
  };
}
