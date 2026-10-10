import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("公开办公室边界", () => {
  it("办公室按明确进入动作加载共享场景，不连接本地面板或服务", () => {
    const source = fs.readFileSync(new URL("../../components/PublicOffice.tsx", import.meta.url), "utf8");
    expect(source).toContain('lazy(() => import("@oasismind/brand/office")');
    expect(source).toContain("!entered ?");
    expect(source).toContain("onClick={() => setEntered(true)}");
    expect(source).not.toMatch(/OfficeOverlays|officeContent|trpc|localhost|\/chat|\/agents|\/runs|\/approvals/);
    expect(source).toContain('aria-label="工作室物件"');
    expect(source).toContain('onClose={() => setSelected(null)}');
  });
  it("公开入口只向浏览器传递已发布知识库的标识与标题", () => {
    const source = fs.readFileSync(new URL("../../app/office/page.tsx", import.meta.url), "utf8");
    expect(source).toContain("getManifest().gardens");
    expect(source).toContain("map(({ id, title }) => ({ id, title }))");
  });
});
