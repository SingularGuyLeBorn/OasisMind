/**
 * 真实 NapCat 联调：思考/正文分发 + 图片/文件/语音发送。
 * NapCat 未在线则 skip（不红）。
 */

import fs from "fs";
import path from "path";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Agent, fetch as undiciFetch } from "undici";
import {
  createOneBotAdapter,
  loadOneBotConfigFromEnv,
  planOneBotReply,
  writeThinkingTxtFile,
} from "../infra/channels/onebotBot.js";
import { __resetProxyForTests, initGlobalProxy } from "../infra/proxyDispatcher.js";

const httpUrl = (process.env.ONEBOT_HTTP_URL || "http://127.0.0.1:3001").replace(/\/$/, "");
const owner = (process.env.ONEBOT_QQ_OWNER || "2635495642").split(",")[0].trim();
const projectRoot = path.resolve(process.cwd().includes("apps") ? path.join(process.cwd(), "../..") : process.cwd());

function makeSilentWav(outPath: string, durationMs = 400): void {
  // 8kHz 16-bit mono PCM
  const sampleRate = 8000;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const dataSize = numSamples * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  // silence
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf);
}

describe("onebot 真实回发：分条 + 媒体", () => {
  let napcatUp = false;
  let adapter: ReturnType<typeof createOneBotAdapter> & {
    sendOneBotApi: (ep: string, p: Record<string, unknown>) => Promise<{ retcode?: number; status?: string; data?: unknown; message?: string }>;
    sendImage: (p: { userId: string; file: string }) => Promise<{ retcode?: number; status?: string }>;
    sendFile: (p: { userId: string; file: string; name?: string }) => Promise<{ retcode?: number; status?: string }>;
    sendRecord: (p: { userId: string; file: string }) => Promise<{ retcode?: number; status?: string }>;
    reply: (
      msg: {
        envelope: { channel: "onebot"; peerId: string; timestamp: string };
        payload: { text: string };
        meta: { eventId: string };
      },
      chunk: { text: string; finish: boolean; reasoning?: string },
    ) => Promise<void>;
  };
  const calls: Array<{ ep: string; body: Record<string, unknown> }> = [];

  beforeAll(async () => {
    // e2e 多连发：关闭 5s 风控间隔，避免单测过慢（生产默认仍为 5000）
    process.env.ONEBOT_SEND_MIN_INTERVAL_MS = "0";
    process.env.KP_HTTPS_PROXY = process.env.KP_HTTPS_PROXY || "http://127.0.0.1:7890";
    __resetProxyForTests();
    initGlobalProxy();
    try {
      const r = await undiciFetch(`${httpUrl}/get_login_info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        dispatcher: new Agent(),
      });
      napcatUp = r.status === 200;
    } catch {
      napcatUp = false;
    }
    if (!napcatUp) return;

    const cfg = {
      ...loadOneBotConfigFromEnv(),
      httpUrl,
      enabled: true,
      allowedUsers: [owner],
      qqAccount: process.env.ONEBOT_QQ_ACCOUNT || "2871732121",
    };
    adapter = createOneBotAdapter(cfg) as typeof adapter;
    const orig = adapter.sendOneBotApi.bind(adapter);
    adapter.sendOneBotApi = async (ep, body) => {
      calls.push({ ep, body });
      return orig(ep, body);
    };
    await adapter.start();
  });

  afterAll(async () => {
    if (adapter) await adapter.stop();
    __resetProxyForTests();
  });

  it("reply：短思考 + 正文 → 恰好 2 次 send_private_msg", async () => {
    if (!napcatUp) return;
    calls.length = 0;
    const eventId = `split-short-${Date.now()}`;
    await adapter.reply(
      {
        envelope: { channel: "onebot", peerId: owner, timestamp: new Date().toISOString() },
        payload: { text: "ping" },
        meta: { eventId },
      },
      {
        finish: true,
        reasoning: "这是短思考",
        text: `[OasisMind] 分条测试正文 ${new Date().toISOString()}`,
      },
    );
    const privates = calls.filter((c) => c.ep === "/send_private_msg");
    expect(privates.length).toBe(2);
    expect(String(privates[0]?.body.message)).toContain("【思考过程】");
    expect(String(privates[1]?.body.message)).toContain("分条测试正文");
  }, 30_000);

  it("reply：长思考 → upload_private_file + 1 条正文（合计思考1+正文1）", async () => {
    if (!napcatUp) return;
    calls.length = 0;
    const longThink = `长思考内容 ${"详".repeat(80)}`;
    process.env.ONEBOT_THINKING_TXT_CHARS = "40";
    const eventId = `split-long-${Date.now()}`;
    await adapter.reply(
      {
        envelope: { channel: "onebot", peerId: owner, timestamp: new Date().toISOString() },
        payload: { text: "ping" },
        meta: { eventId },
      },
      {
        finish: true,
        reasoning: longThink,
        text: `[OasisMind] 长思考后正文 ${new Date().toISOString()}`,
      },
    );
    delete process.env.ONEBOT_THINKING_TXT_CHARS;

    const uploads = calls.filter((c) => c.ep === "/upload_private_file");
    const privates = calls.filter((c) => c.ep === "/send_private_msg");
    expect(uploads.length).toBeGreaterThanOrEqual(1);
    expect(privates.length).toBe(1);
    expect(String(privates[0]?.body.message)).toContain("长思考后正文");
    // 规划层也断言为 2 步
    const plan = planOneBotReply({ reasoning: longThink, answer: "x", thinkingTxtThreshold: 40 });
    expect(plan).toHaveLength(2);
    expect(plan[0]?.kind).toBe("thinking_file");
  }, 60_000);

  it("sendImage 成功", async () => {
    if (!napcatUp) return;
    const img = path.join(projectRoot, "apps/algo-viz/public/packs/w2s-researcher/img_01.png");
    expect(fs.existsSync(img)).toBe(true);
    // 复制到无空格临时路径，避免个别 NapCat 构建对路径空格过敏
    const tmpImg = path.join(projectRoot, "content/uploads", `probe-img-${Date.now()}.png`);
    fs.mkdirSync(path.dirname(tmpImg), { recursive: true });
    fs.copyFileSync(img, tmpImg);
    const res = await adapter.sendImage({ userId: owner, file: tmpImg });
    expect(res.status === "ok" || (res.retcode ?? 0) === 0).toBe(true);
    expect(res.retcode === 0 || res.retcode === undefined || res.status === "ok").toBe(true);
    // 严格：业务成功码必须为 0（若出现非 0 打出全文便于排）
    if (res.retcode !== 0 && res.retcode !== undefined) {
      throw new Error(`sendImage 失败: ${JSON.stringify(res)}`);
    }
  }, 60_000);

  it("sendFile(txt) 成功", async () => {
    if (!napcatUp) return;
    const abs = writeThinkingTxtFile(`probe-${Date.now()}.txt`, "OasisMind file probe\n你好文件发送");
    const res = await adapter.sendFile({ userId: owner, file: abs, name: path.basename(abs) });
    expect(res.retcode ?? 0).toBe(0);
  }, 60_000);

  it("sendRecord(wav) 成功", async () => {
    if (!napcatUp) return;
    const wav = path.join(projectRoot, "content/uploads/tts", `probe-${Date.now()}.wav`);
    makeSilentWav(wav, 500);
    const res = await adapter.sendRecord({ userId: owner, file: wav });
    expect(res.retcode ?? 0).toBe(0);
  }, 90_000);
});
