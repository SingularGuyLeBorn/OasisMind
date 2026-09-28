/**
 * post.related / createFromChat 完整路径测试
 */
import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "../router.js";
import { createContextInner } from "../trpc/context.js";

describe("post.related + createFromChat", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let caller: any;

  beforeAll(async () => {
    const ctx = await createContextInner();
    caller = appRouter.createCaller(ctx);
  });

  it("related 按标签与同花园返回邻近文章并排除自身", async () => {
    const stamp = Date.now();
    const a = await caller.post.create({
      title: `相关测试甲 ${stamp}`,
      content: "扩散模型 DDPM 基础与噪声日程",
      garden: "posts",
      tags: ["diffusion", "related-test"],
      category: "ML",
      published: true,
    });
    expect(a.success).toBe(true);
    const b = await caller.post.create({
      title: `相关测试乙 ${stamp}`,
      content: "DDPM 采样与训练技巧",
      garden: "posts",
      tags: ["diffusion", "related-test"],
      category: "ML",
      published: true,
    });
    expect(b.success).toBe(true);

    const related = await caller.post.related({ id: a.data!.id, limit: 8 });
    expect(related.some((r: { id: string }) => r.id === a.data!.id)).toBe(false);
    expect(related.some((r: { id: string }) => r.id === b.data!.id)).toBe(true);
    const hit = related.find((r: { id: string }) => r.id === b.data!.id)!;
    expect(hit.reasons.length).toBeGreaterThan(0);
    expect(hit.score).toBeGreaterThan(0);

    await caller.post.delete({ id: a.data!.id });
    await caller.post.delete({ id: b.data!.id });
  });

  it("createFromChat 以服务端消息正文新建文章", async () => {
    const session = await caller.session.create({
      title: `落库测试会话 ${Date.now()}`,
      model: "deepseek-chat",
      systemPrompt: "test",
    });
    expect(session.success).toBe(true);

    const msg = await caller.message.create({
      sessionId: session.data!.id,
      role: "assistant",
      content: `# 落库正文\n\n这是 createFromChat 测试内容 ${Date.now()}`,
    });
    expect(msg.success).toBe(true);

    const created = await caller.post.createFromChat({
      sessionId: session.data!.id,
      messageId: msg.data!.id,
      mode: "create",
      garden: "posts",
      tags: ["from-chat"],
      published: true,
    });
    expect(created.success).toBe(true);
    expect(created.data!.content).toContain("createFromChat 测试内容");
    expect(created.data!.tags).toContain("from-chat");

    await caller.post.delete({ id: created.data!.id });
  });

  it("createFromChat append 追加到既有文章", async () => {
    const session = await caller.session.create({
      title: `落库追加会话 ${Date.now()}`,
      model: "deepseek-chat",
      systemPrompt: "test",
    });
    expect(session.success).toBe(true);

    const base = await caller.post.create({
      title: `追加目标 ${Date.now()}`,
      content: "原始段落",
      garden: "posts",
      published: true,
    });
    expect(base.success).toBe(true);

    const msg = await caller.message.create({
      sessionId: session.data!.id,
      role: "assistant",
      content: "追加段落内容",
    });
    expect(msg.success).toBe(true);

    const appended = await caller.post.createFromChat({
      sessionId: session.data!.id,
      messageId: msg.data!.id,
      mode: "append",
      targetPostId: base.data!.id,
      appendHeading: "对话补充",
      published: true,
    });
    expect(appended.success).toBe(true);
    expect(appended.data!.content).toContain("原始段落");
    expect(appended.data!.content).toContain("## 对话补充");
    expect(appended.data!.content).toContain("追加段落内容");

    await caller.post.delete({ id: base.data!.id });
  });

  it("createFromChat 晨间简报：tags 日报 + appendHeading 每日简报，正文来自 messageId", async () => {
    const session = await caller.session.create({
      title: `晨间简报会话 ${Date.now()}`,
      model: "deepseek-chat",
      systemPrompt: "test",
    });
    expect(session.success).toBe(true);

    const base = await caller.post.create({
      title: `知识草稿 ${Date.now()}`,
      content: "昨夜要点占位",
      garden: "posts",
      tags: ["日报"],
      published: false,
    });
    expect(base.success).toBe(true);

    const msg = await caller.message.create({
      sessionId: session.data!.id,
      role: "assistant",
      content: "Inbox 增量：1) A  2) B",
    });
    expect(msg.success).toBe(true);

    const appended = await caller.post.createFromChat({
      sessionId: session.data!.id,
      messageId: msg.data!.id,
      mode: "append",
      targetPostId: base.data!.id,
      appendHeading: "每日简报",
      tags: ["日报"],
      published: false,
    });
    expect(appended.success).toBe(true);
    expect(appended.data!.content).toContain("## 每日简报");
    expect(appended.data!.content).toContain("Inbox 增量");
    expect(appended.data!.tags).toContain("日报");
    expect(appended.data!.content).not.toContain("伪造客户端正文");

    await caller.post.delete({ id: base.data!.id });
  });

  it("未发布与墓碑不得进入 related（死链）", async () => {
    const stamp = Date.now();
    const a = await caller.post.create({
      title: `死链锚 ${stamp}`,
      content: "相关笔记死链过滤锚点 DDPM",
      garden: "posts",
      tags: ["dead-link-filter"],
      category: "ML",
      published: true,
    });
    const draft = await caller.post.create({
      title: `未发布草稿 ${stamp}`,
      content: "相关笔记死链过滤草稿 DDPM",
      garden: "posts",
      tags: ["dead-link-filter"],
      category: "ML",
      published: false,
    });
    expect(a.success && draft.success).toBe(true);

    const related = await caller.post.related({ id: a.data!.id, limit: 8 });
    expect(related.some((r: { id: string }) => r.id === draft.data!.id)).toBe(false);
    expect(related.every((r: { slug: string; garden: string }) => r.slug && r.garden)).toBe(true);

    await caller.post.delete({ id: draft.data!.id });
    const afterDelete = await caller.post.related({ id: a.data!.id, limit: 8 });
    expect(afterDelete.some((r: { id: string }) => r.id === draft.data!.id)).toBe(false);

    await caller.post.delete({ id: a.data!.id });
  });
});
