/**
 * 全局代理初始化（国内环境访问国外 LLM / 站点）。
 *
 * Node 18+ 的全局 fetch 基于 undici，默认不读 HTTP_PROXY/HTTPS_PROXY。
 * 用 EnvHttpProxyAgent：外网走代理，localhost / 127.0.0.1 直连。
 *
 * 铁律：OneBot / NapCat / 本机 tRPC / Prisma 等 loopback 绝不能进 Clash，
 * 否则会 HTTP 502——表现为「QQ 收得到、回不出去」。
 *
 * 优先级：KP_HTTPS_PROXY > HTTPS_PROXY > HTTP_PROXY > KP_HTTP_PROXY。
 */

import { setGlobalDispatcher, EnvHttpProxyAgent, getGlobalDispatcher, Agent } from "undici";

let initialized = false;
let activeProxyUrl: string | null = null;

/** 本机服务默认不走代理（可被 NO_PROXY / KP_NO_PROXY 追加） */
const DEFAULT_NO_PROXY = "localhost,127.0.0.1,::1,.local";

function mergeNoProxy(...parts: Array<string | undefined>): string {
  const set = new Set<string>();
  for (const part of parts) {
    if (!part) continue;
    for (const item of part.split(/[,;\s]+/)) {
      const t = item.trim();
      if (t) set.add(t);
    }
  }
  return [...set].join(",");
}

export function initGlobalProxy(): { proxyUrl: string | null } {
  if (initialized) return { proxyUrl: activeProxyUrl };
  initialized = true;

  const proxyUrl =
    process.env.KP_HTTPS_PROXY?.trim() ||
    process.env.HTTPS_PROXY?.trim() ||
    process.env.HTTP_PROXY?.trim() ||
    process.env.KP_HTTP_PROXY?.trim() ||
    "";

  if (!proxyUrl) {
    activeProxyUrl = null;
    return { proxyUrl: null };
  }

  const noProxy = mergeNoProxy(
    DEFAULT_NO_PROXY,
    process.env.NO_PROXY,
    process.env.no_proxy,
    process.env.KP_NO_PROXY,
  );
  // 同步写回，便于子进程 / 第三方库读到同一份绕过列表
  process.env.NO_PROXY = noProxy;
  process.env.no_proxy = noProxy;

  try {
    setGlobalDispatcher(
      new EnvHttpProxyAgent({
        httpProxy: proxyUrl,
        httpsProxy: proxyUrl,
        noProxy,
      }),
    );
    activeProxyUrl = proxyUrl;
    console.log(
      `[Proxy] 全局代理已启用: ${proxyUrl}（外网走代理；本机绕过: ${noProxy}）`,
    );
  } catch (err) {
    console.warn(
      `[Proxy] 代理初始化失败（${proxyUrl}）: ${err instanceof Error ? err.message : String(err)}，回退直连`,
    );
    activeProxyUrl = null;
  }
  return { proxyUrl: activeProxyUrl };
}

/** loopback / 私网：给 OneBot 等强制直连用（不依赖全局 dispatcher 是否正确） */
export function isLoopbackUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "[::1]" ||
      host.endsWith(".local")
    );
  } catch {
    return false;
  }
}

let directAgent: Agent | null = null;

/** 直连 Agent（绕过全局 Proxy）；仅用于本机 HTTP */
export function getDirectDispatcher(): Agent {
  if (!directAgent) directAgent = new Agent();
  return directAgent;
}

/** 仅供测试复位 */
export function __resetProxyForTests(): void {
  initialized = false;
  activeProxyUrl = null;
  if (directAgent) {
    void directAgent.close().catch(() => {});
    directAgent = null;
  }
  try {
    setGlobalDispatcher(getGlobalDispatcher());
  } catch {
    // 忽略
  }
}
