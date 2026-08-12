/**
 * 把 SessionStreamHub 的 token/done 折成渠道回发分片（节流）。
 */

import { randomUUID } from "node:crypto";
import type { AgentStreamEvent } from "./agentStream.js";
import type { ChannelReplyChunk } from "./messageGateway.js";

const FLUSH_MS = 450;

export type ChannelReplyEmit = ((event: AgentStreamEvent) => void) & {
  /** 等待节流片与终稿回发全部 settle（含失败吞掉后的 catch） */
  waitForChannelReplies?: () => Promise<void>;
};

export type ChannelReplyBridgeOpts = {
  /**
   * QQ 等渠道：中间片不回渠道；done 时若工具已发出与终稿实质相同的正式内容则跳过，
   * 否则系统兜底抓取终稿（中间只发过进度/短句仍要兜底）。兜底永不艾特。
   */
  fallbackOnlyWhenNoAnswer?: {
    sessionId: string;
    /** 返回 true = 终稿已被工具发出，跳过系统兜底 */
    shouldSkipFallback: (finalText: string) => boolean;
  };
};

/**
 * 包装 hub emit：先转发给 SSE 订阅方，再节流回渠道。
 * done 时以 event.content 为权威终稿（避免只靠 token 缓冲导致空回发）。
 */
export function wrapEmitForChannelReply(
  emit: (event: AgentStreamEvent) => void,
  onChunk: (chunk: ChannelReplyChunk) => void | Promise<void>,
  opts?: ChannelReplyBridgeOpts,
): ChannelReplyEmit {
  let buf = "";
  let reasoningBuf = "";
  const streamId = randomUUID().replace(/-/g, "").slice(0, 24);
  let lastFlush = 0;
  let finished = false;
  let chain: Promise<void> = Promise.resolve();
  const fallback = opts?.fallbackOnlyWhenNoAnswer;

  const flush = (finish: boolean, textOverride?: string) => {
    if (finished && finish) return;
    if (finish) finished = true;

    // 工具优先：中间片一律不回渠道；终稿仅在「尚未用工具发出相同终稿」时兜底
    if (fallback) {
      if (!finish) return;
      const text = (textOverride != null ? textOverride : buf).trim();
      if (!text) return;
      if (fallback.shouldSkipFallback(text)) return;
      lastFlush = Date.now();
      const p = Promise.resolve(
        onChunk({
          text,
          finish: true,
          streamId,
          // 兜底不艾特、不甩思考过程；艾特由 send_qq_* 的 at 参数决定
          imQuote: false,
        }),
      ).catch((err) => {
        console.warn(
          "[channelStreamBridge] 渠道兜底回发失败:",
          err instanceof Error ? err.message : err,
        );
      });
      chain = chain.then(() => p);
      return;
    }

    lastFlush = Date.now();
    const text = textOverride != null ? textOverride : buf;
    if (textOverride != null) buf = textOverride;
    const p = Promise.resolve(
      onChunk({ text, finish, streamId, reasoning: reasoningBuf || undefined }),
    ).catch((err) => {
      console.warn(
        "[channelStreamBridge] 渠道回发失败:",
        err instanceof Error ? err.message : err,
      );
    });
    chain = chain.then(() => p);
  };

  const wrapped: ChannelReplyEmit = (event: AgentStreamEvent) => {
    emit(event);
    if (event.type === "token" && event.delta) {
      buf += event.delta;
      if (fallback) return; // 工具优先：不节流推中间片
      const now = Date.now();
      if (now - lastFlush >= FLUSH_MS) flush(false);
    } else if (event.type === "thinking" && event.delta) {
      reasoningBuf += event.delta;
    } else if (event.type === "done") {
      const final =
        typeof event.content === "string" && event.content.trim()
          ? event.content
          : buf;
      flush(true, final);
    } else if (event.type === "error") {
      if (!buf) buf = `（生成失败）${event.message || ""}`;
      flush(true);
    }
  };
  wrapped.waitForChannelReplies = () => chain;
  return wrapped;
}

/** 兼容旧名：在 runner 内直接包 emit */
export function bridgeSessionReplyToChannel(opts: {
  emit: (event: AgentStreamEvent) => void;
  onChunk: (chunk: ChannelReplyChunk) => void | Promise<void>;
  /** 保留参数以兼容调用方；实际用 wrapEmit */
  sessionId?: string;
  hub?: unknown;
  signal?: AbortSignal;
}): ChannelReplyEmit {
  return wrapEmitForChannelReply(opts.emit, opts.onChunk);
}
