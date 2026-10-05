/**
 * 公开站只读部署边界的静态契约测试。
 *
 * 公开 API 是导出的普通文件，不应出现任何写方法 Route Handler，也不得把本地 Server、
 * Prisma 或 tRPC 带入依赖图。部署头只声明 GET/HEAD/OPTIONS，访客写入能力必须从构建层消失，
 * 而不是由页面隐藏按钮来模拟。
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const siteRoot = path.resolve(import.meta.dirname, "../..");

function collectSourceFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectSourceFiles(absolute));
    else if (entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name)) files.push(absolute);
  }
  return files;
}

describe("公开站只读边界", () => {
  it("应用源码没有 POST、PUT、PATCH、DELETE Route Handler", () => {
    const source = collectSourceFiles(path.join(siteRoot, "app"))
      .map((file) => fs.readFileSync(file, "utf8"))
      .join("\n");
    expect(source).not.toMatch(/export\s+(?:async\s+)?function\s+(?:POST|PUT|PATCH|DELETE)\b/);
  });

  it("公开 API 的跨域方法声明只允许 GET、HEAD、OPTIONS", () => {
    const headers = fs.readFileSync(path.join(siteRoot, "public", "_headers"), "utf8");
    expect(headers).toContain("Access-Control-Allow-Methods: GET, HEAD, OPTIONS");
    expect(headers).not.toMatch(/Access-Control-Allow-Methods:[^\n]*(?:POST|PUT|PATCH|DELETE)/);
  });

  it("公开站依赖图不包含本地 Server、Prisma 或 tRPC", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(siteRoot, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
    };
    const names = Object.keys(pkg.dependencies ?? {});
    expect(names).not.toContain("@oasismind/server");
    expect(names).not.toContain("@prisma/client");
    expect(names.some((name) => name.startsWith("@trpc/"))).toBe(false);
  });
});
