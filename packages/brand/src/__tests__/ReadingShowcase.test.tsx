import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { ReadingShowcase } from "../ReadingShowcase";

describe("ReadingShowcase", () => {
  it("本地与公开首页的单选组隔离，只有第一个视角默认选中", () => {
    for (const id of ["public-home", "owner-home"]) {
      const tree = ReadingShowcase({ id }) as ReactElement<{ children: ReactElement[] }>;
      const fieldset = tree.props.children[1] as ReactElement<{ children: unknown[] }>;
      const inputs = fieldset.props.children[1] as ReactElement<{ name: string; id: string; type: string; defaultChecked: boolean }>[];
      expect(inputs).toHaveLength(3);
      expect(inputs.map(input => input.props.name)).toEqual(Array(3).fill(`${id}-view`));
      expect(inputs.map(input => input.props.defaultChecked)).toEqual([true, false, false]);
      expect(inputs.every(input => input.props.type === "radio" && input.props.id.startsWith(id))).toBe(true);
    }
  });

  it("只有提供真实阅读地址时才显示入口，并允许自定义文案", () => {
    const withoutLink = ReadingShowcase({ id: "owner-home" }) as ReactElement<{ children: ReactElement[] }>;
    const withoutLinkBottom = withoutLink.props.children[2] as ReactElement<{ children: ReactElement[] }>;
    expect(withoutLinkBottom.props.children[1].type).toBe("span");

    const withLink = ReadingShowcase({
      id: "public-home",
      exploreHref: "/gardens/SparseAttention",
      exploreLabel: "阅读稀疏注意力",
    }) as ReactElement<{ children: ReactElement[] }>;
    const withLinkBottom = withLink.props.children[2] as ReactElement<{ children: ReactElement[] }>;
    const link = withLinkBottom.props.children[1] as ReactElement<{ href: string; children: string }>;
    expect(link.type).toBe("a");
    expect(link.props.href).toBe("/gardens/SparseAttention");
    expect(link.props.children).toBe("阅读稀疏注意力");

    const withDefaultLabel = ReadingShowcase({ id: "public-home", exploreHref: "/knowledge" }) as ReactElement<{ children: ReactElement[] }>;
    const defaultBottom = withDefaultLabel.props.children[2] as ReactElement<{ children: ReactElement[] }>;
    const defaultLink = defaultBottom.props.children[1] as ReactElement<{ children: string }>;
    expect(defaultLink.props.children).toBe("进入专题阅读");
  });
});
