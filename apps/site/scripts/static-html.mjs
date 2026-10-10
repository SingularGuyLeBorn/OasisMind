/** 移除未使用的 Next 运行时，保留结构化数据、控件参数、CSS 与完整正文。 */
export function finalizeReadingHtml(original, scriptUrl, navigationUrl) {
  let html = original.replace(/<script\b([^>]*)>[\s\S]*?<\/script>/g, (match, attrs) =>
    /type="application\/(?:json|ld\+json)"/.test(attrs) ? match : "");
  html = html.replace(/<link\b[^>]*(?:as="script"|rel="modulepreload")[^>]*>/g, "");
  const scripts = [];
  if (html.includes("data-reading-content=") || html.includes("data-spatial-navigator=")) scripts.push(`<script type="module" src="${navigationUrl}"></script>`);
  if (html.includes("data-public-widget=")) scripts.push(`<script type="module" src="${scriptUrl}"></script>`);
  if (scripts.length) html = html.replace("</body>", scripts.join("") + "</body>");
  return html;
}
