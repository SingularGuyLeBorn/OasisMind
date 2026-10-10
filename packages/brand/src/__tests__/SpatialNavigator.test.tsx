import { isValidElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { SpatialNavigator } from "../SpatialNavigator";

function elements(node: ReactNode): { type: unknown; props: Record<string, unknown> }[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<{ children?: ReactNode }>(node)) return [];
  return [{ type: node.type, props: node.props }, ...elements(node.props.children)];
}

describe("共享立体阅读导航", () => {
  const entries = Array.from({ length: 8 }, (_, index) => ({ title: `章节 ${index}`, href: `#heading-${index}` }));
  it("三种原生视图隔离命名，并保留六个真实链接", () => {
    for (const id of ['public-library', 'owner-library']) {
      const tree = elements(SpatialNavigator({ id, title: '知识库展台', entries }));
      const radios = tree.filter(node => node.type === 'input' && node.props.type === 'radio');
      expect(radios.map(node => node.props.name)).toEqual(Array(3).fill(`${id}-spatial-view`));
      expect(radios.map(node => node.props.defaultChecked)).toEqual([true, false, false]);
      expect(tree.filter(node => node.type === 'a').map(node => node.props.href)).toEqual(entries.slice(0, 6).map(entry => entry.href));
    }
  });
  it("文章视图默认收起；空目录不生成空装饰", () => {
    const panel = SpatialNavigator({ id: 'article', title: '本篇', entries, compact: true });
    expect(panel?.type).toBe('details');
    expect(panel?.props.open).toBeUndefined();
    expect(SpatialNavigator({ id: 'empty', title: '空目录', entries: [] })).toBeNull();
  });
});
