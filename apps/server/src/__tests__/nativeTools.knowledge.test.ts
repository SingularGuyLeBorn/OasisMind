// 从 nativeTools.test.ts 剪切，断言不改
import fs from "fs";
import path from "path";
import http from "http";
import { execFileSync } from "child_process";
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from "vitest";
import {
  executeNativeTool,
  buildNativeToolSchemas,
  listNativeTools,
  resolveAllowedNativeTools,
  isUnreadableArticlePage,
} from "../infra/nativeTools.js";
import { resetSwarmBus } from "../infra/swarmBus.js";
import {
  ALL_NATIVE_TOOL_NAMES,
  createNativeCtx,
  createTempProjectDir,
} from "./helpers/toolTestFixtures.js";

describe("native:post_create / post_update", () => {
  it("post_create 调用 post.create 并返回 slug", async () => {
    const root = createTempProjectDir();
    const postService = {
      create: vi.fn(async () => ({ success: true, data: { id: "p1", slug: "hello-world", title: "Hello" } })),
    };
    const ctx = createNativeCtx(root, { services: { post: postService } as never });
    const result = (await executeNativeTool(
      "post_create",
      { title: "Hello", content: "# Hi", tags: ["a", "b"], published: true },
      ctx,
    )) as { id: string; slug: string };
    expect(postService.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Hello", content: "# Hi", published: true, tags: ["a", "b"] }),
    );
    expect(result.slug).toBe("hello-world");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("post_update 调用 post.update", async () => {
    const root = createTempProjectDir();
    const postService = {
      update: vi.fn(async () => ({ success: true, data: { id: "p1", slug: "hello", title: "Hello Updated" } })),
    };
    const ctx = createNativeCtx(root, { services: { post: postService } as never });
    const result = (await executeNativeTool("post_update", { id: "p1", title: "Hello Updated" }, ctx)) as {
      id: string;
      title: string;
    };
    expect(postService.update).toHaveBeenCalledWith(expect.objectContaining({ id: "p1", title: "Hello Updated" }));
    expect(result.title).toBe("Hello Updated");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("post_create title 为空时报错", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("post_create", { title: "  " }, ctx)).rejects.toThrow(/title 不能为空/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("post_delete 调用 post.delete 并返回 deleted", async () => {
    const root = createTempProjectDir();
    const postService = {
      delete: vi.fn(async () => ({ success: true, data: { id: "p1", deleted: true } })),
    };
    const ctx = createNativeCtx(root, { services: { post: postService } as never });
    const result = (await executeNativeTool("post_delete", { id: "p1" }, ctx)) as { id: string; deleted: boolean };
    expect(postService.delete).toHaveBeenCalledWith("p1");
    expect(result.deleted).toBe(true);
    fs.rmSync(root, { recursive: true, force: true });
  });
});

describe("native:article_import", () => {
  const tinyPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );

  beforeAll(() => {
    process.env.OM_ALLOW_PRIVATE_HTTP = "1";
  });
  afterAll(() => {
    delete process.env.OM_ALLOW_PRIVATE_HTTP;
  });

  function startLocalServer(): Promise<{ url: string; close: () => void }> {
    return new Promise((resolve) => {
      const server = http.createServer((req, res) => {
        if (req.url === "/img.png") {
          res.writeHead(200, { "Content-Type": "image/png" });
          res.end(tinyPng);
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          `<html><body><article><h1>Test Import</h1><p>This is a paragraph.</p><img src="/img.png" alt="dot"></article></body></html>`,
        );
      });
      server.listen(0, "127.0.0.1", () => {
        const addr = server.address() as { port: number };
        resolve({
          url: `http://127.0.0.1:${addr.port}`,
          close: () => server.close(),
        });
      });
    });
  }

  it("抓取正文并下载图片到本地 uploads/imports，改写 Markdown 图片路径", async () => {
    const root = createTempProjectDir();
    const server = await startLocalServer();
    let capturedContent = "";
    let capturedGarden = "";
    let capturedSlug = "";

    const ctx = createNativeCtx(root, {
      services: {
        post: {
          create: async (input: Record<string, unknown>) => {
            capturedContent = String(input.content || "");
            capturedGarden = String(input.garden || "");
            capturedSlug = String(input.slug || "");
            return {
              success: true,
              data: { id: "post-123", garden: capturedGarden, slug: capturedSlug },
            };
          },
        },
      } as never,
    });

    try {
      const result = (await executeNativeTool(
        "article_import",
        { url: `${server.url}/article`, method: "direct", published: true },
        ctx,
      )) as {
        imageCount: number;
        failedDownloads: string[];
        path: string;
      };

      expect(result.imageCount).toBeGreaterThanOrEqual(1);
      expect(result.failedDownloads).toHaveLength(0);
      expect(capturedContent).toContain("/uploads/imports/");
      expect(capturedContent).toContain("![dot]");
      expect(capturedContent).toContain("This is a paragraph.");
      expect(result.path).toBe(`content/${capturedGarden}/${capturedSlug}.md`);
      const importsDir = path.join(root, "content", "uploads", "imports");
      const dirs = fs.readdirSync(importsDir);
      expect(dirs.length).toBeGreaterThanOrEqual(1);
      const imgDir = path.join(importsDir, dirs[0]!);
      const files = fs.readdirSync(imgDir).filter((f) => f.endsWith(".png"));
      expect(files.length).toBeGreaterThanOrEqual(1);
    } finally {
      server.close();
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
