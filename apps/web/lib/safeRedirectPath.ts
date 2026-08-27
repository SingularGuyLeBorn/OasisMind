/**
 * 登录后跳转只允许站内相对路径，避免 open redirect / javascript: URL。
 */
export function safeRedirectPath(raw: string | null | undefined, fallback = "/chat"): string {
  const value = String(raw ?? "").trim();
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.includes("://") || value.includes("\\")) return fallback;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value.slice(1))) return fallback;
  return value;
}
