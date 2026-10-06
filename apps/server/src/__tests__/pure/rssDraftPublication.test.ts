/**
 * RSS 入库发布边界回归测试。
 * 事实源是 draftPostsFromRssItems 交给 Prisma 的创建参数；测试不访问网络或真实数据库。
 */
import { describe, expect, it, vi } from "vitest";
import { draftPostsFromRssItems } from "../../infra/rssFetch.js";

describe("RSS 条目转文章", () => {
  it("始终创建 unpublished 草稿", async () => {
    const create = vi.fn(async () => ({ id: "post-1" }));
    const prisma = {
      infoSource: {
        findUnique: vi.fn(async () => ({ id: "source-1", name: "示例源", url: "https://example.com" })),
      },
      infoSourceItem: {
        findMany: vi.fn(async () => [
          {
            id: "item-1",
            title: "待整理条目",
            description: "RSS 摘要",
            link: "https://example.com/post",
          },
        ]),
        update: vi.fn(async () => ({})),
      },
      post: { create },
    };

    const ids = await draftPostsFromRssItems(prisma as never, "source-1", ["item-1"]);

    expect(ids).toEqual(["post-1"]);
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({ published: false }),
    });
  });
});
