import { describe, expect, it } from "vitest";
import {
  canAutonomousMarkDone,
  checkAutonomousBudgets,
} from "../../infra/autonomousBudget.js";

describe("autonomousBudget", () => {
  it("轮次触顶 → exhausted 语义", () => {
    const r = checkAutonomousBudgets({ turnsUsed: 40, maxTurns: 40 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toBe("turns");
      expect(r.message).toMatch(/触顶≠成功/);
    }
  });

  it("墙钟触顶", () => {
    const r = checkAutonomousBudgets({
      turnsUsed: 1,
      maxTurns: 40,
      startedAt: "2026-01-01T00:00:00.000Z",
      maxWallClockMs: 60_000,
      nowMs: Date.parse("2026-01-01T00:02:00.000Z"),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("wall_clock");
  });

  it("token 估算触顶", () => {
    const r = checkAutonomousBudgets({
      turnsUsed: 1,
      maxTurns: 40,
      tokensUsedEstimate: 1000,
      maxTokensEstimate: 1000,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("tokens");
  });

  it("预算内 ok", () => {
    expect(
      checkAutonomousBudgets({
        turnsUsed: 3,
        maxTurns: 40,
        startedAt: Date.now() - 1000,
        maxWallClockMs: 60_000,
        tokensUsedEstimate: 10,
        maxTokensEstimate: 1000,
      }).ok,
    ).toBe(true);
  });

  it("requireExternalGate 未通过禁止 done", () => {
    expect(canAutonomousMarkDone({ requireExternalGate: true, externalGatePassed: false }).ok).toBe(
      false,
    );
    expect(canAutonomousMarkDone({ requireExternalGate: true, externalGatePassed: true }).ok).toBe(
      true,
    );
    expect(canAutonomousMarkDone({ requireExternalGate: false }).ok).toBe(true);
  });
});
