import { describe, expect, it } from "vitest";
import { nextChatSearchFromFocus } from "../useChatUrlSync";

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
});
