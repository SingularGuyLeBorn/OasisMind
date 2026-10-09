/** 发布时完成安全清洗、公式排版与高亮。HTML 缓存在忽略目录，Next 仅负责页面与路由。 */
import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { getManifest, getPost } from "../lib/publicContent";
import { preparePublicMarkdown } from "../lib/markdownDocument";
import { parseAboutProfile } from "@oasismind/shared";

const output = path.join(process.cwd(), ".reading");
const manifest = getManifest();
function compile(relative: string, content: string) {
  const file = path.join(output, relative);
  const document = preparePublicMarkdown(content);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ html: renderToStaticMarkup(document.body), headings: document.headings }));
}
for (const summary of manifest.posts) {
  const post = getPost(summary.garden, summary.slug);
  if (!post) throw new Error(`发布清单中的文章丢失：${summary.id}`);
  compile(`posts/${summary.garden}/${summary.slug}.json`, post.content);
}
for (const garden of manifest.gardens) compile(`gardens/${garden.id}.json`, garden.homeContent ?? "");
// 用户要求公开版“关于我”复用本地资料。只读取这一份指定资料，不读取问答草稿或其它 about 文件。
const aboutSource = path.resolve(process.cwd(), "../../content/about/profile.md");
const about = parseAboutProfile(fs.readFileSync(aboutSource, "utf8"));
const publicProfile = { name: about.name, title: about.title, tagline: about.tagline, oneLiner: about.oneLiner,
  github: about.github, roles: about.roles, focus: about.focus, projects: about.projects };
const document = preparePublicMarkdown(about.bodyMarkdown);
fs.mkdirSync(path.join(output, "pages"), { recursive: true });
fs.writeFileSync(path.join(output, "pages/about.json"), JSON.stringify({
  html: renderToStaticMarkup(document.body), headings: document.headings, profile: publicProfile,
}));
console.log(`阅读正文编译完成：${manifest.posts.length} 篇文章、${manifest.gardens.length} 个知识库首页。`);
