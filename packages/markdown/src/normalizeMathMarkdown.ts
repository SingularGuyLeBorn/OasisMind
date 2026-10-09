/** 整理显示公式的分隔符布局；不改公式内容，不进入代码块或行内代码。 */
export function normalizeMathMarkdown(source: string): string {
  let fence: { marker: string; length: number } | undefined;
  const lines = source.split(/\r?\n/).map((line) => {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (marker) {
      if (!fence) fence = { marker: marker[1][0], length: marker[1].length };
      else if (marker[1][0] === fence.marker && marker[1].length >= fence.length) fence = undefined;
      return line;
    }
    if (fence) return line;
    let codeTicks = 0;
    let output = "";
    for (let index = 0; index < line.length; index++) {
      if (line[index] === "`") {
        let end = index;
        while (line[end] === "`") end++;
        const ticks = end - index;
        codeTicks = codeTicks === ticks ? 0 : codeTicks || ticks;
        output += line.slice(index, end);
        index = end - 1;
        continue;
      }
      if (!codeTicks && line.slice(index, index + 2) === "$$" && line[index - 1] !== "\\") {
        if (output && !output.endsWith("\n") && output.trim()) output += "\n";
        output += "$$";
        if (line.slice(index + 2).trim()) output += "\n";
        index++;
      } else output += line[index];
    }
    return output;
  }).join("\n").split("\n");
  // [OM-FREEPLAY] 旧稿有标题被插在显示公式起始符之后的格式错误；
  // 只将紧邻起始符的 Markdown 标题移到公式前，不改变标题或公式内容。
  let display = false;
  fence = undefined;
  for (let index = 0; index < lines.length; index++) {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(lines[index]);
    if (marker) {
      if (!fence) fence = { marker: marker[1][0], length: marker[1].length };
      else if (marker[1][0] === fence.marker && marker[1].length >= fence.length) fence = undefined;
      continue;
    }
    if (fence || lines[index].trim() !== "$$") continue;
    if (!display) {
      let heading = index + 1;
      while (heading < lines.length && !lines[heading].trim()) heading++;
      if (/^ {0,3}#{1,6} /.test(lines[heading] ?? "")) {
        const title = lines.splice(heading, 1)[0];
        lines.splice(index, 0, title, "");
        index += 2;
      }
    }
    display = !display;
  }
  return lines.join("\n");
}
