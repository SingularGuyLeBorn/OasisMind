/**
 * IM 渠道出站台账。
 *
 * 系统终稿兜底规则（铁律）：
 * - 中间发过进度 / 短通知 → 不挡兜底
 * - 仅当工具已发出与终稿实质相同的正式内容时 → 跳过兜底（防双发）
 * - 艾特/引用永远由工具参数决定；兜底永不艾特
 */

export type ChannelOutboundKind = "progress" | "answer";

type SessionOutbound = {
  /** 本 run 最近一次 kind=answer 发出的正文（用于与 done 终稿比对） */
  lastAnswerTextByChannel: Map<string, string>;
};

const bySession = new Map<string, SessionOutbound>();

function ensure(sessionId: string): SessionOutbound {
  let row = bySession.get(sessionId);
  if (!row) {
    row = { lastAnswerTextByChannel: new Map() };
    bySession.set(sessionId, row);
  }
  return row;
}

/** 比对用：去空白、去群聊 <@!openid> 前缀 */
export function normalizeChannelOutboundText(text: string): string {
  return String(text ?? "")
    .replace(/<@![^>]+>/g, "")
    .replace(/\s+/g, "")
    .trim();
}

/**
 * 工具发出的 answer 是否已经覆盖终稿（相同，或一方包含另一方且短边足够长）。
 * 中间短句 answer / progress 不会命中长终稿 → 仍走系统兜底。
 */
export function isSameChannelFinal(
  sentText: string | undefined | null,
  finalText: string | undefined | null,
): boolean {
  const a = normalizeChannelOutboundText(sentText ?? "");
  const b = normalizeChannelOutboundText(finalText ?? "");
  if (!a || !b) return false;
  if (a === b) return true;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  // 短边至少 24 字，避免「好的」「收到」误判为已发终稿
  if (shorter.length < 24) return false;
  return longer.includes(shorter);
}

/** 入站起流前清零 */
export function clearChannelOutbound(sessionId: string): void {
  bySession.delete(sessionId);
}

/** send_qq_* 成功出站后记账；progress 不记正文（永不抑制兜底） */
export function markChannelOutbound(
  sessionId: string | undefined | null,
  channel: string,
  kind: ChannelOutboundKind = "answer",
  text?: string,
): void {
  if (!sessionId?.trim() || !channel.trim()) return;
  if (kind !== "answer") return;
  const body = String(text ?? "").trim();
  if (!body) return;
  ensure(sessionId).lastAnswerTextByChannel.set(channel, body);
}

/**
 * 是否应跳过系统终稿兜底。
 * 仅当已用工具发出与 finalText 实质相同的 answer 时为 true。
 * 中间发过 progress / 不相干短句 → false，系统仍抓取终稿。
 */
export function shouldSkipChannelFallback(
  sessionId: string | undefined | null,
  channel: string,
  finalText: string,
): boolean {
  if (!sessionId?.trim()) return false;
  const sent = bySession.get(sessionId)?.lastAnswerTextByChannel.get(channel);
  return isSameChannelFinal(sent, finalText);
}

/** @deprecated 用 shouldSkipChannelFallback；保留给旧测试迁移期 */
export function hasChannelAnswerOutbound(
  sessionId: string | undefined | null,
  channel: string,
): boolean {
  if (!sessionId?.trim()) return false;
  return bySession.get(sessionId)?.lastAnswerTextByChannel.has(channel) === true;
}

export function __resetChannelOutboundLedgerForTests(): void {
  bySession.clear();
}
