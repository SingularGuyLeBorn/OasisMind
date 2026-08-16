import path from "node:path";
import { createRequire } from "node:module";
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const require = createRequire(import.meta.url);
const serverInternal = process.env.SERVER_INTERNAL_URL || "http://127.0.0.1:3010";

/** 强制整站只用一份 remotion，避免 Player 与 composition 各拿一份 context → useCurrentFrame 报错 */
const remotionRoot = path.dirname(require.resolve("remotion/package.json"));
const remotionPlayerRoot = path.dirname(require.resolve("@remotion/player/package.json"));

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// 仅 transpile shared（运行时真依赖）；server 只通过 `import type { AppRouter }` 共享类型，
// type-only import 在编译期被擦除，无需把整个 server 包拉进 Next 编译/打包图（否则 dev/build 都更慢）。
const nextConfig: NextConfig = {
  transpilePackages: ["@oasismind/shared", "@oasismind/algo-viz"],
  // Remotion 仅客户端 Player；避免服务端打包拖垮编译
  serverExternalPackages: ["@remotion/renderer", "@remotion/bundler", "@remotion/cli"],
  // lucide / lodash 按符号拆包，减轻 webpack 开发态 on-demand 编译体积
  experimental: {
    optimizePackageImports: ["lucide-react", "lodash-es", "framer-motion"],
    /**
     * Next 15+ 默认 dynamic staleTimes=0 → 每次点导航都重拉 RSC，体感「切页等半天」。
     * 本地单用户：短暂复用客户端路由缓存，秒切；数据仍靠 tRPC / 推拉更新。
     */
    staleTimes: {
      // 长会话反复切页：3 分钟内复用客户端 RSC 缓存（打赢「每次重拉」baseline）
      dynamic: 180,
      static: 600,
    },
  },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string | false | string[]>),
      remotion: remotionRoot,
      "@remotion/player": remotionPlayerRoot,
    };

    // remotion 进异步 chunk，避免和文章页主包绑死导致 Rendering… 卡死
    const split = config.optimization?.splitChunks;
    if (!isServer && split && typeof split === "object") {
      split.cacheGroups = {
        ...(split.cacheGroups ?? {}),
        remotion: {
          test: /[\\/]node_modules[\\/](@remotion|remotion)[\\/]/,
          name: "remotion-vendor",
          chunks: "async",
          priority: 30,
          reuseExistingChunk: true,
        },
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/trpc/:path*",
        destination: `${serverInternal}/api/trpc/:path*`,
      },
      {
        source: "/api/agent/chat/stream",
        destination: `${serverInternal}/api/agent/chat/stream`,
      },
      {
        source: "/api/agent/async-stream",
        destination: `${serverInternal}/api/agent/async-stream`,
      },
      {
        source: "/api/agent/chat/stop",
        destination: `${serverInternal}/api/agent/chat/stop`,
      },
      {
        source: "/api/webhooks/agentmail",
        destination: `${serverInternal}/api/webhooks/agentmail`,
      },
      {
        source: "/api/admin/agentmail-webhook",
        destination: `${serverInternal}/api/admin/agentmail-webhook`,
      },
      {
        source: "/api/posts/assets/:path*",
        destination: `${serverInternal}/api/posts/assets/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${serverInternal}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { hostname: "localhost" },
      { hostname: "**.githubusercontent.com" },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
