import { describe, expect, it } from "vitest";
import { QUEUE_SLOW_FIRST_TOKEN_MS, resolveScenario } from "./scenarioDefs.js";

describe("queue_slow_stream", () => {
  it("队列测试第一条/第二条命中慢流场景，不走 greeting", () => {
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "队列测试第一条" }],
      }).name,
    ).toBe("queue_slow_stream");
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "队列测试第二条" }],
      }).name,
    ).toBe("queue_slow_stream");
  });

  it("第一条 completion 预留入队窗口文案，token 间隔足够 Ctrl+Enter", () => {
    expect(QUEUE_SLOW_FIRST_TOKEN_MS).toBeGreaterThanOrEqual(50);
    const s = resolveScenario({
      messages: [{ role: "user", content: "队列测试第一条" }],
    });
    const r = s.completion({ messages: [{ role: "user", content: "队列测试第一条" }] });
    expect(r.content).toContain("预留入队窗口");
    expect(r.toolCalls).toEqual([]);
  });
});
