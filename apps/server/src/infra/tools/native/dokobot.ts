/**
 * Dokobot 域 — 用本机真实 Chrome 读网页 / 搜索（本地免费）。
 */

import type { NativeToolContext, NativeToolDefinition } from "./types.js";
import { registerNativeDomain } from "./registerDomain.js";
import { runDokobotCli, type DokobotMode } from "../../dokobotClient.js";

function resolveMode(raw: unknown): DokobotMode {
  return raw === "remote" ? "remote" : "local";
}

async function dokobotReadTool(args: Record<string, unknown>, _ctx: NativeToolContext) {
  const url = String(args.url ?? "").trim();
  const result = await runDokobotCli({
    command: "read",
    target: url,
    mode: resolveMode(args.mode),
    screens: args.screens != null ? Number(args.screens) : undefined,
    sessionId: typeof args.sessionId === "string" ? args.sessionId : undefined,
    timeoutMs: args.timeout != null ? Number(args.timeout) : undefined,
  });

  if (!result.ok) {
    return {
      error: result.code,
      message: result.message,
      installHint: result.installHint,
      suggestedFallback: result.fallbackTool,
      stderr: result.stderr,
      note: "Dokobot 不可用时请改用 read_article（Playwright/cookie）或先完成本机安装。",
    };
  }

  // 从 stdout 尝试提取 session 续读提示（CLI 文本里常见 canContinue / session）
  const sessionMatch = result.stdout.match(/session[_-]?id[:\s]+([a-zA-Z0-9_-]+)/i);
  return {
    url,
    mode: result.mode,
    content: result.stdout,
    contentChars: result.stdout.length,
    sessionId: sessionMatch?.[1],
    note:
      result.mode === "local"
        ? "经本机 Chrome（Dokobot 本地免费模式）读取；需要更多屏可传 screens 或 sessionId 续读。"
        : "经 Dokobot Remote 模式读取（需 DOKO_API_KEY）。",
  };
}

async function dokobotSearchTool(args: Record<string, unknown>, _ctx: NativeToolContext) {
  const query = String(args.query ?? "").trim();
  const result = await runDokobotCli({
    command: "search",
    target: query,
    mode: resolveMode(args.mode),
    timeoutMs: args.timeout != null ? Number(args.timeout) : undefined,
  });

  if (!result.ok) {
    return {
      error: result.code,
      message: result.message,
      installHint: result.installHint,
      suggestedFallback: result.fallbackTool,
      stderr: result.stderr,
      note: "Dokobot 不可用时请改用 web_search。",
    };
  }

  return {
    query,
    mode: result.mode,
    content: result.stdout,
    contentChars: result.stdout.length,
    note:
      result.mode === "local"
        ? "经本机 Chrome 打开搜索页读取结果（Dokobot 本地免费）。"
        : "经 Dokobot Remote 搜索。",
  };
}

const DOKOBOT_DEFS: NativeToolDefinition[] = [
  {
    name: "dokobot_read",
    concurrencyClass: "B",
    description:
      "用本机真实 Chrome（Dokobot）读取网页为干净文本。默认 --local 免费无限，复用你已登录的浏览器会话（知乎/微信/小红书/X 等登录墙比无头 Playwright 更稳）。需本机：Chrome 扩展 + `npm i -g @dokobot/cli` + `dokobot install-bridge`。未安装时返回 installHint，请改用 read_article。",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "目标页面 URL（http/https）" },
        mode: {
          type: "string",
          enum: ["local", "remote"],
          description: "local=本机免费（默认）；remote=云端 API（需 DOKO_API_KEY）",
        },
        screens: {
          type: "number",
          description: "多屏滚动阅读次数（可选，长页/信息流加大）",
        },
        sessionId: {
          type: "string",
          description: "续读会话 id（上次返回含 sessionId 时传入）",
        },
        timeout: { type: "number", description: "超时毫秒，默认 120000" },
      },
      required: ["url"],
    },
  },
  {
    name: "dokobot_search",
    concurrencyClass: "B",
    description:
      "用本机 Chrome（Dokobot）做网页搜索并返回结果页文本。默认本地免费。未安装时回退 web_search。",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "搜索词" },
        mode: {
          type: "string",
          enum: ["local", "remote"],
          description: "local=本机免费（默认）；remote=需 API Key",
        },
        timeout: { type: "number", description: "超时毫秒，默认 120000" },
      },
      required: ["query"],
    },
  },
];

const DOKOBOT_HANDLERS = {
  dokobot_read: dokobotReadTool,
  dokobot_search: dokobotSearchTool,
};

export function registerDokobotTools(): void {
  registerNativeDomain(DOKOBOT_DEFS, DOKOBOT_HANDLERS);
}
