/**
 * 从公开索引生成只读 Atom Feed，不读取草稿、批注或本地数据库。
 * 只实现 GET；公开投影不可读时让静态构建失败，避免输出残缺或越权 Feed。
 */
import { getManifest, articleHref } from "@/lib/publicContent";
import { getSiteUrl } from "@/siteConfig";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]!);
}

export function GET(): Response {
  const baseUrl = getSiteUrl();
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
