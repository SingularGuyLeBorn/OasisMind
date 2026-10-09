/** 移除未使用的 Next 运行时，保留结构化数据、控件参数、CSS 与完整正文。 */
export function finalizeReadingHtml(original, scriptUrl) {
  let html = original.replace(/<script\b([^>]*)>[\s\S]*?<\/script>/g, (match, attrs) =>
    /type="application\/(?:json|ld\+json)"/.test(attrs) ? match : "");
  html = html.replace(/<link\b[^>]*(?:as="script"|rel="modulepreload")[^>]*>/g, "");
  if (html.includes("data-public-widget=")) html = html.replace("</body>", `<script type="module" src="${scriptUrl}"></script></body>`);
  return html;
}
