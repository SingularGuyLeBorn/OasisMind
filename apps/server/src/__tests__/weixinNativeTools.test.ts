/** 微信原生工具的参数与权限闸；不连接真实 iLink。 */
import fs from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { executeNativeTool } from "../infra/nativeTools.js";
import { createNativeCtx, createTempProjectDir } from "./helpers/toolTestFixtures.js";

describe("weixin native tools", () => {
  let root = "";

  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true });
    root = "";
  });

  it("无绑定且未传 userId 时给出明确目标错误", async () => {
    root = createTempProjectDir();
    const ctx = { ...createNativeCtx(root), sessionId: undefined, prisma: undefined };
    const result = (await executeNativeTool("send_weixin_text", { text: "hi" }, ctx)) as {
      error?: string;
    };
    expect(result.error).toMatch(/微信发送目标|userId/);
  });

  it("文件和语音不接受网络 URL，要求先落到受控路径", async () => {
    root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "send_weixin_file",
      { file: "https://example.com/a.pdf", userId: "wx-user" },
      ctx,
    )) as { error?: string };
    expect(result.error).toMatch(/必须先下载|受控本机路径/);
  });
});
