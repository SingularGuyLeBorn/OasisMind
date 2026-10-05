import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { PostAnnotationService } from "../../infra/entityServices/postAnnotationService.js";

const roots: string[] = [];

function fixture(postExists = true) {
  const contentDir = fs.mkdtempSync(path.join(os.tmpdir(), "om-private-annotations-"));
  roots.push(contentDir);
  const prisma = {
    post: {
      findFirst: async () => postExists ? { id: "post-1" } : null,
    },
  } as unknown as PrismaClient;
  return {
    contentDir,
    prisma,
    service: new PostAnnotationService(prisma, { contentDir }),
  };
}

afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

describe("PostAnnotationService", () => {
  it("以独立 YAML 永久保存，并可由新服务实例重新读取", async () => {
    const { contentDir, prisma, service } = fixture();
    const created = await service.create({
      garden: "notes",
      slug: "chapter/one",
      anchor: { exact: "重点内容", prefix: "前文", suffix: "后文", startOffset: 10, endOffset: 14 },
      style: "underline",
      comment: "这里值得反复看",
    });

    const storageRoot = path.join(contentDir, ".private", "annotations");
    const files = fs.readdirSync(storageRoot, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile());
    expect(files).toHaveLength(1);
    expect(files[0]?.name).toBe(`${created.id}.yaml`);
    expect(JSON.stringify(files)).not.toContain("chapter/one");

    const restarted = new PostAnnotationService(prisma, { contentDir });
    expect(await restarted.list({ garden: "notes", slug: "chapter/one" })).toEqual([created]);
  });

  it("更新评论与样式时保留锚点，删除后清理空文章目录", async () => {
    const { contentDir, service } = fixture();
    const created = await service.create({
      garden: "notes",
      slug: "one",
      anchor: { exact: "原文", prefix: "", suffix: "", startOffset: 0, endOffset: 2 },
      style: "highlight",
      comment: "",
    });
    const updated = await service.update({
      garden: "notes",
      slug: "one",
      id: created.id,
      style: "wavy",
      comment: "补充说明",
    });
    expect(updated.anchor).toEqual(created.anchor);
    expect(updated).toMatchObject({ style: "wavy", comment: "补充说明" });

    await service.delete({ garden: "notes", slug: "one", id: created.id });
    expect(await service.list({ garden: "notes", slug: "one" })).toEqual([]);
    const storageRoot = path.join(contentDir, ".private", "annotations");
    expect(fs.existsSync(storageRoot) ? fs.readdirSync(storageRoot).length : 0).toBe(0);
  });

  it("进程在替换文件中途退出后，列表会从完整备份自动恢复", async () => {
    const { contentDir, prisma, service } = fixture();
    const created = await service.create({
      garden: "notes",
      slug: "recovery",
      anchor: { exact: "可恢复", prefix: "", suffix: "", startOffset: 0, endOffset: 3 },
      style: "highlight",
      comment: "不能因重启丢失",
    });
    const storageRoot = path.join(contentDir, ".private", "annotations");
    const articleDirectory = fs.readdirSync(storageRoot).map((name) => path.join(storageRoot, name))[0];
    const target = path.join(articleDirectory, `${created.id}.yaml`);
    fs.renameSync(target, `${target}.bak`);

    const restarted = new PostAnnotationService(prisma, { contentDir });
    expect(await restarted.list({ garden: "notes", slug: "recovery" })).toEqual([created]);
    expect(fs.existsSync(target)).toBe(true);
    expect(fs.existsSync(`${target}.bak`)).toBe(false);
  });

  it("文章不存在时拒绝创建孤儿批注", async () => {
    const { service } = fixture(false);
    await expect(service.create({
      garden: "notes",
      slug: "missing",
      anchor: { exact: "不存在", prefix: "", suffix: "", startOffset: 0, endOffset: 3 },
      style: "highlight",
      comment: "",
    })).rejects.toThrow("文章不存在");
  });

  it("损坏的批注文件会报告具体路径，不会静默丢失", async () => {
    const { contentDir, service } = fixture();
    const created = await service.create({
      garden: "notes",
      slug: "broken",
      anchor: { exact: "原文", prefix: "", suffix: "", startOffset: 0, endOffset: 2 },
      style: "highlight",
      comment: "稍后会损坏",
    });
    const storageRoot = path.join(contentDir, ".private", "annotations");
    const articleDirectory = path.join(storageRoot, fs.readdirSync(storageRoot)[0]!);
    const target = path.join(articleDirectory, `${created.id}.yaml`);
    fs.writeFileSync(target, "anchor: [损坏", "utf8");

    await expect(service.list({ garden: "notes", slug: "broken" }))
      .rejects.toThrow(`读取私人批注失败：${target}`);
  });

  it("恶意 garden 和 slug 也只能落到哈希隔离目录", async () => {
    const { contentDir, service } = fixture();
    const created = await service.create({
      garden: "../../config",
      slug: "../data/secret",
      anchor: { exact: "隔离", prefix: "", suffix: "", startOffset: 0, endOffset: 2 },
      style: "underline",
      comment: "不能路径穿越",
    });
    const storageRoot = path.join(contentDir, ".private", "annotations");
    const files = fs.readdirSync(storageRoot, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile());

    expect(files).toHaveLength(1);
    expect(files[0]?.name).toBe(`${created.id}.yaml`);
    expect(fs.existsSync(path.join(contentDir, "config"))).toBe(false);
    expect(fs.existsSync(path.join(contentDir, "data"))).toBe(false);
  });
});
