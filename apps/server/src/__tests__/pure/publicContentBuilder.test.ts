import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildPublicContent } from "../../infra/publicContentBuilder.js";

const temporaryRoots: string[] = [];

function createFixture(): { contentDir: string; outputDir: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "om-public-content-"));
  temporaryRoots.push(root);
  const contentDir = path.join(root, "content");
  const outputDir = path.join(root, "public-api");
  fs.mkdirSync(path.join(contentDir, "notes", "images"), { recursive: true });
  return { contentDir, outputDir };
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

describe("buildPublicContent", () => {
  it("只输出显式 published=true 的文章，并剥离全部未声明字段", async () => {
    const { contentDir, outputDir } = createFixture();
    fs.writeFileSync(
      path.join(contentDir, "notes", "_garden.md"),
      "---\ntitle: 笔记\ndescription: 公开描述\npublished: true\n---\n公开首页\n",
    );
    fs.writeFileSync(
      path.join(contentDir, "notes", "public.md"),
      "---\ntitle: 公开文章\npublished: true\nsecret: 不得输出\ntags: [测试]\n---\n公开正文\n",
    );
    fs.writeFileSync(
      path.join(contentDir, "notes", "missing.md"),
      "---\ntitle: 缺字段\n---\n不能公开\n",
    );
    fs.writeFileSync(
      path.join(contentDir, "notes", "string.md"),
      "---\ntitle: 字符串真值\npublished: \"true\"\n---\n不能公开\n",
    );
    fs.writeFileSync(
      path.join(contentDir, "notes", "draft.md"),
      "---\ntitle: 草稿\npublished: false\n---\n不能公开\n",
    );

    const result = await buildPublicContent({ contentDir, outputDir });
    expect(result.postCount).toBe(1);

    const index = JSON.parse(fs.readFileSync(path.join(outputDir, "index.json"), "utf8"));
    expect(index.posts).toHaveLength(1);
    expect(index.posts[0]).toMatchObject({ id: "notes/public", title: "公开文章", tags: ["测试"] });
    expect(JSON.stringify(index)).not.toContain("secret");
    expect(JSON.stringify(index)).not.toContain("不能公开");

    const post = JSON.parse(fs.readFileSync(path.join(outputDir, "posts", "notes", "public.json"), "utf8"));
    expect(post.post.content).toContain("公开正文");
    expect(JSON.stringify(post)).not.toContain("不得输出");
    expect(fs.readFileSync(path.join(outputDir, "posts", "notes", "public.md"), "utf8")).toContain("公开正文");
    const garden = JSON.parse(fs.readFileSync(path.join(outputDir, "gardens", "notes.json"), "utf8"));
    expect(garden.posts).toHaveLength(1);
    expect(garden.garden.apiPath).toBe("/api/v1/gardens/notes.json");
    expect(fs.existsSync(path.join(outputDir, "posts", "notes", "draft.json"))).toBe(false);
  });

  it("只复制公开文章实际引用的白名单资源，并把链接改为公开 API 路径", async () => {
    const { contentDir, outputDir } = createFixture();
    fs.writeFileSync(path.join(contentDir, "notes", "_garden.md"), "---\ntitle: 笔记\n---\n本地首页\n");
    const onePixelPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    );
    fs.writeFileSync(path.join(contentDir, "notes", "images", "used.png"), onePixelPng);
    fs.writeFileSync(path.join(contentDir, "notes", "images", "unused.png"), onePixelPng);
    fs.writeFileSync(path.join(contentDir, "notes", "images", "secret.db"), "secret");
    fs.writeFileSync(
      path.join(contentDir, "notes", "public.md"),
      "---\ntitle: 带图文章\npublished: true\n---\n![图](images/used.png)\n[数据库](images/secret.db)\n",
    );

    const result = await buildPublicContent({ contentDir, outputDir });
    expect(result.assetCount).toBe(1);
    const generatedAssets = fs.readdirSync(path.join(outputDir, "assets"), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile());
    expect(generatedAssets).toHaveLength(1);
    expect(generatedAssets[0]?.name.endsWith(".webp")).toBe(true);

    const post = JSON.parse(fs.readFileSync(path.join(outputDir, "posts", "notes", "public.json"), "utf8"));
    expect(post.post.content).toMatch(/\/api\/v1\/assets\/[a-f0-9]{2}\/[a-f0-9]{64}\.webp/);
    expect(post.post.content).toContain("images/secret.db");

    const index = JSON.parse(fs.readFileSync(path.join(outputDir, "index.json"), "utf8"));
    expect(index.gardens[0]).toMatchObject({ title: "notes", description: null, homeContent: "" });
  });

  it("拒绝把产物写进 content，也拒绝文章通过相对路径读取 content 外文件", async () => {
    const { contentDir, outputDir } = createFixture();
    fs.writeFileSync(path.join(contentDir, "notes", "_garden.md"), "---\ntitle: 笔记\n---\n");
    fs.writeFileSync(path.join(path.dirname(contentDir), "outside.pdf"), "private");
    fs.writeFileSync(
      path.join(contentDir, "notes", "escape.md"),
      "---\ntitle: 越界\npublished: true\n---\n[越界](../../outside.pdf)\n",
    );

    await expect(buildPublicContent({ contentDir, outputDir: path.join(contentDir, "generated") }))
      .rejects.toThrow("必须与 content 完全分离");
    await expect(buildPublicContent({ contentDir, outputDir })).rejects.toThrow("引用越出 content");
  });

  it("重新生成会清除已经取消发布的旧文章产物", async () => {
    const { contentDir, outputDir } = createFixture();
    const articlePath = path.join(contentDir, "notes", "toggle.md");
    fs.writeFileSync(path.join(contentDir, "notes", "_garden.md"), "---\ntitle: 笔记\n---\n");
    fs.writeFileSync(articlePath, "---\ntitle: 状态切换\npublished: true\n---\n第一版\n");
    await buildPublicContent({ contentDir, outputDir });
    expect(fs.existsSync(path.join(outputDir, "posts", "notes", "toggle.json"))).toBe(true);

    fs.writeFileSync(articlePath, "---\ntitle: 状态切换\npublished: false\n---\n第二版\n");
    const result = await buildPublicContent({ contentDir, outputDir });
    expect(result.postCount).toBe(0);
    expect(fs.existsSync(path.join(outputDir, "posts", "notes", "toggle.json"))).toBe(false);
    expect(fs.existsSync(path.join(outputDir, "posts", "notes", "toggle.md"))).toBe(false);
  });

  it("frontmatter 损坏时安全跳过并报告，不从正文猜测发布状态", async () => {
    const { contentDir, outputDir } = createFixture();
    fs.writeFileSync(
      path.join(contentDir, "notes", "_garden.md"),
      "---\ntitle: 笔记\ndescription: 非法: 未引用冒号\npublished: true\n---\n不得公开的首页\n",
    );
    fs.writeFileSync(
      path.join(contentDir, "notes", "broken.md"),
      "---\ntitle: 损坏文章\nexcerpt: 非法: 未引用冒号\npublished: true\n---\n不得公开的正文\n",
    );
    fs.writeFileSync(
      path.join(contentDir, "notes", "healthy.md"),
      "---\ntitle: 正常文章\npublished: true\n---\n可以公开\n",
    );

    const result = await buildPublicContent({ contentDir, outputDir });
    expect(result.postCount).toBe(1);
    expect(result.warnings).toHaveLength(2);
    expect(result.warnings.join("\n")).toContain("按未发布");

    const index = JSON.parse(fs.readFileSync(path.join(outputDir, "index.json"), "utf8"));
    expect(index.gardens[0].homeContent).toBe("");
    expect(index.posts.map((post: { id: string }) => post.id)).toEqual(["notes/healthy"]);
  });
});
