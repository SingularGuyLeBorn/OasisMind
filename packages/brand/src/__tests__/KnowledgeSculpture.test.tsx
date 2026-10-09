import { readFile } from "node:fs/promises";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { KnowledgeSculpture } from "../KnowledgeSculpture";

describe("KnowledgeSculpture", () => {
  it("装饰不进入无障碍阅读和焦点顺序，大图和小图共享书页结构", () => {
    const hero = KnowledgeSculpture({}) as ReactElement<Record<string, unknown>>;
    const card = KnowledgeSculpture({ compact: true, className: "card-art" }) as ReactElement<Record<string, unknown>>;
    expect(hero.props["aria-hidden"]).toBe("true");
    expect(hero.props.tabIndex).toBeUndefined();
    expect(card.props.className).toContain("om-knowledge-sculpture--compact card-art");
    expect(card.props.children).toEqual(hero.props.children);
  });

  it("减少动效关闭动画，手机没有自主动画或悬停翻页", async () => {
    const css = await readFile(new URL("../../styles.css", import.meta.url), "utf8");
    expect(css).toContain("(prefers-reduced-motion: reduce)");
    expect(css).toContain("animation: none !important");
    expect(css).toContain("(hover: hover) and (pointer: fine)");
    expect(css).not.toContain("infinite");
    expect(css).not.toContain("will-change");
  });
});
