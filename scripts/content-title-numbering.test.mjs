import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { filenameNumber, numberedContentFiles, rewriteNumberedTitle } from "./content-title-numbering.mjs";

const document = (title, newline = "\n") => Buffer.from([
  "---", title, 'excerpt: "原摘要 $x$"', "published: true", "---", "# 原标题", "$$", "x = 1", "$$", "![图](images/a.png)", "",
].join(newline));

test("从文件名读取层级或局部编号，不拿目录编号替代无编号论文", () => {
  assert.equal(filenameNumber("content/a/1.2-路线/1.2.3-主题.md"), "1.2.3");
  assert.equal(filenameNumber("01-paper-bi.md"), "01");
  for (const file of ["_garden.md", "1.2-目录/paper-bi.md", "2026-08-03-skillsmith.md", "paper.md"]) {
    assert.equal(filenameNumber(file), null);
  }
});

test("保留 YAML 引号、转义、注释、BOM、换行与标题主体，正文逐字节不变", () => {
  for (const title of ['title: "3FS 文档\\\"原文\\\"" # 注释', "title: 'Paper''s title'  # 注释", "title: 技术主题 # 注释"]) {
    for (const newline of ["\n", "\r\n"]) {
      const before = Buffer.concat([Buffer.from("\uFEFF"), document(title, newline)]);
      const result = rewriteNumberedTitle(before, "01-paper.md");
      assert.ok(result.changed);
      assert.ok(result.content.subarray(0, result.byteStart).equals(before.subarray(0, result.byteStart)));
      assert.ok(result.content.subarray(result.byteStart + result.replacement.length).equals(before.subarray(result.byteEnd)));
      const expectedTitle = title.replace(/^(title:[ \t]*["']?)/, "$101 · ");
      assert.equal(result.content.toString(), "\uFEFF" + document(expectedTitle, newline).toString());
      assert.ok(rewriteNumberedTitle(result.content, "01-paper.md").content.equals(result.content));
    }
  }
});

test("已有正确编号不变，错号替换，重复同号不叠加", () => {
  for (const title of ['title: "1.2 · 原名"', 'title: "1.2 原名"']) {
    const original = document(title);
    assert.ok(rewriteNumberedTitle(original, "1.2-topic.md").content.equals(original));
  }
  for (const title of ['title: "01 · 原名"', 'title: "01 · 01 · 原名"', 'title: "01. 原名"']) {
    assert.equal(rewriteNumberedTitle(document(title), "2-topic.md").content.toString(), document('title: "2 · 原名"').toString());
  }
});

test("保护数字专名、日期以及标题主体内的编号", () => {
  for (const subject of ["3FS 文档对照译稿", "1-bit LLM", "1.58-bit 模型", "2026 年研究", "6-训练/6.1-基础/原始路径标题", "Paper v1.2"]) {
    assert.equal(rewriteNumberedTitle(document(`title: "${subject}"`), "01-paper.md").content.toString(), document(`title: "01 · ${subject}"`).toString());
  }
  const original = document('title: "首页"');
  for (const filename of ["_garden.md", "paper-bi.md", "2026-08-03-post.md"]) {
    assert.ok(rewriteNumberedTitle(original, filename).content.equals(original));
  }
});

test("异常文件显式报错，不能猜标题或重序列化 YAML", () => {
  for (const source of ["---\ntitle: |\n  多行\n---\n正文", "---\ntitle: \"未闭合\n---\n正文", "---\ntitle: A\ntitle: B\n---\n正文", "---\nexcerpt: A\n---\n正文", "---\ntitle: \"\"\n---\n正文", "---\ntitle: \"01 · \"\n---\n正文", "正文"]) {
    assert.throws(() => rewriteNumberedTitle(Buffer.from(source), "01-topic.md"));
  }
  assert.throws(() => rewriteNumberedTitle(Buffer.from("---\ntitle: 原名\n---\n\0"), "01-topic.md"), /NUL/);
  assert.throws(() => rewriteNumberedTitle(Buffer.from([0xff]), "01-topic.md"), /UTF-8/);
});

test("真实知识库的所有编号页面与 title 一致，且 NUL 为零", () => {
  const files = numberedContentFiles();
  assert.ok(files.length > 0);
  for (const file of files) {
    const original = fs.readFileSync(file);
    assert.equal(original.includes(0), false, file);
    assert.equal(rewriteNumberedTitle(original, file).changed, false, file);
  }
});

test("content 全部 Markdown 不含 NUL", () => {
  const content = fileURLToPath(new URL("../content/", import.meta.url));
  for (const filename of fs.readdirSync(content, { recursive: true })) {
    if (!filename.endsWith(".md")) continue;
    const file = path.join(content, filename);
    assert.equal(fs.readFileSync(file).includes(0), false, file);
  }
});
