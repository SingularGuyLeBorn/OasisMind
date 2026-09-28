/**
 * 访客博客 + 轻留言：仅已发布可读、留言即时可见、未发布拒留言。
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "../router.js";
import { createContextInner } from "../trpc/context.js";

describe("blog + comment", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let ctx: Awaited<ReturnType<typeof createContextInner>>;
  let publishedId = "";
  let draftId = "";
  const publishedSlug = `blog-comment-pub-${Date.now()}`;
  const draftSlug = `blog-comment-draft-${Date.now()}`;

  beforeAll(async () => {
    ctx = await createContextInner();
    caller = appRouter.createCaller(ctx);

    const pub = await ctx.prisma.post.create({
      data: {
        title: "访客博客测试文",
        slug: publishedSlug,
        garden: "posts",
        content: "# hello\n\n公开正文",
        published: true,
        tags: "",
      },
    });
    publishedId = pub.id;
    const draft = await ctx.prisma.post.create({
      data: {
        title: "草稿不可见",
        slug: draftSlug,
        garden: "posts",
        content: "secret",
        published: false,
        tags: "",
      },
    });
    draftId = draft.id;
  });

  afterAll(async () => {
    await ctx.prisma.comment.deleteMany({
      where: { postId: { in: [publishedId, draftId].filter(Boolean) } },
    });
    await ctx.prisma.post.deleteMany({
      where: { id: { in: [publishedId, draftId].filter(Boolean) } },
    });
  });

  it("blog.list 只返回已发布", async () => {
    const list = await caller.blog.list({
      page: 1,
      pageSize: 50,
      keyword: "访客博客测试文",
    });
    expect(list.items.every((p) => p.published)).toBe(true);
    expect(list.items.some((p) => p.id === publishedId)).toBe(true);
    expect(list.items.some((p) => p.id === draftId)).toBe(false);
  });

  it("blog.getBySlug 拒未发布", async () => {
    const pub = await caller.blog.getBySlug({ slug: publishedSlug, garden: "posts" });
    expect(pub.id).toBe(publishedId);

    await expect(
      caller.blog.getBySlug({ slug: draftSlug, garden: "posts" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("comment.create 对已发布即时可见；草稿拒绝", async () => {
    const created = await caller.comment.create({
      postId: publishedId,
      authorName: "访客甲",
      content: "写得不错",
    });
    expect(created.success).toBe(true);
    expect(created.data?.status).toBe("approved");

    const listed = await caller.comment.listForPost({ postId: publishedId });
    expect(listed.items.some((c) => c.content === "写得不错")).toBe(true);

    const rejected = await caller.comment.create({
      postId: draftId,
      authorName: "访客乙",
      content: "不该成功",
    });
    expect(rejected.success).toBe(false);
  });

  it("comment.hide 后 listForPost 不可见", async () => {
    const created = await caller.comment.create({
      postId: publishedId,
      authorName: "临时",
      content: "即将隐藏",
    });
    expect(created.success).toBe(true);
    const id = created.data!.id;
    const hidden = await caller.comment.hide({ id });
    expect(hidden.success).toBe(true);

    const listed = await caller.comment.listForPost({ postId: publishedId });
    expect(listed.items.some((c) => c.id === id)).toBe(false);
  });
});
