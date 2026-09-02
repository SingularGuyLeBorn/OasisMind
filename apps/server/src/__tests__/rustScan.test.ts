import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { scanWithRust, getRustBinaryPath } from "../scripts/sync/rustScan.js";
import { parseMarkdownFile, filePathToSlug, getFileMtime } from "../scripts/sync/utils.js";

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
    expect(rust2!.data.published).toBe(true);

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
});
