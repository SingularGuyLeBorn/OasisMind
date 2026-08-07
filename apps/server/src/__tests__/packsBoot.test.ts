/**
 * Packs：lite 不注册 swarm/qq；full 注册。
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PACKS_FULL, PACKS_LITE } from "@knowpilot/shared";
import { __resetToolRegistryForTests, getTool } from "../infra/tools/registry.js";
import { registerNativeDomains } from "../infra/tools/native/index.js";
import { __resetNativeToolsRegistrationForTests } from "../infra/nativeTools.js";

describe("registerNativeDomains packs", () => {
  beforeEach(() => {
    __resetToolRegistryForTests();
    __resetNativeToolsRegistrationForTests();
  });

  afterEach(() => {
    // 恢复 full，避免污染并行/后续用例的 native 注册表
    __resetToolRegistryForTests();
    __resetNativeToolsRegistrationForTests();
    registerNativeDomains(PACKS_FULL);
  });

  it("lite 有 read_file / 无 agent_create / 无 send_qq_text / 无 algo_viz_create", () => {
    registerNativeDomains(PACKS_LITE);
    expect(getTool("read_file")).toBeTruthy();
    expect(getTool("agent_create")).toBeFalsy();
    expect(getTool("send_qq_text")).toBeFalsy();
    expect(getTool("algo_viz_create")).toBeFalsy();
  });

  it("full 注册 swarm / qq / viz", () => {
    registerNativeDomains(PACKS_FULL);
    expect(getTool("read_file")).toBeTruthy();
    expect(getTool("agent_create")).toBeTruthy();
    expect(getTool("send_qq_text")).toBeTruthy();
    expect(getTool("algo_viz_create")).toBeTruthy();
  });
});
