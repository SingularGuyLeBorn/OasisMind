/**
 * 静态站批注锚点。只索引已渲染正文，不改写 Markdown DOM；同一篇文章的一次
 * TextIndex 供所有批注共享，避免长文上每条批注重新遍历全文。
 */
import type { PostAnnotationAnchor } from "@oasismind/shared";

export interface LocalAnnotationAnchor extends PostAnnotationAnchor {
  headingId?: string;
}

export interface TextSection {
  id: string;
  startOffset: number;
  endOffset: number;
}

interface TextSegment {
  node: Text;
  startOffset: number;
  endOffset: number;
  headingId?: string;
}

export interface ArticleTextIndex {
  text: string;
  sections: TextSection[];
  segments: TextSegment[];
}

export interface ResolvedLocalAnchor {
  startOffset: number;
  endOffset: number;
  matchedBy: "offset" | "context" | "exact";
}

// [OM-FREEPLAY] 沿用主站批注的 64 字上下文；足以区分常见重复短句，且备份仍轻量。
const CONTEXT_LENGTH = 64;

/** 仅在本篇已有批注，或用户实际选择正文后调用。 */
export function buildArticleTextIndex(root: HTMLElement): ArticleTextIndex {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  const segments: TextSegment[] = [];
  const sections: TextSection[] = [];
  let text = "";
  let headingId: string | undefined;
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (/^H[1-6]$/.test(element.tagName) && element.id) {
        const previous = sections.at(-1);
        if (previous) previous.endOffset = text.length;
        headingId = element.id;
        sections.push({ id: headingId, startOffset: text.length, endOffset: text.length });
      }
    } else {
      const current = node as Text;
      if (current.data.length === 0) {
        node = walker.nextNode();
        continue;
      }
      const startOffset = text.length;
      text += current.data;
      segments.push({ node: current, startOffset, endOffset: text.length, headingId });
    }
    node = walker.nextNode();
  }
  const last = sections.at(-1);
  if (last) last.endOffset = text.length;
  return { text, sections, segments };
}

function boundaryOffset(root: HTMLElement, node: Node, offset: number): number {
  const before = document.createRange();
  before.selectNodeContents(root);
  before.setEnd(node, offset);
  return before.toString().length;
}

function findSegment(segments: TextSegment[], offset: number, preferNext: boolean): TextSegment | undefined {
  let left = 0;
  let right = segments.length - 1;
  while (left <= right) {
    const middle = (left + right) >>> 1;
    const segment = segments[middle];
    if (offset > segment.endOffset || (preferNext && offset === segment.endOffset)) left = middle + 1;
    else right = middle - 1;
  }
  return segments[left] ?? (preferNext ? undefined : segments.at(-1));
}

export function createLocalAnnotationAnchor(
  root: HTMLElement,
  index: ArticleTextIndex,
  range: Range,
): LocalAnnotationAnchor | null {
  if (range.collapsed || !root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
  const startOffset = boundaryOffset(root, range.startContainer, range.startOffset);
  const endOffset = boundaryOffset(root, range.endContainer, range.endOffset);
  const exact = index.text.slice(startOffset, endOffset);
  // DOM Range 与索引若因动态内容不一致，不存可能指向错误原文的锚点。
  // [OM-FREEPLAY] 手机单次选区最多保存 2000 字，避免意外整页长选区写进本机备份。
  if (!exact.trim() || exact !== range.toString() || exact.length > 2_000) return null;
  const start = findSegment(index.segments, startOffset, true);
  const end = findSegment(index.segments, endOffset - 1, false);
  const selectedHeadingId = start?.headingId && start.headingId === end?.headingId ? start.headingId : undefined;
  return {
    exact,
    prefix: index.text.slice(Math.max(0, startOffset - CONTEXT_LENGTH), startOffset),
    suffix: index.text.slice(endOffset, endOffset + CONTEXT_LENGTH),
    startOffset,
    endOffset,
    ...(selectedHeadingId ? { headingId: selectedHeadingId } : {}),
  };
}

function commonSuffixLength(left: string, right: string): number {
  const length = Math.min(left.length, right.length);
  let count = 0;
  while (count < length && left[left.length - 1 - count] === right[right.length - 1 - count]) count += 1;
  return count;
}

function commonPrefixLength(left: string, right: string): number {
  const length = Math.min(left.length, right.length);
  let count = 0;
  while (count < length && left[count] === right[count]) count += 1;
  return count;
}

function contextScore(text: string, anchor: LocalAnnotationAnchor, startOffset: number): number {
  const endOffset = startOffset + anchor.exact.length;
  return commonSuffixLength(anchor.prefix, text.slice(Math.max(0, startOffset - anchor.prefix.length), startOffset))
    + commonPrefixLength(anchor.suffix, text.slice(endOffset, endOffset + anchor.suffix.length));
}

function findByQuote(
  text: string,
  anchor: LocalAnnotationAnchor,
  start: number,
  end: number,
  requireContext: boolean,
): ResolvedLocalAnchor | null {
  let best: { startOffset: number; score: number } | null = null;
  let bestCount = 0;
  let count = 0;
  let position = text.indexOf(anchor.exact, start);
  while (position >= 0 && position + anchor.exact.length <= end) {
    // [OM-FREEPLAY] 极短重复引文最多检查一万处；超过时留待用户重新绑定，避免长文卡顿。
    if (++count > 10_000) return null;
    const score = contextScore(text, anchor, position);
    if (!best || score > best.score) {
      best = { startOffset: position, score };
      bestCount = 1;
    } else if (score === best.score) bestCount += 1;
    position = text.indexOf(anchor.exact, position + 1);
  }
  if (!best) return null;
  // [OM-FREEPLAY] 正文版本变化后至少吻合 8 字上下文（原上下文不足则需全部吻合）；同分不猜位置。
  const minimumScore = requireContext ? Math.min(8, anchor.prefix.length + anchor.suffix.length) || 1 : 0;
  if (best.score < minimumScore || bestCount > 1) return null;
  return { startOffset: best.startOffset, endOffset: best.startOffset + anchor.exact.length, matchedBy: best.score > 0 ? "context" : "exact" };
}

/** 先校验原偏移；漂移后在原章节按引文/上下文找，最后才查整篇。 */
export function resolveLocalAnnotationAnchor(
  text: string,
  sections: TextSection[],
  anchor: LocalAnnotationAnchor,
  requireContext = false,
): ResolvedLocalAnchor | null {
  const originalOffsetMatches = (
    anchor.startOffset >= 0 && anchor.endOffset > anchor.startOffset &&
    text.slice(anchor.startOffset, anchor.endOffset) === anchor.exact
  );
  if (originalOffsetMatches && (!requireContext ||
    (anchor.startOffset === 0 && anchor.endOffset === text.length) ||
    contextScore(text, anchor, anchor.startOffset) === anchor.prefix.length + anchor.suffix.length &&
    anchor.prefix.length + anchor.suffix.length > 0
  )) return { startOffset: anchor.startOffset, endOffset: anchor.endOffset, matchedBy: "offset" };
  const section = anchor.headingId ? sections.find((item) => item.id === anchor.headingId) : undefined;
  if (section) {
    // 原章节仍含引文却无法消歧时，不能去别的章节猜一个“最像”的位置。
    const position = text.indexOf(anchor.exact, section.startOffset);
    if (position >= 0 && position + anchor.exact.length <= section.endOffset) {
      return findByQuote(text, anchor, section.startOffset, section.endOffset, requireContext);
    }
  }
  return findByQuote(text, anchor, 0, text.length, requireContext);
}

/** 将共享索引的偏移映射回真实 DOM Range，供 CSS Highlights API 与跳转使用。 */
export function rangeFromLocalAnnotationAnchor(
  index: ArticleTextIndex,
  anchor: LocalAnnotationAnchor,
  requireContext: boolean,
): Range | null {
  const resolved = resolveLocalAnnotationAnchor(index.text, index.sections, anchor, requireContext);
  if (!resolved) return null;
  const start = findSegment(index.segments, resolved.startOffset, true);
  const end = findSegment(index.segments, resolved.endOffset, false);
  if (!start || !end) return null;
  const range = document.createRange();
  range.setStart(start.node, resolved.startOffset - start.startOffset);
  range.setEnd(end.node, resolved.endOffset - end.startOffset);
  return range;
}
