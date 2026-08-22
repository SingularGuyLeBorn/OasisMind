import { describe, expect, it } from "vitest";
import { nextStreamReconnectAttempt } from "../agentStream";

describe("nextStreamReconnectAttempt", () => {
  it("本跳交付过事件则从 1 重新计", () => {
    expect(nextStreamReconnectAttempt(11, true)).toBe(1);
    expect(nextStreamReconnectAttempt(0, true)).toBe(1);
  });

  it("空跳累加，成功后续空跳不会被历史次数卡死", () => {
    expect(nextStreamReconnectAttempt(0, false)).toBe(1);
    expect(nextStreamReconnectAttempt(11, false)).toBe(12);
    const afterDeliver = nextStreamReconnectAttempt(11, true);
    expect(afterDeliver).toBe(1);
    expect(nextStreamReconnectAttempt(afterDeliver, false)).toBe(2);
  });
});
