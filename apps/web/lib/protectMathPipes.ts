/**
 * GFM 表格会把公式里的 `|` / `\|` 当成列分隔，切断 `$...$`，
 * 后面未闭合的 `$` 会把余下全文吞成一个坏公式（整页 KaTeX 红字）。
 * 解析前把数学里的竖线收成 `\vert` / `\Vert`，表格再也切不了公式。
 */

export function protectMathPipesInTex(tex: string): string {
  // `{}` 断开控制字，避免 `\Vertx` 被读成未知命令
  return tex.replace(/\\\|/g, "\\Vert{}").replace(/\|/g, "\\vert{}");
}

function isLineStart(src: string, i: number): boolean {
  return i === 0 || src[i - 1] === "\n";
}

function readFence(src: string, i: number): { end: number } | null {
  if (!isLineStart(src, i)) return null;
  let j = i;
  while (j < src.length && src[j] === " " && j - i < 3) j += 1;
  const marker = src[j];
  if (marker !== "`" && marker !== "~") return null;
  let k = j;
  while (src[k] === marker) k += 1;
  const fenceLen = k - j;
  if (fenceLen < 3) return null;
  const close = new RegExp(`\\n[ ]{0,3}\\${marker}{${fenceLen},}[ \\t]*(?:\\n|$)`);
  const rest = src.slice(k);
  const m = close.exec(rest);
  if (!m || m.index < 0) return { end: src.length };
  return { end: k + m.index + m[0].length };
}

function readInlineCode(src: string, i: number): { end: number } | null {
  if (src[i] !== "`") return null;
  let k = i;
  while (src[k] === "`") k += 1;
  const ticks = k - i;
  const close = "`".repeat(ticks);
  let j = k;
  while (j < src.length) {
    const at = src.indexOf(close, j);
    if (at < 0) return { end: src.length };
    if (src[at + ticks] === "`") {
      j = at + 1;
      continue;
    }
    return { end: at + ticks };
  }
  return { end: src.length };
}

function findUnescaped(src: string, token: string, from: number): number {
  let j = from;
  while (j < src.length) {
    const at = src.indexOf(token, j);
    if (at < 0) return -1;
    if (at > 0 && src[at - 1] === "\\") {
      j = at + token.length;
      continue;
    }
    return at;
  }
  return -1;
}

export function protectMathPipesInMarkdown(src: string): string {
  if (!src.includes("$") || !src.includes("|")) return src;
  let out = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const fence = readFence(src, i);
    if (fence) {
      out += src.slice(i, fence.end);
      i = fence.end;
      continue;
    }
    const code = readInlineCode(src, i);
    if (code) {
      out += src.slice(i, code.end);
      i = code.end;
      continue;
    }
    if (src.startsWith("$$", i) && (i === 0 || src[i - 1] !== "\\")) {
      const close = findUnescaped(src, "$$", i + 2);
      if (close < 0) {
        out += src[i];
        i += 1;
        continue;
      }
      out += "$$" + protectMathPipesInTex(src.slice(i + 2, close)) + "$$";
      i = close + 2;
      continue;
    }
    if (src[i] === "$" && (i === 0 || src[i - 1] !== "\\")) {
      const close = findUnescaped(src, "$", i + 1);
      if (close < 0 || src[close + 1] === "$") {
        out += src[i];
        i += 1;
        continue;
      }
      out += "$" + protectMathPipesInTex(src.slice(i + 1, close)) + "$";
      i = close + 1;
      continue;
    }
    out += src[i];
    i += 1;
  }
  return out;
}
