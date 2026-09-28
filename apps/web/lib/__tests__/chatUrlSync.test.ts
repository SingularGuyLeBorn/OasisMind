import { describe, expect, it } from "vitest";
import {
  INITIAL_PREV_SESSION_FROM_URL,
  nextChatSearchFromFocus,
  shouldAdoptUrlSession,
  shouldCorrectFocusAfterHydrate,
} from "../useChatUrlSync";

/**
 * 把 hook 里 prevSessionFromUrlRef 的更新协议写成显式步进：
 * 每帧先判定 adopt，再把 prev 写成当前 URL（与 useEffect 顺序一致）。
 */
function adoptAcrossFrames(
  frames: Array<{ url: string | null; focused: string | null }>,
  prevInit: string | null | undefined = INITIAL_PREV_SESSION_FROM_URL,
): string[] {
  let prev = prevInit;
  const adopted: string[] = [];
  for (const frame of frames) {
    if (
      shouldAdoptUrlSession({
        prevSessionFromUrl: prev,
        sessionFromUrl: frame.url,
        focusedSessionId: frame.focused,
      })
    ) {
      adopted.push(frame.url as string);
    }
    prev = frame.url;
  }
  return adopted;
}

describe("shouldAdoptUrlSession", () => {
  it("首屏哨兵必须是 undefined，不能是当前 URL", () => {
    expect(INITIAL_PREV_SESSION_FROM_URL).toBeUndefined();
  });

  it("首次挂载：prev=undefined，深链与 storage 焦点不一致 → adopt", () => {
    expect(
      shouldAdoptUrlSession({
        prevSessionFromUrl: INITIAL_PREV_SESSION_FROM_URL,
        sessionFromUrl: "deep",
        focusedSessionId: "stored",
      }),
    ).toBe(true);
  });

  it("首次挂载：焦点仍空、URL 有 session → adopt", () => {
    expect(
      shouldAdoptUrlSession({
        prevSessionFromUrl: INITIAL_PREV_SESSION_FROM_URL,
        sessionFromUrl: "deep",
        focusedSessionId: null,
      }),
    ).toBe(true);
  });

  it("首次挂载：URL 与焦点已一致 → 不 adopt", () => {
    expect(
      shouldAdoptUrlSession({
        prevSessionFromUrl: INITIAL_PREV_SESSION_FROM_URL,
        sessionFromUrl: "same",
        focusedSessionId: "same",
      }),
    ).toBe(false);
  });

  it("首次挂载：URL 无 sessionId → 不 adopt", () => {
    expect(
      shouldAdoptUrlSession({
        prevSessionFromUrl: INITIAL_PREV_SESSION_FROM_URL,
        sessionFromUrl: null,
        focusedSessionId: "stored",
      }),
    ).toBe(false);
  });

  it("错误地把 prev 初始化成当前 URL：首屏深链不会 adopt（这就是旧 bug）", () => {
    expect(
      shouldAdoptUrlSession({
        prevSessionFromUrl: "deep",
        sessionFromUrl: "deep",
        focusedSessionId: "stored",
      }),
    ).toBe(false);
    expect(adoptAcrossFrames([{ url: "deep", focused: "stored" }], "deep")).toEqual([]);
  });

  it("同 URL 再渲染：不重复 adopt", () => {
    expect(
      adoptAcrossFrames([
        { url: "deep", focused: "stored" },
        { url: "deep", focused: "deep" },
        { url: "deep", focused: "deep" },
      ]),
    ).toEqual(["deep"]);
  });

  it("前进后退换 sessionId：再次 adopt", () => {
    expect(
      adoptAcrossFrames([
        { url: "a", focused: null },
        { url: "b", focused: "a" },
      ]),
    ).toEqual(["a", "b"]);
  });

  it("URL 被清掉：不 adopt 空会话", () => {
    expect(
      adoptAcrossFrames([
        { url: "a", focused: null },
        { url: null, focused: "a" },
      ]),
    ).toEqual(["a"]);
  });
});

describe("shouldCorrectFocusAfterHydrate", () => {
  it("未水合不纠", () => {
    expect(
      shouldCorrectFocusAfterHydrate({
        tabsHydrated: false,
        sessionFromUrl: "deep",
        focusedSessionId: "stored",
      }),
    ).toBe(false);
  });

  it("水合后 storage 旧焦点盖不住深链", () => {
    expect(
      shouldCorrectFocusAfterHydrate({
        tabsHydrated: true,
        sessionFromUrl: "deep",
        focusedSessionId: "stored",
      }),
    ).toBe(true);
  });

  it("水合后已对齐则不再纠", () => {
    expect(
      shouldCorrectFocusAfterHydrate({
        tabsHydrated: true,
        sessionFromUrl: "deep",
        focusedSessionId: "deep",
      }),
    ).toBe(false);
  });

  it("水合后 URL 无 session 不纠", () => {
    expect(
      shouldCorrectFocusAfterHydrate({
        tabsHydrated: true,
        sessionFromUrl: null,
        focusedSessionId: "stored",
      }),
    ).toBe(false);
  });
});

describe("nextChatSearchFromFocus", () => {
  it("openTab 换焦点时写入新 sessionId", () => {
    const r = nextChatSearchFromFocus({
      search: "sessionId=old",
      focusedSessionId: "new",
      prevFocusedSessionId: "old",
    });
    expect(r.changed).toBe(true);
    expect(new URLSearchParams(r.nextSearch).get("sessionId")).toBe("new");
  });

  it("焦点已与 URL 一致则不 replace", () => {
    const r = nextChatSearchFromFocus({
      search: "sessionId=abc",
      focusedSessionId: "abc",
      prevFocusedSessionId: "old",
    });
    expect(r.changed).toBe(false);
  });

  it("从有焦点变成无焦点则删 sessionId", () => {
    const r = nextChatSearchFromFocus({
      search: "sessionId=abc&view=main",
      focusedSessionId: null,
      prevFocusedSessionId: "abc",
    });
    expect(r.changed).toBe(true);
    expect(new URLSearchParams(r.nextSearch).get("sessionId")).toBeNull();
  });

  it("首屏焦点从空落到 storage、URL 已是深链 → 不回写", () => {
    const r = nextChatSearchFromFocus({
      search: "sessionId=deep",
      focusedSessionId: "stored",
      prevFocusedSessionId: null,
    });
    expect(r.changed).toBe(false);
    expect(new URLSearchParams(r.nextSearch).get("sessionId")).toBe("deep");
  });

  it("首屏无 URL session、焦点从空落到 storage → 写入", () => {
    const r = nextChatSearchFromFocus({
      search: "view=main",
      focusedSessionId: "stored",
      prevFocusedSessionId: null,
    });
    expect(r.changed).toBe(true);
    expect(new URLSearchParams(r.nextSearch).get("sessionId")).toBe("stored");
  });
});

describe("首屏深链 vs storage（完整两帧，不经过 React ref）", () => {
  it("空焦点 adopt 深链；水合出旧焦点后仍纠回深链，且不把 URL 写回旧会话", () => {
    expect(
      adoptAcrossFrames([
        { url: "deep", focused: null },
        { url: "deep", focused: "stored" },
      ]),
    ).toEqual(["deep"]);
    expect(
      shouldCorrectFocusAfterHydrate({
        tabsHydrated: true,
        sessionFromUrl: "deep",
        focusedSessionId: "stored",
      }),
    ).toBe(true);
    const write = nextChatSearchFromFocus({
      search: "sessionId=deep",
      focusedSessionId: "stored",
      prevFocusedSessionId: null,
    });
    expect(write.changed).toBe(false);
    expect(new URLSearchParams(write.nextSearch).get("sessionId")).toBe("deep");
  });
});
