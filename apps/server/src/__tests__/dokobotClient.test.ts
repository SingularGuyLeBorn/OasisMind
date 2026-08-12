/**
 * Dokobot CLI 封装：未安装 / 成功路径（mock execFile）。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const execFileMock = vi.fn();

vi.mock("node:child_process", () => ({
  execFile: (...args: unknown[]) => execFileMock(...args),
}));

describe("dokobotClient", () => {
  beforeEach(() => {
    execFileMock.mockReset();
    delete process.env.DOKOBOT_BIN;
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("未安装 CLI 时返回 DOKOBOT_NOT_INSTALLED", async () => {
    execFileMock.mockImplementation((_bin, _args, _opts, cb) => {
      const err = Object.assign(new Error("spawn dokobot ENOENT"), { code: "ENOENT" });
      (cb as (e: Error) => void)(err);
    });

    const { runDokobotCli } = await import("../infra/dokobotClient.js");
    const res = await runDokobotCli({
      command: "read",
      target: "https://example.com",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("DOKOBOT_NOT_INSTALLED");
      expect(res.fallbackTool).toBe("read_article");
      expect(res.installHint).toMatch(/install-bridge/);
    }
  });

  it("成功时返回 stdout 文本，默认 --local", async () => {
    execFileMock.mockImplementation((bin, args, _opts, cb) => {
      expect(bin).toBe("dokobot");
      expect(args).toEqual(["read", "https://example.com/a", "--local"]);
      (cb as (e: null, out: string, err: string) => void)(null, "# Hello\n\nworld", "");
    });

    const { runDokobotCli } = await import("../infra/dokobotClient.js");
    const res = await runDokobotCli({
      command: "read",
      target: "https://example.com/a",
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.stdout).toContain("Hello");
      expect(res.mode).toBe("local");
    }
  });

  it("缺 url 时 BAD_ARGS", async () => {
    const { runDokobotCli } = await import("../infra/dokobotClient.js");
    const res = await runDokobotCli({ command: "read", target: "  " });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("DOKOBOT_BAD_ARGS");
    expect(execFileMock).not.toHaveBeenCalled();
  });
});
