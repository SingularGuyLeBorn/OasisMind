import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "../safeRedirectPath";

describe("safeRedirectPath", () => {
  it("保留站内路径", () => {
    expect(safeRedirectPath("/posts")).toBe("/posts");
    expect(safeRedirectPath("/chat?sessionId=abc")).toBe("/chat?sessionId=abc");
  });

  it("拒绝协议相对与外链", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/chat");
    expect(safeRedirectPath("https://evil.com")).toBe("/chat");
    expect(safeRedirectPath("javascript:alert(1)")).toBe("/chat");
    expect(safeRedirectPath("/\\evil")).toBe("/chat");
  });
});
