import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import type { PrismaClient } from "@prisma/client";
import { scanWithRust, getRustBinaryPath } from "../scripts/sync/rustScan.js";
import { parseMarkdownFile, filePathToSlug, getFileMtime } from "../scripts/sync/utils.js";
import { createPostGardenSyncer } from "../scripts/sync/sync-posts.js";

describe("rustScan", () => {
  it("produces records compatible with TS parser", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "om-sync-test-"));
    const file1 = path.join(dir, "hello.md");
    const file2 = path.join(dir, "nested", "world.md");
    fs.mkdirSync(path.dirname(file2), { recursive: true });

    fs.writeFileSync(
      file1,
      "---\ntitle: Hello\ntags: [a, b]\npublished: true\n---\n# Content\n",
    );
    fs.writeFileSync(file2, "---\ntitle: World\n---\nSome text\n");

    const rustRecords = await scanWithRust(dir);
    expect(rustRecords).toHaveLength(2);

    const ts1 = parseMarkdownFile(file1);
    const ts2 = parseMarkdownFile(file2);

    const rust1 = rustRecords.find((r) => r.slug === "hello");
    const rust2 = rustRecords.find((r) => r.slug === "nested/world");

    expect(rust1).toBeDefined();
    expect(rust2).toBeDefined();

    expect(rust1!.data.title).toBe(ts1.data.title);
    expect(rust1!.data.content).toBe(ts1.content);
    expect(rust1!.data.tags).toBe("a,b");
    expect(rust1!.data.published).toBe(true);

    expect(rust2!.data.title).toBe(ts2.data.title);
    expect(rust2!.data.content).toBe(ts2.content);
    expect(rust2!.data.tags).toBe("");
    // 未写 published 的磁盘文章必须保持草稿；全量 Rust 与增量 TS 语义一致。
    expect(rust2!.data.published).toBe(false);

    const mtime1 = getFileMtime(file1).getTime();
    const mtime2 = getFileMtime(file2).getTime();
    expect(Math.abs(rust1!.mtime_ms - mtime1)).toBeLessThanOrEqual(5);
    expect(Math.abs(rust2!.mtime_ms - mtime2)).toBeLessThanOrEqual(5);
  });

  it("ignores .trash and _-prefixed files", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "om-sync-test-"));
    fs.mkdirSync(path.join(dir, ".trash"), { recursive: true });
    fs.writeFileSync(path.join(dir, ".trash", "a.md"), "x");
    fs.writeFileSync(path.join(dir, "_hidden.md"), "x");
    fs.writeFileSync(path.join(dir, "visible.md"), "---\ntitle: V\n---\nbody");

    const records = await scanWithRust(dir);
    expect(records).toHaveLength(1);
    expect(records[0].slug).toBe("visible");
  });

  it("binary path resolves on Windows", () => {
    const bin = getRustBinaryPath();
    expect(fs.existsSync(bin)).toBe(true);
  });

  it("post garden syncer scan() consumes om-sync output", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "om-sync-syncer-"));
    fs.writeFileSync(
      path.join(dir, "post.md"),
      "---\ntitle: T\ntags: [x, y]\npublished: false\n---\nBody\n",
    );

    const syncer = createPostGardenSyncer("knowledge");
    // scan 不触库，prisma 参数传空即可
    const records = await syncer.scan(null as unknown as PrismaClient, dir);

    expect(records).toHaveLength(1);
    expect(records[0].slug).toBe("post");
    expect(records[0].mtime).toBeInstanceOf(Date);
    expect(records[0].data.garden).toBe("knowledge");
    expect(records[0].data.title).toBe("T");
    expect(records[0].data.tags).toBe("x,y");
    expect(records[0].data.published).toBe(false);
  });

  it("增量 TypeScript 扫描对缺失或错误 published 采用草稿态", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "om-sync-incremental-"));
    const missing = path.join(dir, "missing.md");
    const invalid = path.join(dir, "invalid.md");
    fs.writeFileSync(missing, "---\ntitle: Missing\n---\nBody\n");
    fs.writeFileSync(invalid, "---\ntitle: Invalid\npublished: \"true\"\n---\nBody\n");

    const syncer = createPostGardenSyncer("knowledge");
    // Post 同步器必须支持增量扫描；先收窄可选接口，避免测试用非空断言掩盖契约变化。
    expect(syncer.scanFile).toBeTypeOf("function");
    if (!syncer.scanFile) throw new Error("Post 同步器缺少 scanFile 增量扫描能力");

    const missingRecord = await syncer.scanFile(missing, dir);
    const invalidRecord = await syncer.scanFile(invalid, dir);

    expect(missingRecord?.data.published).toBe(false);
    expect(invalidRecord?.data.published).toBe(false);
  });
});
