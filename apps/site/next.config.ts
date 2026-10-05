/**
 * 公开站构建边界：唯一事实源是预生成静态文件，产物不包含本地 Server、Prisma 或 tRPC。
 * output=export 让运行时没有写权限；不支持的动态行为会在构建阶段直接失败。
 */
import type { NextConfig } from "next";
import { SITE_BASE_PATH } from "./siteConfig";

const nextConfig: NextConfig = {
  output: "export",
  basePath: SITE_BASE_PATH,
  transpilePackages: ["@oasismind/brand", "@oasismind/shared", "@oasismind/markdown"],
  images: { unoptimized: true },
  trailingSlash: false,
};

export default nextConfig;
