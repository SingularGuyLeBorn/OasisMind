import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "见微 · OasisMind",
    short_name: "见微",
    description: "个人知识花园与公开文章库",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f9fd",
    theme_color: "#0087eb",
  };
}
