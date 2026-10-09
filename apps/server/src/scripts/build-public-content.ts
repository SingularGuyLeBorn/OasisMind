/** 为公开站生成只读内容投影；本脚本只写 apps/site/public/api/v1，不改动 content。 */
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPublicContent } from "../infra/publicContentBuilder.js";
import { verifyPublicContentProjection } from "../infra/publicContentVerifier.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const contentDir = process.env.OM_CONTENT_DIR
  ? path.resolve(process.env.OM_CONTENT_DIR)
  : path.join(projectRoot, "content");
const outputDir = process.env.OM_PUBLIC_CONTENT_DIR
  ? path.resolve(process.env.OM_PUBLIC_CONTENT_DIR)
  : path.join(projectRoot, "apps", "site", "public", "api", "v1");

const result = await buildPublicContent({
  contentDir,
  outputDir,
  publicBasePath: process.env.NEXT_PUBLIC_SITE_BASE_PATH,
});
const verification = verifyPublicContentProjection(contentDir, outputDir);
console.log(
  `公开内容生成完成：${result.gardenCount} 个花园，${result.postCount} 篇文章，${result.assetCount} 个本地资源。`,
);
console.log(`公开产物验证通过：${verification.fileCount} 个文件均来自只读白名单，无草稿或额外文件。`);
for (const warning of result.warnings) console.warn(`  警告：${warning}`);
