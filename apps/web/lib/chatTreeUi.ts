/**
 * 会话树 UI 纯函数：分支指示 / 书签列表 / 摘要卡判定
 */

export type TreeChildrenMap = Record<string, string[]>;

/** 某节点（不含 branch_summary）的兄弟分支数 */
export function countBranches(
  children: TreeChildrenMap,
  messageId: string,
  nodeKinds?: Record<string, string | null | undefined>,
): number {
  const kids = children[messageId] ?? [];
  if (!nodeKinds) return kids.length;
  return kids.filter((id) => nodeKinds[id] !== "branch_summary").length;
}

export function branchIndicatorLabel(branchCount: number): string | null {
  if (branchCount < 2) return null;
  return `${branchCount} 个分支`;
}

export function isBranchSummaryMessage(msg: { kind?: string | null; content?: string }): boolean {
  return msg.kind === "branch_summary" || (msg.content?.includes("[om-branch-summary]") ?? false);
}

export type BookmarkEntry = { id: string; label: string; contentPreview: string };

export function collectBookmarks(
  messages: Array<{ id: string; label?: string | null; content: string }>,
): BookmarkEntry[] {
  return messages
    .filter((m) => typeof m.label === "string" && m.label.trim().length > 0)
    .map((m) => ({
      id: m.id,
      label: m.label!.trim(),
      contentPreview: m.content.slice(0, 80),
    }));
}

/**
 * 点树条上的一叉时切到该子树当前叶（最晚 createdAt 的无非摘要子节点）。
 * 点分叉处的用户气泡本身会丢掉后面的助手回复，用户会以为「切回去内容丢了」。
 */
export function subtreeTipId(
  children: TreeChildrenMap,
  nodeId: string,
  nodes: Array<{ id: string; kind?: string | null; createdAt?: string }>,
): string {
  const kinds = Object.fromEntries(nodes.map((n) => [n.id, n.kind]));
  const createdAt = Object.fromEntries(nodes.map((n) => [n.id, n.createdAt ?? ""]));
  const tips: string[] = [];
  const walk = (id: string, seen: Set<string>) => {
    if (seen.has(id)) return;
    seen.add(id);
    const kids = (children[id] ?? []).filter((cid) => kinds[cid] !== "branch_summary");
    if (kids.length === 0) {
      tips.push(id);
      return;
    }
    for (const k of kids) walk(k, seen);
  };
  walk(nodeId, new Set());
  if (tips.length === 0) return nodeId;
  tips.sort((a, b) => (createdAt[b] ?? "").localeCompare(createdAt[a] ?? "") || b.localeCompare(a));
  return tips[0]!;
}

/** 从邻接表取某节点的非摘要子节点（供切换菜单） */
export function listBranchChildren(
  children: TreeChildrenMap,
  messageId: string,
  nodes: Array<{ id: string; kind?: string | null; contentPreview: string; role: string }>,
): Array<{ id: string; preview: string; role: string }> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return (children[messageId] ?? [])
    .map((id) => byId.get(id))
    .filter((n): n is NonNullable<typeof n> => !!n && n.kind !== "branch_summary")
    .map((n) => ({ id: n.id, preview: n.contentPreview, role: n.role }));
}

export type SessionTreeAncestry = {
  activeLeafId: string | null;
  nodes: Array<{ id: string; parentId: string | null }>;
};

/** 当前叶或其祖先：树条上标「这条枝是正在看的」 */
export function isAncestorOfLeaf(tree: SessionTreeAncestry, nodeId: string): boolean {
  if (!tree.activeLeafId) return false;
  const byId = new Map(tree.nodes.map((n) => [n.id, n]));
  let cur: string | null = tree.activeLeafId;
  const seen = new Set<string>();
  while (cur && !seen.has(cur)) {
    if (cur === nodeId) return true;
    seen.add(cur);
    cur = byId.get(cur)?.parentId ?? null;
  }
  return false;
}
