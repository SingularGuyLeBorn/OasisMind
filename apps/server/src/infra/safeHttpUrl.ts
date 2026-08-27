/**
 * 出站 HTTP(S) URL 护栏：挡住 file/ssrf 到本机与 RFC1918。
 * 覆盖 download_file / RSS / 存网页等「用户或 Agent 传入 URL」路径。
 */

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "0.0.0.0",
  "::",
  "::1",
  "[::1]",
  "metadata.google.internal",
]);

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return ((nums[0]! << 24) | (nums[1]! << 16) | (nums[2]! << 8) | nums[3]!) >>> 0;
}

function isBlockedIpv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n === null) return false;
  if (n >>> 24 === 127) return true; // 127.0.0.0/8
  if (n >>> 24 === 10) return true; // 10.0.0.0/8
  if (n >>> 24 === 0) return true; // 0.0.0.0/8
  if (n >>> 16 === 0xc0a8) return true; // 192.168.0.0/16
  if (n >>> 16 === 0xa9fe) return true; // 169.254.0.0/16
  const second = (n >>> 16) & 0xff;
  if (n >>> 24 === 172 && second >= 16 && second <= 31) return true; // 172.16.0.0/12
  if (n >>> 24 === 100 && second >= 64 && second <= 127) return true; // 100.64.0.0/10 CGNAT
  return false;
}

function isBlockedIpv6(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (h === "::1" || h === "0:0:0:0:0:0:0:1") return true;
  if (h.startsWith("fc") || h.startsWith("fd")) return true; // fc00::/7
  if (h.startsWith("fe80:")) return true;
  return false;
}

/** 解析并拒绝非 http(s)、本机、链路本地与私网地址。 */
export function assertPublicHttpUrl(raw: string, label = "url"): URL {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) throw new Error(`${label} 不能为空`);
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`${label} 非法：${trimmed}`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`${label} 仅支持 http/https，收到 ${parsed.protocol}`);
  }
  const host = parsed.hostname.trim().toLowerCase();
  if (!host) throw new Error(`${label} 缺少主机名`);
  // [OM-FREEPLAY] 单测本地 HTTP 夹具；生产禁止设此变量
  if (process.env.OM_ALLOW_PRIVATE_HTTP === "1") {
    return parsed;
  }
  if (BLOCKED_HOSTS.has(host)) {
    throw new Error(`${label} 禁止访问本机/元数据地址：${host}`);
  }
  if (host.endsWith(".localhost") || host.endsWith(".local")) {
    throw new Error(`${label} 禁止访问本机/内网主机：${host}`);
  }
  if (isBlockedIpv4(host) || isBlockedIpv6(host)) {
    throw new Error(`${label} 禁止访问私网或回环地址：${host}`);
  }
  return parsed;
}
