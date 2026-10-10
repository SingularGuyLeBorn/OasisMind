/** 损坏的正文不能靠页面“看起来没报错”混入发布。代码示例保留原样。 */
export function assertValidReadingSource(source: string, id: string): void {
  if (source.includes('\0') || /…\d+ tokens truncated…/.test(source)) {
    throw new Error(`文章内容已损坏，停止发布：${id}`);
  }
  let fence: { marker: string; length: number } | undefined;
  for (const line of source.split(/\r?\n/)) {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (marker) {
      if (!fence) fence = { marker: marker[1][0], length: marker[1].length };
      else if (marker[1][0] === fence.marker && marker[1].length >= fence.length) fence = undefined;
      continue;
    }
    if (fence || /^ {4}/.test(line)) continue;
    const prose = line.replace(/(?<!`)(`+)([\s\S]*?)\1(?!`)/g, '');
    if (/\bhttps?:[ \t]+\/[ \t]*\/[A-Za-z0-9]/.test(prose)) {
      throw new Error(`网页地址中存在错误空格，停止发布：${id}`);
    }
    if (/\]\(\.{1,3}[ \t]+\//.test(prose)) {
      throw new Error(`相对链接中存在错误空格，停止发布：${id}`);
    }
    if (/^[ \t]*(?:>[ \t]*)?![ \t]+\[[^\n]*\]\([^\n)]+\.(?:png|jpe?g|webp|gif|svg)(?:[?#][^\n)]*)?\)/i.test(prose)) {
      throw new Error(`图片标记中存在空格，停止发布：${id}`);
    }
  }
}
