/** 整理显示公式的分隔符布局；不改公式内容，不进入代码块或行内代码。 */
export function normalizeMathMarkdown(source: string): string {
  let fence: { marker: string; length: number } | undefined;
  let mathOpen = false;
  let latexInline = false;
  const lines = source.split(/\r?\n/).map((line) => {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (marker) {
      if (!fence) fence = { marker: marker[1][0], length: marker[1].length };
      else if (marker[1][0] === fence.marker && marker[1].length >= fence.length) fence = undefined;
      return line;
    }
    if (fence) return line;
    if (!mathOpen && /^ {4}/.test(line)) return line;
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
      if (!codeTicks && line[index] === '\\' && line[index - 1] !== '\\') {
        const delimiter = line.slice(index, index + 2);
        if (delimiter === '\\[' || (delimiter === '\\]' && mathOpen)) {
          if (output.trim()) output += '\n';
          else output = '';
          output += '$$';
          mathOpen = delimiter === '\\[';
          if (line.slice(index + 2).trim()) output += '\n';
          index++;
          continue;
        }
        if (delimiter === '\\(' && line.indexOf('\\)', index + 2) >= 0) {
          output += '$'; latexInline = true; index++; continue;
        }
        if (delimiter === '\\)' && latexInline) {
          output += '$'; latexInline = false; index++; continue;
        }
      }
      if (!codeTicks && line.slice(index, index + 2) === "$$" && line[index - 1] !== "\\") {
        if (output && !output.endsWith("\n") && output.trim()) output += "\n";
        if (!output.trim()) output = "";
        output += "$$";
        mathOpen = !mathOpen;
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
    if (fence) continue;
    if (!display && /^ {4}/.test(lines[index])) continue;
    // [OM-FREEPLAY] 遗漏闭合符时在明确的正文段落前结束公式，避免吞掉后续整篇文章。
    // 数学环境中的 \text、矩阵行、等式均不符合这些段落特征。
    const prose = (line: string) => /^\s*(?:#{1,6} |\*\*|[-*] +(?:[A-Za-z]{2,}(?:\s|:)|[\u4e00-\u9fff]{2})|[A-Za-z][A-Za-z ,’'-]{25,}|[A-Za-z]+(?: [A-Za-z]+)* +\$|[\u4e00-\u9fff]{2,}[^=]*[，,:：。]|\d+ +[\u4e00-\u9fff]|第 \d+ 步)/.test(line);
    if (display && prose(lines[index])) {
      const heading = /^ {0,3}#{1,6} /.test(lines[index]);
      // 标题误插入公式中间时移到公式前，不截断等式。
      if (heading) {
        let start = index - 1;
        while (start >= 0 && lines[start].trim() !== "$$") start--;
        const title = lines.splice(index, 1)[0];
        lines.splice(start, 0, title, "");
        index++;
      } else {
        lines.splice(index, 0, "$$", "");
        index += 2;
        display = false;
      }
    }
    if (lines[index]?.trim() !== "$$") continue;
    if (!display) {
      let heading = index + 1;
      while (heading < lines.length && !lines[heading].trim()) heading++;
      if (prose(lines[heading] ?? "") && !/^ {0,3}#{1,6} /.test(lines[heading] ?? "")) {
        // 前一个坏公式留下的孤立闭合符，不把后续正文重新当成显示公式。
        lines[index] = "";
        continue;
      }
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
