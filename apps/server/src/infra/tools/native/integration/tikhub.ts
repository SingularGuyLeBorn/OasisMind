/**
 * 集成域 — TikHub 社交媒体数据 API 接入（国内平台为主）
 *
 * TikHub 是第三方社交媒体数据基础设施，一个 API key 覆盖 16 平台 1000+ 端点：
 *   小红书 / 抖音 / B站 / 微博 / 微信公众号 / 知乎 / 快手 / TikTok / YouTube / Twitter 等。
 * 纯 REST + Bearer token，无需登录账号、无需浏览器、无需企业认证，~$0.001/请求。
 * 与 platform_login（浏览器登录态读私密内容）互补：TikHub 补充「搜索 + 公开内容结构化读取」。
 * 凭据：Credential 表 scope=tikhub name=api_key，或环境变量 TIKHUB_API_KEY。
 * Base URL：https://api.tikhub.io（可用 TIKHUB_API_BASE 覆盖）。
 */
import type { NativeToolContext, NativeToolDefinition, NativeToolHandler } from "../types.js";
import { getCredentialValue } from "../../../credentialVault.js";

function readEnv(name: string, fallback = ""): string {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : fallback;
}

function tikhubBase(): string {
  return readEnv("TIKHUB_API_BASE", "https://api.tikhub.io");
}

async function requireTikhubKey(ctx: NativeToolContext): Promise<string> {
  const fromDb = ctx.prisma ? await getCredentialValue(ctx.prisma, "tikhub", "api_key") : undefined;
  const key = (fromDb && fromDb.trim()) || readEnv("TIKHUB_API_KEY");
  if (!key) {
    throw new Error("未配置 TikHub 凭据：请在 Credential 表新增 scope=tikhub name=api_key，或设置环境变量 TIKHUB_API_KEY。注册拿 key：https://user.tikhub.io （新账号送 ~50 次免费请求）");
  }
  return key;
}

/** 通用 TikHub 端点转发：Agent 传完整端点路径 + 查询参数，直接转发，覆盖全部 1000+ 端点 */
async function tikhubRequest(args: Record<string, unknown>, ctx: NativeToolContext): Promise<unknown> {
  const endpoint = String(args.endpoint ?? "").trim().replace(/^\/+/, "");
  if (!endpoint) throw new Error("需要 endpoint 参数（TikHub 端点路径，如 xiaohongshu/app_v2/get_note_info）");
  const params = (args.params && typeof args.params === "object" ? args.params : {}) as Record<string, unknown>;
  const method = String(args.method ?? "GET").toUpperCase() === "POST" ? "POST" : "GET";
  const key = await requireTikhubKey(ctx);
  const base = tikhubBase();
  const started = Date.now();

  // 统一前缀 /api/v1/（接受 xiaohongshu/... 或 /api/v1/xiaohongshu/...）
  const fullPath = endpoint.startsWith("api/v1/") ? `/${endpoint}` : `/api/v1/${endpoint}`;
  const url = new URL(base + fullPath);
  let res: Response;
  if (method === "GET") {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && String(v) !== "") url.searchParams.set(k, String(v));
    }
    res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
  } else {
    res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  }
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = text.slice(0, 2000);
  }
  if (!res.ok) {
    const errSnippet = typeof json === "string" ? json : JSON.stringify(json).slice(0, 500);
    throw new Error(`TikHub ${method} ${fullPath} 失败 ${res.status}: ${errSnippet}`);
  }
  return { ok: true, endpoint: fullPath, method, data: json, elapsedMs: Date.now() - started };
}

export const tikhubDefs: NativeToolDefinition[] = [
  {
    name: "tikhub_request",
    concurrencyClass: "B",
    description:
      "TikHub 社媒 API 转发（小红书/抖音/B站/微博/知乎等）。凭据 TIKHUB_API_KEY。传 endpoint+params；端点见 https://tikhub.io/api-reference 。",
    parameters: {
      type: "object",
      properties: {
        endpoint: {
          type: "string",
          description: "TikHub 端点路径（不含 /api/v1/ 前缀，自动补全），如 xiaohongshu/app_v2/get_note_info",
        },
        params: {
          type: "object",
          description: "查询参数对象（GET 时作为 query string，POST 时作为 JSON body）",
        },
        method: {
          type: "string",
          description: "HTTP 方法，默认 GET，可选 POST",
        },
      },
      required: ["endpoint"],
    },
  },
];

export const tikhubHandlers: Record<string, NativeToolHandler> = {
  tikhub_request: tikhubRequest,
};

