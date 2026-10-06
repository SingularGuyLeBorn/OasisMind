/** 部署路径契约：根域名与 GitHub Pages 项目站必须共用一套路径规则。 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { normalizeSiteBasePath, withSiteBasePath } from "../../siteConfig";

describe("siteConfig", () => {
  it("规范化根路径和项目站路径", () => {
    expect(normalizeSiteBasePath(undefined)).toBe("");
    expect(normalizeSiteBasePath("/")).toBe("");
    expect(normalizeSiteBasePath(" /OasisMind ")).toBe("/OasisMind");
    for (const invalid of ["OasisMind", "/OasisMind/", "//example.com", "/OasisMind?q=1", "/Oasis Mind"]) {
      expect(() => normalizeSiteBasePath(invalid)).toThrow("公开站挂载路径无效");
    }
  });

  it("只给同源根路径补一次前缀", () => {
    expect(withSiteBasePath("/api/v1/index.json", "/OasisMind")).toBe("/OasisMind/api/v1/index.json");
    expect(withSiteBasePath("/OasisMind/api/v1/index.json", "/OasisMind"))
      .toBe("/OasisMind/api/v1/index.json");
    expect(withSiteBasePath("https://example.com/a", "/OasisMind")).toBe("https://example.com/a");
    expect(withSiteBasePath("#目录", "/OasisMind")).toBe("#目录");
  });

  it("Pages 工作流只上传公开站 out，并把平台地址传给构建", () => {
    const workflowPath = path.resolve(process.cwd(), "..", "..", ".github", "workflows", "deploy-public-site.yml");
    const workflow = fs.readFileSync(workflowPath, "utf8");
    expect(workflow).toContain("actions/configure-pages@v5");
    expect(workflow).toContain("NEXT_PUBLIC_SITE_URL: ${{ steps.pages.outputs.base_url }}");
    expect(workflow).toContain("NEXT_PUBLIC_SITE_BASE_PATH: ${{ steps.pages.outputs.base_path }}");
    expect(workflow).toContain("path: apps/site/out");
    expect(workflow).not.toMatch(/path:\s*(?:\.|content|config|data|workspaces)\s*$/m);
    expect(workflow).toContain("actions/deploy-pages@v5");
  });
});
