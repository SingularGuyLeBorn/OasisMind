/**
 * C-S34：QQ 入站 source 不得被洗成 user。
 */
import { describe, expect, it } from "vitest";
import { resolveChatMessageSource } from "../infra/agentStream/index.js";

describe("契约 — ChatMessage source C-S34", () => {
  it("C-S34-A1 channel 入站保持 channel，手打才是 user", () => {
    expect(resolveChatMessageSource("channel")).toBe("channel");
    expect(resolveChatMessageSource("user")).toBe("user");
    expect(resolveChatMessageSource(undefined)).toBe("user");
    expect(resolveChatMessageSource(null)).toBe("user");
    expect(resolveChatMessageSource("garbage")).toBe("user");
  });

  it("C-S11-A1 / C-S34 已知来源不得被折叠", () => {
    expect(resolveChatMessageSource("cron")).toBe("cron");
    expect(resolveChatMessageSource("system")).toBe("system");
    expect(resolveChatMessageSource("sub")).toBe("sub");
  });
});
