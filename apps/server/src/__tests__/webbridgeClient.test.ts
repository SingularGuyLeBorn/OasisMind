/**
 * WebBridge 客户端：缺参 / daemon 拒绝连接 / HTTP 成功路径（mock fetch）。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const execFileMock = vi.fn();

vi.mock("node:child_process", () => ({
  execFile: (...args: unknown[]) => execFileMock(...args),
}));

describe("webbridgeClient", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    execFileMock.mockReset();
    delete process.env.WEBBRIDGE_BIN;
    delete process.env.WEBBRIDGE_URL;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.resetModules();
  });

  it("缺 action/session 时 BAD_ARGS", async () => {
    const { runWebbridgeCommand } = await import("../infra/webbridgeClient.js");
    const a = await runWebbridgeCommand({ action: "", session: "t" });
    expect(a.ok).toBe(false);
    if (!a.ok) expect(a.code).toBe("WEBBRIDGE_BAD_ARGS");

    const b = await runWebbridgeCommand({ action: "snapshot", session: "  " });
    expect(b.ok).toBe(false);
    if (!b.ok) expect(b.code).toBe("WEBBRIDGE_BAD_ARGS");
  });

  it("连接拒绝时返回 WEBBRIDGE_DAEMON_DOWN", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("fetch failed")) as typeof fetch;
    const { runWebbridgeCommand } = await import("../infra/webbridgeClient.js");
    const res = await runWebbridgeCommand({
      action: "list_tabs",
      session: "probe",
      args: {},
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("WEBBRIDGE_DAEMON_DOWN");
      expect(res.installHint).toMatch(/webbridge/i);
    }
  });

  it("HTTP 200 时返回 data", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true, tabs: [] }),
    }) as typeof fetch;

    const { runWebbridgeCommand } = await import("../infra/webbridgeClient.js");
    const res = await runWebbridgeCommand({
      action: "list_tabs",
      session: "probe",
      args: {},
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.action).toBe("list_tabs");
      expect(res.data).toEqual({ success: true, tabs: [] });
    }
  });

  it("HTTP 502 时返回 WEBBRIDGE_NOT_CONNECTED", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      text: async () => "",
    }) as typeof fetch;

    const { runWebbridgeCommand } = await import("../infra/webbridgeClient.js");
    const res = await runWebbridgeCommand({
      action: "snapshot",
      session: "probe",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("WEBBRIDGE_NOT_CONNECTED");
  });

  it("start 在 ENOENT 时 NOT_INSTALLED", async () => {
    execFileMock.mockImplementation((_bin, _args, _opts, cb) => {
      const err = Object.assign(new Error("spawn ENOENT"), { code: "ENOENT" });
      (cb as (e: Error) => void)(err);
    });

    const { startWebbridgeDaemon } = await import("../infra/webbridgeClient.js");
    const res = await startWebbridgeDaemon({ bin: "kimi-webbridge-missing-xyz" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("WEBBRIDGE_NOT_INSTALLED");
  });
});
