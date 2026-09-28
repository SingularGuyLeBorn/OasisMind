/**
 * OPML 订阅清单解析。只抽带 xmlUrl 的 outline，忽略分组空壳。
 */

export type OpmlFeed = {
  title: string;
  xmlUrl: string;
  htmlUrl?: string;
};

function decodeXmlEntities(raw: string): string {
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function parseOutlineAttrs(attrChunk: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([A-Za-z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrChunk))) {
    attrs[m[1].toLowerCase()] = decodeXmlEntities(m[3] ?? m[4] ?? "");
  }
  return attrs;
}

export function normalizeFeedUrl(url: string): string {
  return url.trim().replace(/\/+$/, "").toLowerCase();
}

export function parseOpmlFeeds(xml: string): OpmlFeed[] {
  const feeds: OpmlFeed[] = [];
  const seen = new Set<string>();
  const outlineRe = /<outline\b([^>]*)\/?>/gi;
  let m: RegExpExecArray | null;
  while ((m = outlineRe.exec(xml))) {
    const attrs = parseOutlineAttrs(m[1] ?? "");
    const xmlUrl = (attrs.xmlurl || attrs.xml_url || "").trim();
    if (!xmlUrl || !/^https?:\/\//i.test(xmlUrl)) continue;
    const key = normalizeFeedUrl(xmlUrl);
    if (seen.has(key)) continue;
    seen.add(key);
    const title = (attrs.title || attrs.text || xmlUrl).trim() || xmlUrl;
    const htmlUrl = (attrs.htmlurl || attrs.html_url || "").trim() || undefined;
    feeds.push({ title: title.slice(0, 200), xmlUrl, htmlUrl });
  }
  return feeds;
}
