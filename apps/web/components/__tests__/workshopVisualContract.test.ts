import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("工作室视觉契约", () => {
  it("共享材质层使用主题变量，不另设调色板", () => {
    const css = read("../../app/globals.css").split('@import "tw-animate-css"')[0];
    expect(css).toContain(".om-console-heading");
    expect(css).toContain("var(--om-brand)");
    expect(css).not.toMatch(/#[\da-f]{3,8}\b/i);
    expect(css).not.toContain(":root");
  });
  it("工作室重写场景，保留物件选择，不生成虚构监测数字", () => {
    const scene = read("../office/OfficeScene.tsx");
    const ui = read("../office/OfficeExperience.tsx");
    expect(scene).toContain("<Architecture />");
    expect(scene).toContain("<Workbench");
    expect(scene).toContain("<RobotArm");
    expect(scene).not.toContain("GamingDeskSet");
    expect(ui).toContain('aria-label="工作室物件"');
    expect(ui).toContain("onClick={() => setHotspot(id)}");
    expect(ui).not.toContain("animate-ping");
    const content = read("../office/officeContent.ts");
    expect(content).not.toMatch(/streaming · 2|当日 \+12|uploads\/llm-notes/);
    expect(ui).toContain("Object.keys(HOTSPOT_META)");
    expect(scene).toContain('frameloop={visible ? "demand" : "never"}');
  });
});
