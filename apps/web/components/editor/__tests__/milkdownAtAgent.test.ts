import { describe, expect, it, vi } from "vitest";
import {
  registerMilkdownAtAgentHandler,
  tryFireMilkdownAtAgent,
  unregisterMilkdownAtAgentHandler,
} from "@/components/editor/milkdownAtAgent";

describe("tryFireMilkdownAtAgent", () => {
  it("没挂 handler 不触发", () => {
    const gen = registerMilkdownAtAgentHandler(() => {});
    unregisterMilkdownAtAgentHandler(gen);
    expect(
      tryFireMilkdownAtAgent({
        state: { selection: { from: 1, to: 1 } },
      } as never),
    ).toBe(false);
  });

  it("选区未折叠不触发", () => {
    const handler = vi.fn();
    const gen = registerMilkdownAtAgentHandler(handler);
    expect(
      tryFireMilkdownAtAgent({
        state: { selection: { from: 1, to: 4, $from: { start: () => 1, end: () => 4 } } },
      } as never),
    ).toBe(false);
    expect(handler).not.toHaveBeenCalled();
    unregisterMilkdownAtAgentHandler(gen);
  });
});
