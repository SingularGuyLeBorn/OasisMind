import { getManifest, articleHref } from "@/lib/publicContent";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]!);
}

export function GET(): Response {
  // [OM-FREEPLAY] 最终域名尚未给出，部署时由环境变量覆盖。
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const items = getManifest().posts.slice(0, 50).map((post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}${articleHref(post)}</link>
      <guid>${escapeXml(post.id)}</guid>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0"><channel><title>见微 · OasisMind</title><link>${baseUrl}</link>
    <description>见微公开知识花园</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
