import { describe, it, expect } from "vitest";
import {
  PACKS_FULL,
  PACKS_LITE,
  resolvePackFlags,
  domainAllowed,
  navItemAllowed,
  formatPacksSummary,
} from "../packs.js";

describe("resolvePackFlags", () => {
  it("lite profile → 仅 core/chat", () => {
    const p = resolvePackFlags({ profile: "lite", envProfile: "", envDisable: "", envEnable: "" });
    expect(p).toEqual(PACKS_LITE);
    expect(formatPacksSummary(p)).toBe("lite");
  });

  it("full profile → 全开", () => {
    const p = resolvePackFlags({ profile: "full", envProfile: "", envDisable: "", envEnable: "" });
    expect(p).toEqual(PACKS_FULL);
    expect(formatPacksSummary(p)).toBe("full");
  });

  it("KP_PACKS_DISABLE 关掉列出的包", () => {
    const p = resolvePackFlags({
      profile: "full",
      envProfile: "",
      envDisable: "viz,im",
      envEnable: "",
    });
    expect(p.viz).toBe(false);
    expect(p.im).toBe(false);
    expect(p.swarm).toBe(true);
  });

  it("envProfile lite 优先于 yaml full", () => {
    const p = resolvePackFlags({
      profile: "full",
      envProfile: "lite",
      envDisable: "",
      envEnable: "",
    });
    expect(p.swarm).toBe(false);
  });

  it("lite + KP_PACKS_ENABLE=im 可点开 IM", () => {
    const p = resolvePackFlags({
      profile: "lite",
      envProfile: "",
      envDisable: "",
      envEnable: "im",
    });
    expect(p.im).toBe(true);
    expect(p.swarm).toBe(false);
  });
});

describe("domainAllowed / navItemAllowed", () => {
  it("lite 不注册 swarm/qq/algoViz", () => {
    expect(domainAllowed("swarm", PACKS_LITE)).toBe(false);
    expect(domainAllowed("qq", PACKS_LITE)).toBe(false);
    expect(domainAllowed("algoViz", PACKS_LITE)).toBe(false);
    expect(domainAllowed("fs", PACKS_LITE)).toBe(true);
    expect(domainAllowed("session", PACKS_LITE)).toBe(true);
  });

  it("lite 隐藏 /agents /channels", () => {
    expect(navItemAllowed("/agents", PACKS_LITE)).toBe(false);
    expect(navItemAllowed("/channels", PACKS_LITE)).toBe(false);
    expect(navItemAllowed("/settings", PACKS_LITE)).toBe(true);
    expect(navItemAllowed("/search", PACKS_LITE)).toBe(true);
  });

  it("full 全部允许", () => {
    expect(domainAllowed("qq", PACKS_FULL)).toBe(true);
    expect(navItemAllowed("/cron", PACKS_FULL)).toBe(true);
  });
});
