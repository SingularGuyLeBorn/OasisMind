import { afterEach, describe, expect, it } from "vitest";
import {
  __resetQqGroupHistoryForTests,
  formatQqGroupHistoryBlock,
  formatSpeakerLabel,
  peekQqGroupHistory,
  pushQqGroupHistory,
  takeQqGroupHistory,
} from "../infra/channels/qqGroupContext.js";

describe("qqGroupContext", () => {
  afterEach(() => {
    __resetQqGroupHistoryForTests();
    delete process.env.QQ_BOT_GROUP_HISTORY_LIMIT;
  });

  it("formatSpeakerLabel 优先昵称+QQ号", () => {
    expect(formatSpeakerLabel({ openid: "OID", username: "张三", qqNumber: "2251061018" })).toBe(
      "张三(2251061018)",
    );
    expect(formatSpeakerLabel({ openid: "OID", username: "张三" })).toBe("张三");
    expect(formatSpeakerLabel({ openid: "ABCDEF123456", qqNumber: "1" })).toBe("QQ1");
    expect(formatSpeakerLabel({ openid: "ABCDEF123456" })).toMatch(/^成员…/);
  });

  it("push/take：@ 前累计，take 清空", () => {
    process.env.QQ_BOT_GROUP_HISTORY_LIMIT = "10";
    pushQqGroupHistory("g1", {
      openid: "u1",
      username: "甲",
      text: "先说一句",
      at: new Date("2026-08-10T12:01:00"),
    });
    pushQqGroupHistory("g1", {
      openid: "u2",
      username: "乙",
      text: "再说一句",
      at: new Date("2026-08-10T12:02:00"),
    });
    expect(peekQqGroupHistory("g1")).toHaveLength(2);
    const taken = takeQqGroupHistory("g1");
    expect(taken).toHaveLength(2);
    expect(peekQqGroupHistory("g1")).toHaveLength(0);
    const block = formatQqGroupHistoryBlock(taken);
    expect(block).toContain("群聊近况");
    expect(block).toContain("甲 openid=u1:");
    expect(block).toContain("乙 openid=u2:");
    expect(block).toContain("atOpenIds");
    expect(block).toContain("【当前 @ 消息】");
  });

  it("limit=0 不累计", () => {
    process.env.QQ_BOT_GROUP_HISTORY_LIMIT = "0";
    pushQqGroupHistory("g1", { openid: "u1", text: "x", at: new Date() });
    expect(peekQqGroupHistory("g1")).toHaveLength(0);
  });
});
