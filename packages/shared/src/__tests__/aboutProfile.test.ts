import { describe, expect, it } from "vitest";
import { parseAboutProfile } from "../aboutProfile";

describe("共用个人资料解析", () => {
  it("保留现有列表格式及 Markdown 正文", () => {
    const profile = parseAboutProfile("---\nname: 应知序\ntitle: 独立开发者\nfocus:\n  - **做东西**: 做出能运行的东西\nprojects:\n  - name: 见微\n    description: 数字花园\n    href: /\n---\n## 我是谁\n\n自己的原文。\n");
    expect(profile.name).toBe("应知序");
    expect(profile.focus).toEqual([{ title: "做东西", description: "做出能运行的东西" }]);
    expect(profile.projects[0].href).toBe("/");
    expect(profile.bodyMarkdown).toBe("## 我是谁\n\n自己的原文。");
  });
});
