/**
 * 知乎查询层离线 fixture：不访问平台，锁定归一化、组合过滤、稳定排序与关注未知态。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  annotateZhihuFollowing,
  buildZhihuTopicQuery,
  filterZhihuList,
  normalizeZhihuList,
  parseZhihuDate,
  renderZhihuTable,
  sortZhihuList,
} from "../infra/zhihuQuery.js";

const fixturePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "zhihu-search.json",
);
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8")) as {
  Data: { Items: unknown[] };
};

describe("zhihuQuery", () => {
  it("把搜索字段归一为完整稳定结构，并清理追踪参数", () => {
    const items = normalizeZhihuList(fixture.Data.Items);
    expect(items[0]).toMatchObject({
      rank: 1,
      contentType: "article",
      id: "1001",
      author: { name: "甲", urlToken: "author-a" },
      voteCount: 320,
      commentCount: 18,
      tags: ["人工智能", "AI Agent"],
      rankingScore: 0.91,
      authorityLevel: "3",
    });
    expect(items[0]!.url).toBe("https://zhuanlan.zhihu.com/p/1001");
    expect(items[1]!.question).toEqual({ id: "9001", title: "如何设计可靠的智能体？" });
  });

  it("组合作者、类型、标签、日期和最低赞同数过滤", () => {
    const items = normalizeZhihuList(fixture.Data.Items);
    const result = filterZhihuList(items, {
      contentTypes: ["article"],
      author: "author-a",
      tags: ["人工智能", "AI Agent"],
      tagMode: "all",
      from: parseZhihuDate("2025-01-01"),
      to: parseZhihuDate("2026-12-31", true),
      minVotes: 100,
    });
    expect(result.map((item) => item.id)).toEqual(["1001"]);
  });

  it("按赞同、评论、时间和相关度稳定排序", () => {
    const items = normalizeZhihuList(fixture.Data.Items);
    expect(sortZhihuList(items, "votes").map((item) => item.id)).toEqual(["1001", "2002", "2003"]);
    expect(sortZhihuList(items, "comments").map((item) => item.id)).toEqual(["2002", "1001", "2003"]);
    expect(sortZhihuList(items, "time").map((item) => item.id)).toEqual(["1001", "2002", "2003"]);
    expect(sortZhihuList(items, "relevance").map((item) => item.id)).toEqual(["2002", "1001", "2003"]);
  });

  it("关注扫描不完整时保持 unknown，防止误判为未关注", () => {
    const items = normalizeZhihuList(fixture.Data.Items);
    const partial = annotateZhihuFollowing(items, new Set(["甲"]), new Set(), false);
    expect(partial.map((item) => item.followed)).toEqual([true, null, null]);
    expect(filterZhihuList(partial, { follow: "exclude" })).toEqual([]);

    const complete = annotateZhihuFollowing(items, new Set(["甲"]), new Set(), true);
    expect(filterZhihuList(complete, { follow: "exclude" }).map((item) => item.id)).toEqual([
      "2002",
      "2003",
    ]);
  });

  it("标签会进入官方搜索词，表格不会丢失结果 URL", () => {
    expect(buildZhihuTopicQuery("Agent", ["大模型", "大模型", "工程"])).toBe("Agent 大模型 工程");
    const table = renderZhihuTable(normalizeZhihuList(fixture.Data.Items).slice(0, 1));
    expect(table).toContain("Agent 工程实践");
    expect(table).toContain("https://zhuanlan.zhihu.com/p/1001");
  });
});
