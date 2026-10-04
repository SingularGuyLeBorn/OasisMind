import type { NextConfig } from "next";

/** 公开站是纯静态部署边界：构建结果不包含 Express、Prisma、tRPC 或本机控制端点。 */
const nextConfig: NextConfig = {
  output: "export",
  transpilePackages: ["@oasismind/shared", "@oasismind/markdown"],
  images: { unoptimized: true },
  trailingSlash: false,
};

export default nextConfig;
