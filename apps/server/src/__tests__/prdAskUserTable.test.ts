/**
 * prd-ask-user.md 第 5 节：幽灵 / 空答 / 二次作答 / abort。
 * R2/R6/R8 见 askUserGate.test.ts。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetAskUserGateForTests,
  createAskUserPending,
  listAskUserPendingForSession,
  resolveAskUser,
  waitAskUserResolution,
} from "../infra/askUserGate.js";
import type { AppConfig } from "../infra/config.js";

const config = { emailProvider: "none" } as AppConfig;
const SID = "clxxxxxxxxxxxxxxxxxxxx";

describe("PRD ask_user 状态×事件表", () => {
  beforeEach(() => {
    __resetAskUserGateForTests();
    vi.useFakeTimers();
    process.env.ASK_USER_TTL_MS = "60000";
  });

  afterEach(() => {
    __resetAskUserGateForTests();
    vi.useRealTimers();
    delete process.env.ASK_USER_TTL_MS;
  });

  it("R3 空答复拒绝且仍 pending", async () => {
    const pending = await createAskUserPending({
      sessionId: SID,
      question: "空答题",
      channel: "ui",
      config,
    });
    expect(resolveAskUser(pending.askId, "   ", "ui").ok).toBe(false);
    expect(listAskUserPendingForSession(SID)).toHaveLength(1);
  });

  it("R4 二次作答拒绝；R5 幽灵 askId", async () => {
    const pending = await createAskUserPending({
      sessionId: SID,
      question: "二次作答",
      channel: "ui",
      config,
    });
    expect(resolveAskUser(pending.askId, "先答", "ui").ok).toBe(true);
    const again = resolveAskUser(pending.askId, "再答", "ui");
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.reason).toMatch(/已结束/);
    const ghost = resolveAskUser("ask-ghost-does-not-exist", "x", "ui");
    expect(ghost.ok).toBe(false);
    if (!ghost.ok) expect(ghost.reason).toMatch(/不存在|已失效/);
  });

  it("R7 abort → aborted，迟到作答拒绝", async () => {
    const pending = await createAskUserPending({
      sessionId: SID,
      question: "中止题",
      channel: "ui",
      config,
    });
    const ac = new AbortController();
    const waitP = waitAskUserResolution(pending.askId, { signal: ac.signal });
    ac.abort();
    const resolution = await waitP;
    expect(resolution.outcome).toBe("aborted");
    expect(resolveAskUser(pending.askId, "迟到", "ui").ok).toBe(false);
    expect(listAskUserPendingForSession(SID)).toHaveLength(0);
  });

  it("R7b wait 前已 abort：Promise 仍 settle 为 aborted", async () => {
    const pending = await createAskUserPending({
      sessionId: SID,
      question: "先中止再 wait",
      channel: "ui",
      config,
    });
    const ac = new AbortController();
    ac.abort();
    const resolution = await waitAskUserResolution(pending.askId, { signal: ac.signal });
    expect(resolution.outcome).toBe("aborted");
  });
});
