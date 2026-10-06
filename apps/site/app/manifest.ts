/**
 * 公开站静态 Web Manifest。数据为固定品牌元信息，不读取任何用户或运行时状态；
 * 这里只返回 GET 可序列化配置，类型或构建错误会直接阻断静态导出。
 */
import type { MetadataRoute } from "next";
import { withSiteBasePath } from "@/siteConfig";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "见微 · OasisMind",
    short_name: "见微",
    description: "个人知识花园与公开文章库",
    start_url: withSiteBasePath("/"),
    display: "standalone",
    background_color: "#f4f9fd",
    theme_color: "#0087eb",
    icons: [
      {
        src: withSiteBasePath("/icons/oasismind.svg"),
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: withSiteBasePath("/icons/oasismind.svg"),
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
