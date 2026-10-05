/**
 * 公开站部署地址的唯一规范化入口。
 *
 * GitHub Pages 项目站部署在 `/仓库名`，自定义域名通常部署在根目录。页面路由由 Next.js
 * 的 basePath 处理；浏览器 fetch、原生 a/img、Manifest 和机器接口则显式调用本模块，
 * 避免同一个前缀在各处手工拼接后出现漏加或重复。
 */

export function normalizeSiteBasePath(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed === "/") return "";
  if (
    !trimmed.startsWith("/")
    || trimmed.endsWith("/")
    || trimmed.includes("//")
    || /[?#\\]/.test(trimmed)
    || !/^\/[A-Za-z0-9._~!$&'()*+,;=:@%/-]+$/.test(trimmed)
  ) {
    throw new Error(`公开站挂载路径无效：${value ?? ""}`);
  }
  return trimmed;
}

export const SITE_BASE_PATH = normalizeSiteBasePath(process.env.NEXT_PUBLIC_SITE_BASE_PATH);

/** 给同源绝对路径加部署前缀；外链、锚点和已经带前缀的地址保持原样。 */
export function withSiteBasePath(pathname: string, basePath = SITE_BASE_PATH): string {
  if (!pathname.startsWith("/") || pathname.startsWith("//") || !basePath) return pathname;
  if (pathname === basePath || pathname.startsWith(`${basePath}/`)) return pathname;
  return `${basePath}${pathname}`;
}

/** 站点绝对地址由部署环境提供，末尾斜杠统一去除，供 sitemap/feed/metadata 共用。 */
export function getSiteUrl(): string {
  // [OM-FREEPLAY] 用户尚未提供最终域名；localhost 只用于本机构建，不会进入正式 Pages 工作流。
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}
