import type { PostAnnotationAnchor } from "@oasismind/shared";

/**
 * 批注锚点的解析结果。offset 使用 JavaScript 字符串的 UTF-16 偏移，
 * 与 DOM Range 的 Text.offset 保持同一套坐标，不额外做字素转换。
 */
export interface ResolvedPostAnnotationAnchor {
  startOffset: number;
  endOffset: number;
  matchedBy: "offset" | "context" | "exact";
}

interface TextSegment {
  node: Text;
  startOffset: number;
  endOffset: number;
}

// [OM-FREEPLAY] 用户要求保存上下文以抵抗正文轻微改动；64 字是本地文件体积与消歧能力之间的保守默认值。
const DEFAULT_CONTEXT_LENGTH = 64;

/** 收集容器内文本节点，并建立与 textContent 相同的连续偏移坐标。 */
function collectTextSegments(root: HTMLElement): { text: string; segments: TextSegment[] } {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const segments: TextSegment[] = [];
  let text = "";
  let current = walker.nextNode();

  while (current) {
    const node = current as Text;
    const startOffset = text.length;
    text += node.data;
    segments.push({ node, startOffset, endOffset: text.length });
    current = walker.nextNode();
  }

  return { text, segments };
}

/** 把 DOM Range 的边界转换为容器纯文本偏移。 */
function rangeBoundaryOffset(
  root: HTMLElement,
  container: Node,
  offset: number,
): number {
  const before = document.createRange();
  before.selectNodeContents(root);
  before.setEnd(container, offset);
  return before.toString().length;
}

/**
 * 从阅读区选区生成可持久化锚点。
 * 返回 null 代表选区不在正文中、已经折叠，或没有可记录的文字。
 */
export function createPostAnnotationAnchor(
  root: HTMLElement,
  range: Range,
  contextLength = DEFAULT_CONTEXT_LENGTH,
): PostAnnotationAnchor | null {
  if (
    range.collapsed ||
    !root.contains(range.startContainer) ||
    !root.contains(range.endContainer)
  ) {
    return null;
  }

  const { text } = collectTextSegments(root);
  const startOffset = rangeBoundaryOffset(root, range.startContainer, range.startOffset);
  const endOffset = rangeBoundaryOffset(root, range.endContainer, range.endOffset);
  const exact = text.slice(startOffset, endOffset);
  if (!exact.trim()) return null;

  return {
    exact,
    prefix: text.slice(Math.max(0, startOffset - contextLength), startOffset),
    suffix: text.slice(endOffset, endOffset + contextLength),
    startOffset,
    endOffset,
  };
}

function commonSuffixLength(left: string, right: string): number {
  const limit = Math.min(left.length, right.length);
  let count = 0;
  while (count < limit && left[left.length - 1 - count] === right[right.length - 1 - count]) {
    count += 1;
  }
  return count;
}

function commonPrefixLength(left: string, right: string): number {
  const limit = Math.min(left.length, right.length);
  let count = 0;
  while (count < limit && left[count] === right[count]) count += 1;
  return count;
}

/**
 * 先验证旧 offset；失效后用 exact + prefix/suffix 在新正文里重定位。
 * 重复引文按上下文吻合度优先，仍同分时选择离旧位置最近的一处。
 */
export function resolvePostAnnotationAnchor(
  text: string,
  anchor: PostAnnotationAnchor,
): ResolvedPostAnnotationAnchor | null {
  if (
    anchor.startOffset >= 0 &&
    anchor.endOffset > anchor.startOffset &&
    text.slice(anchor.startOffset, anchor.endOffset) === anchor.exact
  ) {
    return {
      startOffset: anchor.startOffset,
      endOffset: anchor.endOffset,
      matchedBy: "offset",
    };
  }

  const candidates: number[] = [];
  let cursor = text.indexOf(anchor.exact);
  while (cursor >= 0) {
    candidates.push(cursor);
    cursor = text.indexOf(anchor.exact, cursor + 1);
  }
  if (candidates.length === 0) return null;

  const ranked = candidates
    .map((startOffset) => {
      const endOffset = startOffset + anchor.exact.length;
      const prefixScore = commonSuffixLength(anchor.prefix, text.slice(0, startOffset));
      const suffixScore = commonPrefixLength(anchor.suffix, text.slice(endOffset));
      return {
        startOffset,
        endOffset,
        contextScore: prefixScore + suffixScore,
        distance: Math.abs(startOffset - anchor.startOffset),
      };
    })
    .sort((left, right) =>
      right.contextScore - left.contextScore ||
      left.distance - right.distance ||
      left.startOffset - right.startOffset,
    );

  const best = ranked[0];
  return {
    startOffset: best.startOffset,
    endOffset: best.endOffset,
    matchedBy: best.contextScore > 0 ? "context" : "exact",
  };
}

function locateBoundary(
  segments: TextSegment[],
  offset: number,
  preferNextAtBoundary: boolean,
): { node: Text; offset: number } | null {
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    if (offset < segment.endOffset) {
      return { node: segment.node, offset: offset - segment.startOffset };
    }
    if (offset === segment.endOffset) {
      const next = segments[index + 1];
      if (preferNextAtBoundary && next) return { node: next.node, offset: 0 };
      return { node: segment.node, offset: segment.node.data.length };
    }
  }
  return null;
}

/** 根据持久化锚点重建真实 DOM Range，供 CSS Highlights API 绘制。 */
export function createRangeFromPostAnnotationAnchor(
  root: HTMLElement,
  anchor: PostAnnotationAnchor,
): Range | null {
  const { text, segments } = collectTextSegments(root);
  const resolved = resolvePostAnnotationAnchor(text, anchor);
  if (!resolved) return null;

  const start = locateBoundary(segments, resolved.startOffset, true);
  const end = locateBoundary(segments, resolved.endOffset, false);
  if (!start || !end) return null;

  const range = document.createRange();
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);
  return range;
}
