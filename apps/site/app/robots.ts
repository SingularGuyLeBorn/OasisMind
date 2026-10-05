/**
 * 公开站静态 robots 契约。它只声明已部署公开页面可抓取，不读取本地内容状态；
 * 生成失败由 Next 构建暴露，本模块不提供动态或写请求处理。
 */
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: [] }, sitemap: "/sitemap.xml" };
}
