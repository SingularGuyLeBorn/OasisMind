/** 品牌契约测试：锁定可访问性与三份静态入口的一致性，避免两个站点再次长出不同 Logo。 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { OasisMindLogo } from "../OasisMindLogo";

describe("OasisMindLogo", () => {
  it("旁边已有品牌文字时默认作为装饰，独立使用时可以提供可访问名称", () => {
    const decorative = OasisMindLogo({}) as ReactElement<Record<string, unknown>>;
    const labelled = OasisMindLogo({ label: "见微 · OasisMind" }) as ReactElement<
      Record<string, unknown>
    >;

    expect(decorative.props["aria-hidden"]).toBe(true);
    expect(decorative.props.role).toBeUndefined();
    expect(labelled.props["aria-hidden"]).toBeUndefined();
    expect(labelled.props.role).toBe("img");
    expect(labelled.props["aria-label"]).toBe("见微 · OasisMind");
  });

  it("公开站、本地工作台与品牌包使用完全相同的静态 SVG", async () => {
    const testDir = fileURLToPath(new URL(".", import.meta.url));
    const repoRoot = resolve(testDir, "../../../..");
    const canonical = await readFile(
      resolve(repoRoot, "packages/brand/assets/oasismind-mark.svg"),
      "utf8",
    );
    const copies = await Promise.all([
      readFile(resolve(repoRoot, "apps/web/public/icons/oasismind.svg"), "utf8"),
      readFile(resolve(repoRoot, "apps/site/public/icons/oasismind.svg"), "utf8"),
    ]);

    expect(copies).toEqual([canonical, canonical]);
    expect(canonical).not.toContain("linearGradient");
    expect(canonical).not.toContain("filter");
  });
});
