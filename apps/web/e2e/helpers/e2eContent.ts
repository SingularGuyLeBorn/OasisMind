/**
 * Mock E2E：经 tRPC 造文章 / Inbox，测完软删+硬删，避免污染知识库。
 */

import { trpcMutate, trpcQuery } from "./trpcE2e";

type OpResult<T> = {
  success?: boolean;
  data?: T;
  error?: { message?: string };
};

export async function createE2ePost(input: {
  title: string;
  content: string;
  slug?: string;
  tags?: string[];
  garden?: string;
  published?: boolean;
  category?: string;
}): Promise<{ id: string; slug: string; garden: string; title: string }> {
  const createRes = await trpcMutate<
    OpResult<{ id: string; slug: string; garden: string; title: string }>
  >("post.create", {
    title: input.title,
    slug: input.slug,
    content: input.content,
    excerpt: input.title,
    published: input.published ?? true,
    category: input.category ?? "测试",
    tags: input.tags ?? ["e2e"],
    garden: input.garden,
  });
  if (!createRes.success || !createRes.data) {
    throw new Error(createRes.error?.message ?? "post.create 失败");
  }
  return createRes.data;
}

export async function forceCleanupPost(postId: string | undefined): Promise<void> {
  if (!postId) return;
  try {
    const listDeleted = await trpcQuery<{ items: Array<{ id: string }> }>("post.listDeleted");
    if (listDeleted.items?.some((p) => p.id === postId)) {
      await trpcMutate("post.permanentDelete", { id: postId });
      return;
    }
  } catch {
    /* 继续尝试 */
  }
  try {
    await trpcMutate("post.delete", { id: postId });
    await trpcMutate("post.permanentDelete", { id: postId });
  } catch {
    /* 可能已被删 */
  }
}

export async function createE2eInboxItem(input: {
  title: string;
  url: string;
  externalId: string;
  content?: string;
}): Promise<{ id: string }> {
  const created = await trpcMutate<OpResult<{ id: string }>>("inbox.create", {
    source: "url",
    externalId: input.externalId,
    title: input.title,
    url: input.url,
    excerpt: input.title,
    content: input.content ?? `来源 ${input.url}`,
    tags: ["周刊"],
    status: "fetched",
  });
  const id = created.data?.id;
  if (!created.success || !id) {
    throw new Error(created.error?.message ?? "inbox.create 失败");
  }
  return { id };
}

export async function cleanupInboxItem(id: string | undefined): Promise<void> {
  if (!id) return;
  try {
    await trpcMutate("inbox.delete", { id });
  } catch {
    /* 可能已被删 */
  }
}
