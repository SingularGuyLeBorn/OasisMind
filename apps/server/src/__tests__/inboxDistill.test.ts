/**
 * prd-inbox-distill.md 第 5 节：Inbox 蒸馏状态×事件表。
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { inboxDistillSchema } from "@oasismind/shared";
import { enterInProcessMockLlm, resetInProcessMockHits } from "@oasismind/mock-llm-core";
import { prisma } from "../db.js";
import { createContextInner } from "../trpc/context.js";

const RUN = `prd-distill-${Date.now().toString(36)}`;
const FAKE_CUID = `c${"e".repeat(24)}`;

async function insertItem(input: {
  title: string;
  status?: string;
  distilledPostId?: string | null;
  url?: string;
}) {
  const externalId = `${RUN}-${Math.random().toString(36).slice(2)}`;
  return prisma.inboxItem.create({
    data: {
      source: "url",
      externalId,
      title: input.title,
      url: input.url ?? `https://example.com/${externalId}`,
      excerpt: input.title,
      content: `正文 ${input.title} 来源 https://example.com/${externalId}`,
      status: input.status ?? "fetched",
      distilledPostId: input.distilledPostId ?? null,
      tags: "prd",
    },
  });
}

describe("PRD Inbox 蒸馏 状态×事件表", () => {
  const inboxIds: string[] = [];
  const postIds: string[] = [];
  let services: Awaited<ReturnType<typeof createContextInner>>["services"];

  // W4：经 schema parse，默认不传 mode → "raw"，行为与旧测完全相同；taste 测显式传 mode。
  const distill = (input: {
    ids: string[];
    garden?: string;
    published?: boolean;
    mode?: "raw" | "taste";
  }) => services.inbox.distill(inboxDistillSchema.parse(input));

  beforeEach(async () => {
    const ctx = await createContextInner();
    services = ctx.services;
  });

  afterEach(async () => {
    for (const id of postIds.splice(0)) {
      await services.post.delete(id).catch(() => undefined);
      await services.post.permanentDelete(id).catch(() => undefined);
    }
    if (inboxIds.length) {
      await prisma.inboxItem.deleteMany({ where: { id: { in: inboxIds.splice(0) } } }).catch(() => {});
    }
  });

  it("R6 ids=[] schema 拒绝", () => {
    expect(() => inboxDistillSchema.parse({ ids: [] })).toThrow();
  });

  it("R12 默认 published=false", () => {
    const parsed = inboxDistillSchema.parse({ ids: [FAKE_CUID] });
    expect(parsed.published).toBe(false);
    expect(parsed.garden).toBe("knowledge");
    expect(parsed.mode).toBe("raw");
  });

  it("R2 fetched 蒸馏成功：status+正文含 URL", async () => {
    const item = await insertItem({ title: `${RUN} 单篇` });
    inboxIds.push(item.id);
    const result = await distill({ ids: [item.id], garden: "knowledge", published: false });
    expect(result.errors).toEqual([]);
    expect(result.distilled).toHaveLength(1);
    postIds.push(result.distilled[0]!.postId);
    const row = await prisma.inboxItem.findUnique({ where: { id: item.id } });
    expect(row?.status).toBe("distilled");
    expect(row?.distilledPostId).toBe(result.distilled[0]!.postId);
    const post = await prisma.post.findUnique({ where: { id: result.distilled[0]!.postId } });
    expect(post?.published).toBe(false);
    expect(post?.content).toContain(item.url);
  });

  it("R3 ignored 跳过不建 Post", async () => {
    const item = await insertItem({ title: `${RUN} 忽略`, status: "ignored" });
    inboxIds.push(item.id);
    const result = await distill({ ids: [item.id], garden: "knowledge", published: false });
    expect(result.distilled).toEqual([]);
    expect(result.errors.some((e) => e.includes("已忽略"))).toBe(true);
    const row = await prisma.inboxItem.findUnique({ where: { id: item.id } });
    expect(row?.status).toBe("ignored");
    expect(row?.distilledPostId).toBeNull();
  });

  it("R4 已蒸馏再调幂等，不新建", async () => {
    const item = await insertItem({ title: `${RUN} 幂等` });
    inboxIds.push(item.id);
    const first = await distill({ ids: [item.id], garden: "knowledge", published: false });
    expect(first.distilled).toHaveLength(1);
    postIds.push(first.distilled[0]!.postId);
    const second = await distill({ ids: [item.id], garden: "knowledge", published: false });
    expect(second.distilled).toHaveLength(1);
    expect(second.distilled[0]!.postId).toBe(first.distilled[0]!.postId);
    expect(second.errors).toEqual([]);
  });

  it("R5 幽灵 id 省略", async () => {
    const ghost = "clghostinboxitem000000001";
    const result = await distill({ ids: [ghost], garden: "knowledge", published: false });
    expect(result.distilled).toEqual([]);
    expect(result.errors.some((e) => e.includes(ghost))).toBe(false);
  });

  it("R7 混合批次：成功 + 忽略 + 幽灵", async () => {
    const fetched = await insertItem({ title: `${RUN} 混-fetched` });
    const ignored = await insertItem({ title: `${RUN} 混-ignored`, status: "ignored" });
    inboxIds.push(fetched.id, ignored.id);
    const ghost = "clghostinboxitem000000002";
    const result = await distill({
      ids: [fetched.id, ignored.id, ghost],
      garden: "knowledge",
      published: false,
    });
    expect(result.distilled.map((d) => d.inboxId)).toEqual([fetched.id]);
    postIds.push(result.distilled[0]!.postId);
    expect(result.errors.some((e) => e.includes(ignored.id))).toBe(true);
    expect(result.errors.some((e) => e.includes(ghost))).toBe(false);
  });

  it("R8 post.create 失败时该条仍 fetched", async () => {
    const item = await insertItem({ title: `${RUN} 撞slug` });
    inboxIds.push(item.id);
    const slugBase =
      item.title
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fff]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48) || `inbox-${item.id.slice(-6)}`;
    const slug = `inbox/${slugBase}-${item.id.slice(-6)}`;
    const blocker = await services.post.create({
      title: `${RUN} blocker`,
      garden: "knowledge",
      slug,
      content: "占坑",
      published: false,
    });
    expect(blocker.success, JSON.stringify(blocker)).toBe(true);
    if (blocker.data?.id) postIds.push(blocker.data.id);

    const result = await distill({ ids: [item.id], garden: "knowledge", published: false });
    expect(result.distilled).toEqual([]);
    expect(result.errors.length).toBeGreaterThan(0);
    const row = await prisma.inboxItem.findUnique({ where: { id: item.id } });
    expect(row?.status).toBe("fetched");
  });

  it("R9 刷新后 getById 仍 distilled", async () => {
    const item = await insertItem({ title: `${RUN} 刷新` });
    inboxIds.push(item.id);
    const result = await distill({ ids: [item.id], garden: "knowledge", published: false });
    postIds.push(result.distilled[0]!.postId);
    const again = await services.inbox.getById(item.id);
    expect(again.status).toBe("distilled");
    expect(again.distilledPostId).toBe(result.distilled[0]!.postId);
  });
});

describe("W4 Inbox 蒸馏 taste 模式", () => {
  const inboxIds: string[] = [];
  const postIds: string[] = [];
  let services: Awaited<ReturnType<typeof createContextInner>>["services"];

  beforeEach(async () => {
    const ctx = await createContextInner();
    services = ctx.services;
  });

  afterEach(async () => {
    for (const id of postIds.splice(0)) {
      await services.post.delete(id).catch(() => undefined);
      await services.post.permanentDelete(id).catch(() => undefined);
    }
    if (inboxIds.length) {
      await prisma.inboxItem.deleteMany({ where: { id: { in: inboxIds.splice(0) } } }).catch(() => {});
    }
  });

  it("taste 成文正文含【Mock 品味蒸馏】与来源 URL", async () => {
    const restoreMock = enterInProcessMockLlm();
    resetInProcessMockHits();
    try {
      const item = await insertItem({ title: `${RUN} taste`, url: "https://example.com/taste-abc" });
      inboxIds.push(item.id);
      const result = await services.inbox.distill(
        inboxDistillSchema.parse({ ids: [item.id], garden: "knowledge", published: false, mode: "taste" }),
      );
      expect(result.errors).toEqual([]);
      expect(result.distilled).toHaveLength(1);
      postIds.push(result.distilled[0]!.postId);
      const post = await prisma.post.findUnique({ where: { id: result.distilled[0]!.postId } });
      expect(post?.content).toContain("【Mock 品味蒸馏】");
      expect(post?.content).toContain("https://example.com/taste-abc");
      const row = await prisma.inboxItem.findUnique({ where: { id: item.id } });
      expect(row?.status).toBe("distilled");
    } finally {
      restoreMock();
    }
  });

  it("taste 模型抛错时 status 仍 fetched，不建 post", async () => {
    // 原文含 MOCK_TASTE_FAIL_TOKEN → mock taste 场景抛错 → 改写失败
    const restoreMock = enterInProcessMockLlm();
    try {
      const item = await insertItem({ title: `${RUN} taste-fail OM-MOCK-TASTE-FAIL`, url: "https://example.com/taste-fail" });
      inboxIds.push(item.id);
      const result = await services.inbox.distill(
        inboxDistillSchema.parse({ ids: [item.id], garden: "knowledge", published: false, mode: "taste" }),
      );
      expect(result.distilled).toEqual([]);
      expect(result.errors.length).toBeGreaterThan(0);
      const row = await prisma.inboxItem.findUnique({ where: { id: item.id } });
      expect(row?.status).toBe("fetched");
    } finally {
      restoreMock();
    }
  });
});
