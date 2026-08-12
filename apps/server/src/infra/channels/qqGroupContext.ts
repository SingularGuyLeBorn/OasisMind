/**
 * QQ 群聊上下文缓冲：未 @ 机器人的消息只累计，@ 时拼进当前轮再起流。
 * 依赖官方 GROUP_MESSAGE_CREATE（群设置「获取群内全部消息」）。
 */

export type QqGroupHistoryItem = {
  openid: string;
  /** 平台 username（群名片/昵称）；可能空 */
  username?: string;
  /** 若 QQ_BOT_QQ_OPENID_MAP 能反查到数字号 */
  qqNumber?: string;
  text: string;
  at: Date;
};

const buffers = new Map<string, QqGroupHistoryItem[]>();

export function groupHistoryLimit(): number {
  const n = Number(process.env.QQ_BOT_GROUP_HISTORY_LIMIT);
  if (!Number.isFinite(n)) return 40;
  return Math.min(200, Math.max(0, Math.floor(n)));
}

export function pushQqGroupHistory(groupOpenid: string, item: QqGroupHistoryItem): void {
  const g = groupOpenid.trim();
  if (!g) return;
  const lim = groupHistoryLimit();
  if (lim <= 0) return;
  const text = item.text.trim();
  if (!text) return;
  const list = buffers.get(g) ?? [];
  list.push({
    openid: item.openid,
    username: item.username?.trim() || undefined,
    qqNumber: item.qqNumber?.trim() || undefined,
    text: text.slice(0, 500),
    at: item.at,
  });
  while (list.length > lim) list.shift();
  buffers.set(g, list);
}

/** 取出并清空缓冲（@ 触发时调用） */
export function takeQqGroupHistory(groupOpenid: string): QqGroupHistoryItem[] {
  const g = groupOpenid.trim();
  if (!g) return [];
  const list = buffers.get(g) ?? [];
  buffers.delete(g);
  return list;
}

export function peekQqGroupHistory(groupOpenid: string): QqGroupHistoryItem[] {
  return [...(buffers.get(groupOpenid.trim()) ?? [])];
}

export function formatSpeakerLabel(item: {
  openid: string;
  username?: string;
  qqNumber?: string;
}): string {
  const name = item.username?.trim();
  const qq = item.qqNumber?.trim();
  if (name && qq) return `${name}(${qq})`;
  if (name) return name;
  if (qq) return `QQ${qq}`;
  const id = item.openid.trim();
  return id.length > 10 ? `成员…${id.slice(-6)}` : id || "未知成员";
}

/** 拼进 @ 轮用户消息前的「群近况」块 */
export function formatQqGroupHistoryBlock(items: QqGroupHistoryItem[]): string {
  if (!items.length) return "";
  const lines = items.map((it) => {
    const t = it.at.toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit" });
    const oid = it.openid.trim();
    const who = formatSpeakerLabel(it);
    const idHint = oid ? ` openid=${oid}` : "";
    return `[${t}] ${who}${idHint}: ${it.text.replace(/\s+/g, " ").slice(0, 200)}`;
  });
  return (
    `【群聊近况（未@机器人，仅供上下文，共 ${items.length} 条；艾特他人用 atOpenIds 填 openid）】\n` +
    `${lines.join("\n")}\n` +
    `【当前 @ 消息】\n`
  );
}

/** 测试隔离 */
export function __resetQqGroupHistoryForTests(): void {
  buffers.clear();
}
