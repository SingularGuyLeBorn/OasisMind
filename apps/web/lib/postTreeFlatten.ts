/** 目录树行高（与 VirtualFlatList 固定行高对齐） */
export const TREE_ROW_HEIGHT = 40;

/** 只展开 expanded 集合里的分支，供虚拟列表用；展开上千篇时 DOM 仍只有一屏 */
export function flattenVisibleTree<T extends { key: string; children: T[] }>(
  nodes: T[],
  expanded: ReadonlySet<string>,
  depth = 0,
): { node: T; depth: number }[] {
  const rows: { node: T; depth: number }[] = [];
  for (const node of nodes) {
    rows.push({ node, depth });
    if (node.children.length > 0 && expanded.has(node.key)) {
      rows.push(...flattenVisibleTree(node.children, expanded, depth + 1));
    }
  }
  return rows;
}
