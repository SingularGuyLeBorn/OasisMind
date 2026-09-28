/**
 * 换叶后水合：invalidate 树 + listForChat 再灌 store。失败走 onCatch，不抛未处理 rejection。
 */

import { describe, expect, it, vi } from "vitest";
import { hydrateAfterSessionTreeChange, listForChatItems } from "../sessionTreeHydrate";
import { sessionMessagesStore } from "@/lib/useSessionMessages";
import { bumpSessionMessageHydrateEpoch, getSessionMessageHydrateEpoch } from "../sessionMessageHydrateEpoch";

vi.mock("@/lib/useSessionMessages", () => ({
  sessionMessagesStore: {
    hydrateSessionMessages: vi.fn(),
  },
}));

function makeUtils(fetchImpl: () => Promise<unknown>, cancelImpl?: () => Promise<unknown>) {
  return {
    session: {
      tree: { invalidate: vi.fn(() => Promise.resolve()) },
      inspectTurn: { invalidate: vi.fn(() => Promise.resolve()) },
    },
    message: {
      listForChat: {
        fetch: vi.fn(fetchImpl),
        invalidate: vi.fn(() => Promise.resolve()),
        cancel: vi.fn(cancelImpl ?? (() => Promise.resolve())),
      },
    },
  };
}

describe("listForChatItems", () => {
  it("收普通 { items } 与 infinite pages", () => {
    expect(listForChatItems({ items: [{ id: "a" }] })).toEqual([{ id: "a" }]);
    expect(listForChatItems({ pages: [{ items: [{ id: "a" }] }, { items: [{ id: "b" }] }] })).toEqual([
      { id: "a" },
      { id: "b" },
    ]);
    expect(listForChatItems(null)).toEqual([]);
    expect(listForChatItems({})).toEqual([]);
  });
});

describe("hydrateAfterSessionTreeChange", () => {
  it("invalidate 树 / inspectTurn / listForChat，再按活跃路径水合，并 bump epoch", async () => {
    const onCatch = vi.fn();
    const utils = makeUtils(() => Promise.resolve({ items: [{ id: "m1", content: "hi" }] }));

    hydrateAfterSessionTreeChange(utils, "sess-1", onCatch);

    expect(utils.session.tree.invalidate).toHaveBeenCalledWith({ sessionId: "sess-1" });
    expect(utils.session.inspectTurn.invalidate).toHaveBeenCalledWith({ sessionId: "sess-1" });
    expect(utils.message.listForChat.invalidate).toHaveBeenCalledWith({ sessionId: "sess-1" });
    await vi.waitFor(() => {
      expect(utils.message.listForChat.cancel).toHaveBeenCalledWith({ sessionId: "sess-1" });
      expect(utils.message.listForChat.fetch).toHaveBeenCalledWith(
        { sessionId: "sess-1", limit: 50 },
        { staleTime: 0 },
      );
    });
    expect(getSessionMessageHydrateEpoch("sess-1")).toBeGreaterThan(0);

    await vi.waitFor(() => {
      expect(sessionMessagesStore.hydrateSessionMessages).toHaveBeenCalledWith(
        "sess-1",
        [{ id: "m1", content: "hi" }],
        "active_path",
      );
    });
    expect(onCatch).not.toHaveBeenCalled();
  });

  it("infinite pages 形状也能水合", async () => {
    vi.mocked(sessionMessagesStore.hydrateSessionMessages).mockClear();
    const onCatch = vi.fn();
    const utils = makeUtils(() =>
      Promise.resolve({ pages: [{ items: [{ id: "m2", content: "page" }] }] }),
    );
    hydrateAfterSessionTreeChange(utils, "sess-pages", onCatch);
    await vi.waitFor(() => {
      expect(sessionMessagesStore.hydrateSessionMessages).toHaveBeenCalledWith(
        "sess-pages",
        [{ id: "m2", content: "page" }],
        "active_path",
      );
    });
  });

  it("listForChat 空快照不覆盖、不水合", async () => {
    vi.mocked(sessionMessagesStore.hydrateSessionMessages).mockClear();
    const onCatch = vi.fn();
    const utils = makeUtils(() => Promise.resolve({ items: [] }));

    hydrateAfterSessionTreeChange(utils, "sess-empty", onCatch);

    await vi.waitFor(() => {
      expect(onCatch).toHaveBeenCalled();
    });
    expect(sessionMessagesStore.hydrateSessionMessages).not.toHaveBeenCalled();
  });

  it("listForChat 失败走 onCatch，不水合", async () => {
    vi.mocked(sessionMessagesStore.hydrateSessionMessages).mockClear();
    const onCatch = vi.fn();
    const boom = new Error("network");
    const utils = makeUtils(() => Promise.reject(boom));

    hydrateAfterSessionTreeChange(utils, "sess-2", onCatch);

    await vi.waitFor(() => {
      expect(onCatch).toHaveBeenCalledWith(boom);
    });
    expect(sessionMessagesStore.hydrateSessionMessages).not.toHaveBeenCalled();
  });

  it("bump epoch 后 get 增加", () => {
    const before = getSessionMessageHydrateEpoch("sess-epoch");
    bumpSessionMessageHydrateEpoch("sess-epoch");
    expect(getSessionMessageHydrateEpoch("sess-epoch")).toBe(before + 1);
  });

  it("世代过期的 listForChat 快照不水合", async () => {
    vi.mocked(sessionMessagesStore.hydrateSessionMessages).mockClear();
    const onCatch = vi.fn();
    let release: (page: unknown) => void = () => {};
    const utils = makeUtils(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    hydrateAfterSessionTreeChange(utils, "sess-stale", onCatch);
    bumpSessionMessageHydrateEpoch("sess-stale");
    release({ items: [{ id: "old", content: "stale" }] });
    await Promise.resolve();
    await Promise.resolve();
    expect(sessionMessagesStore.hydrateSessionMessages).not.toHaveBeenCalled();
    expect(onCatch).not.toHaveBeenCalled();
  });

  it("先 cancel 在途 listForChat 再 fetch，避免接到换叶前的快照", async () => {
    vi.mocked(sessionMessagesStore.hydrateSessionMessages).mockClear();
    const order: string[] = [];
    const onCatch = vi.fn();
    const utils = makeUtils(
      async () => {
        order.push("fetch");
        return { items: [{ id: "fresh", content: "ok" }] };
      },
      async () => {
        order.push("cancel");
      },
    );
    hydrateAfterSessionTreeChange(utils, "sess-cancel", onCatch);
    await vi.waitFor(() => {
      expect(order).toEqual(["cancel", "fetch"]);
    });
    expect(sessionMessagesStore.hydrateSessionMessages).toHaveBeenCalledWith(
      "sess-cancel",
      [{ id: "fresh", content: "ok" }],
      "active_path",
    );
  });
});
