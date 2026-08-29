/**
 * 会话树换叶后的 PULL 水合：树条 / SSE / 跨标签 / 从这里另写同一条路径。
 * 禁止各处各写一遍 listForChat + invalidate，否则必漂。
 */

import type { ChatMessage } from "@oasismind/shared";
import { sessionMessagesStore } from "@/lib/useSessionMessages";
import {
  bumpSessionMessageHydrateEpoch,
  getSessionMessageHydrateEpoch,
} from "@/lib/sessionMessageHydrateEpoch";

export type SessionTreeHydrateUtils = {
  session: {
    tree: { invalidate: (input: { sessionId: string }) => Promise<unknown> };
    inspectTurn: { invalidate: (input: { sessionId: string }) => Promise<unknown> };
  };
  message: {
    listForChat: {
      fetch: (
        input: { sessionId: string; limit: number },
        opts?: { staleTime?: number },
      ) => Promise<unknown>;
      invalidate: (input: { sessionId: string }) => Promise<unknown>;
      cancel?: (input: { sessionId: string }) => Promise<unknown>;
    };
  };
};

/** tRPC 普通页或 infinite pages 都收成数组。错形状当空，由调用方拒绝覆盖。 */
export function listForChatItems(page: unknown): ChatMessage[] {
  if (!page || typeof page !== "object") return [];
  const rec = page as { items?: unknown; pages?: Array<{ items?: unknown }> };
  if (Array.isArray(rec.items)) return rec.items as ChatMessage[];
  if (Array.isArray(rec.pages)) {
    return rec.pages.flatMap((p) => (Array.isArray(p?.items) ? (p.items as ChatMessage[]) : []));
  }
  return [];
}

/** 换叶权威已在服务端；按活跃路径 `active_path` 水合。空快照不得抹掉当前气泡。 */
export function hydrateAfterSessionTreeChange(
  utils: SessionTreeHydrateUtils,
  sessionId: string,
  onCatch: (err: unknown) => void,
): void {
  const epoch = bumpSessionMessageHydrateEpoch(sessionId);
  utils.session.tree.invalidate({ sessionId }).catch(onCatch);
  utils.session.inspectTurn.invalidate({ sessionId }).catch(onCatch);
  utils.message.listForChat.invalidate({ sessionId }).catch(onCatch);
  const cancelInFlight = utils.message.listForChat.cancel
    ? utils.message.listForChat.cancel({ sessionId }).catch(() => undefined)
    : Promise.resolve();
  cancelInFlight
    .then(() => {
      if (getSessionMessageHydrateEpoch(sessionId) !== epoch) return null;
      return utils.message.listForChat.fetch({ sessionId, limit: 50 }, { staleTime: 0 });
    })
    .then((page) => {
      if (page == null) return;
      if (getSessionMessageHydrateEpoch(sessionId) !== epoch) return;
      const items = listForChatItems(page);
      if (items.length === 0) {
        onCatch(new Error(`session.tree 水合：listForChat 空快照 session=${sessionId}，拒绝覆盖`));
        return;
      }
      sessionMessagesStore.hydrateSessionMessages(sessionId, items, "active_path");
    })
    .catch(onCatch);
}
