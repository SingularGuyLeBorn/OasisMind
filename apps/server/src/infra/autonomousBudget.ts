/**
 * Autonomous 预算门（纯函数叶子）
 *
 * 红线：触顶（轮次/墙钟/token 估算）→ exhausted，绝不标成功。
 * 用户质量门：requireExternalGate 时，未报外部通过指标前禁止 done。
 */

export type AutonomousBudgetInput = {
  turnsUsed: number;
  maxTurns: number;
  /** ISO 或 epoch ms；缺省不检墙钟 */
  startedAt?: string | number | null;
  maxWallClockMs?: number | null;
  tokensUsedEstimate?: number | null;
  maxTokensEstimate?: number | null;
  nowMs?: number;
};

export type AutonomousBudgetResult =
  | { ok: true }
  | { ok: false; reason: "turns" | "wall_clock" | "tokens"; message: string };

export function checkAutonomousBudgets(input: AutonomousBudgetInput): AutonomousBudgetResult {
  if (input.turnsUsed >= input.maxTurns) {
    return {
      ok: false,
      reason: "turns",
      message: `Turn budget exhausted (${input.maxTurns}). 触顶≠成功。`,
    };
  }

  const maxWall = input.maxWallClockMs;
  if (typeof maxWall === "number" && maxWall > 0 && input.startedAt != null && input.startedAt !== "") {
    const startMs =
      typeof input.startedAt === "number"
        ? input.startedAt
        : Date.parse(String(input.startedAt));
    if (Number.isFinite(startMs)) {
      const now = input.nowMs ?? Date.now();
      if (now - startMs >= maxWall) {
        return {
          ok: false,
          reason: "wall_clock",
          message: `Wall-clock budget exhausted (${maxWall}ms). 触顶≠成功。`,
        };
      }
    }
  }

  const maxTok = input.maxTokensEstimate;
  const used = input.tokensUsedEstimate;
  if (
    typeof maxTok === "number" &&
    maxTok > 0 &&
    typeof used === "number" &&
    Number.isFinite(used) &&
    used >= maxTok
  ) {
    return {
      ok: false,
      reason: "tokens",
      message: `Token estimate budget exhausted (${maxTok}). 触顶≠成功。`,
    };
  }

  return { ok: true };
}

/** autonomous 模式：裁判 done 前必须已有外部 gate */
export function canAutonomousMarkDone(opts: {
  requireExternalGate: boolean;
  externalGatePassed?: boolean | null;
}): { ok: true } | { ok: false; message: string } {
  if (!opts.requireExternalGate) return { ok: true };
  if (opts.externalGatePassed === true) return { ok: true };
  return {
    ok: false,
    message:
      "autonomous 模式禁止仅凭模型自判完成：请先 autonomous_gate（带 lintOk/testOk/gateCommandExitCode 等外部指标）。",
  };
}
