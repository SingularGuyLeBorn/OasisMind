import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = fs.readFileSync(path.resolve(import.meta.dirname, "../../app/globals.css"), "utf8");

describe("公开文章公式布局", () => {
  it("长公式在自身容器横滑而不撑开整页", () => {
    expect(css).toMatch(/\.article-prose \.katex-display\s*\{[^}]*max-width:\s*100%;[^}]*overflow-x:\s*auto;[^}]*overflow-y:\s*hidden;/);
    expect(css).toMatch(/\.article-prose \.katex-display > \.katex\s*\{[^}]*width:\s*max-content;[^}]*min-width:\s*100%;/);
  });

  it("式号参与公式宽度计算, 不覆盖公式末尾", () => {
    expect(css).toMatch(/\.article-prose \.katex-display > \.katex > \.katex-html > \.tag\s*\{[^}]*position:\s*static;/);
  });
});
