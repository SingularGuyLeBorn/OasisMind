import { describe, expect, it } from "vitest";
import { delayYield, isAbortError, sleep } from "./scenarios.js";
import {
  mockChatCompletionStream,
  registerMockLlmScenario,
} from "./scenarioDefs.js";
import { baseResult } from "./scenarios.js";

describe("AbortSignal 可打断 mock 流", () => {
  it("sleep 在 abort 时抛 AbortError", async () => {
    const ac = new AbortController();
    const p = sleep(5_000, ac.signal);
    ac.abort();
    await expect(p).rejects.toSatisfy(isAbortError);
  });

  it("delayYield 中途 abort 不再产出后续 item", async () => {
    const ac = new AbortController();
    const seen: number[] = [];
    const gen = delayYield([1, 2, 3], 30, ac.signal);
    const first = await gen.next();
    seen.push(first.value as number);
    ac.abort();
    await expect(gen.next()).rejects.toSatisfy(isAbortError);
    expect(seen).toEqual([1]);
  });
});

describe("可选 stream 默认派生", () => {
  it("只写 completion 的场景仍能流式吐出正文", async () => {
    const unreg = registerMockLlmScenario({
      name: "opt_stream_only_completion",
      match: (_opts, forced) => forced === "opt_stream_only_completion",
      completion: (opts) => ({
        ...baseResult(opts),
        content: "仅 completion",
        toolCalls: [],
      }),
    });
    try {
      let text = "";
      for await (const c of mockChatCompletionStream({
        messages: [{ role: "user", content: "x" }],
        scenario: "opt_stream_only_completion",
      })) {
        if (c.type === "token") text += c.delta ?? "";
      }
      expect(text).toContain("仅 completion");
    } finally {
      unreg();
    }
  });
});
