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
});
