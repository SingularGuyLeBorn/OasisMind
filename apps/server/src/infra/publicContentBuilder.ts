/**
 * 公开内容生成器
 *
 * 本地知识库是完整事实源，公开站只能消费本模块生成的“最小公开投影”。
 * 这个边界刻意不依赖数据库：云端构建时只需仓库中的 Markdown，并且不会因为
 * 本地 SQLite 状态陈旧而错误公开草稿。
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

const PUBLIC_SCHEMA_VERSION = 1;
const GARDEN_META_FILE = "_garden.md";

/**
 * 公开站允许随文章发布的附件类型。
 * 列表采用 allowlist，未知格式保持在本地，避免把数据库、密钥或可执行文件顺带复制出去。
 */
const PUBLIC_ASSET_EXTENSIONS = new Set([
  ".avif", ".bmp", ".gif", ".ico", ".jpeg", ".jpg", ".png", ".svg", ".webp",
  ".m4v", ".mov", ".mp4", ".webm",
  ".flac", ".m4a", ".mp3", ".ogg", ".wav",
  ".csv", ".docx", ".epub", ".json", ".pdf", ".pptx", ".txt", ".xlsx", ".zip",
]);

const SKIPPED_DIRECTORY_NAMES = new Set([".trash", "assets", "images", "public"]);
const OPTIMIZED_IMAGE_EXTENSIONS = new Set([".bmp", ".jpeg", ".jpg", ".png"]);

// [OM-FREEPLAY] 用户要求公开站可部署但未指定图片参数；2400px / WebP 82 在论文截图可读性与托管体积间取保守平衡。
const PUBLIC_IMAGE_MAX_WIDTH = 2_400;
const PUBLIC_IMAGE_WEBP_QUALITY = 82;
// [OM-FREEPLAY] 限制并发可避免数千张图片同时解码耗尽构建机内存。
const IMAGE_BUILD_CONCURRENCY = 4;

export interface PublicGarden {
  id: string;
  title: string;
  description: string | null;
  /** 花园首页本身也必须显式发布；未发布时只保留安全的导航壳。 */
  homeContent: string;
  postCount: number;
}

export interface PublicPostSummary {
  id: string;
  garden: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string | null;
  tags: string[];
  apiPath: string;
}

export interface PublicPost extends PublicPostSummary {
  content: string;
  contentHash: string;
}

export interface PublicContentManifest {
  schemaVersion: number;
  gardens: PublicGarden[];
  posts: PublicPostSummary[];
}

export interface PublicSearchEntry extends PublicPostSummary {
  /** 去掉 Markdown 标记后的短文本，仅用于客户端搜索，不承载全文。 */
  searchText: string;
}

export interface PublicContentBuildOptions {
  contentDir: string;
  outputDir: string;
}

export interface PublicContentBuildResult {
  gardenCount: number;
  postCount: number;
  assetCount: number;
  warnings: string[];
}

interface DiscoveredGarden {
  id: string;
  directory: string;
  title: string;
  description: string | null;
  homeContent: string;
}

interface ResolvedAsset {
  sourcePath: string;
  contentRelativePath: string;
  outputRelativePath: string;
  optimizeAsWebp: boolean;
  publicUrl: string;
}

/** 路径比较统一追加分隔符，避免 `content-old` 被误判为 `content` 的子目录。 */
function isPathInside(parent: string, candidate: string): boolean {
  const relative = path.relative(parent, candidate);
  return relative !== "" && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

function assertSeparatedRoots(contentDir: string, outputDir: string): void {
  const content = path.resolve(contentDir);
  const output = path.resolve(outputDir);
  if (content === output || isPathInside(content, output) || isPathInside(output, content)) {
    throw new Error(`公开产物目录必须与 content 完全分离：content=${content} output=${output}`);
  }
}

function toPosixPath(value: string): string {
  return value.replace(/\\/g, "/");
}

function encodePublicPath(relativePath: string): string {
  return toPosixPath(relativePath)
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function createExcerpt(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~|\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function createSearchText(post: PublicPost): string {
  return `${post.title} ${post.excerpt} ${post.category ?? ""} ${post.tags.join(" ")} ${createExcerpt(post.content)}`
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 800);
}

function collectMarkdownFiles(directory: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(directory)) return files;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      // 图片和附件目录由引用解析器按需复制，不能被误当作文章目录递归扫描。
      if (!SKIPPED_DIRECTORY_NAMES.has(entry.name)) files.push(...collectMarkdownFiles(absolutePath));
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) files.push(absolutePath);
  }
  return files.sort((left, right) => left.localeCompare(right, "zh-CN"));
}

function discoverGardens(contentDir: string, warnings: string[]): DiscoveredGarden[] {
  const gardens: DiscoveredGarden[] = [];
  for (const entry of fs.readdirSync(contentDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    if (entry.name === "about" || entry.name === "uploads" || entry.name === "resources") continue;

    const directory = path.join(contentDir, entry.name);
    const metaPath = path.join(directory, GARDEN_META_FILE);
    let title = entry.name;
    let description: string | null = null;
    let homeContent = "";

    if (fs.existsSync(metaPath)) {
      try {
        const parsed = matter(fs.readFileSync(metaPath, "utf8"));
        // 花园的标题、简介和首页是同一个公开单元；未显式发布时只暴露目录 id 作为导航壳。
        if (parsed.data.published === true) {
          title = readString(parsed.data.title) ?? entry.name;
          description = readString(parsed.data.description);
          homeContent = parsed.content.replace(/^\uFEFF/, "");
        }
      } catch (error) {
        // 解析失败时不尝试正则提取正文，以免绕开 YAML 发布开关。
        const message = error instanceof Error ? error.message : String(error);
        warnings.push(`花园元数据无效，首页按未发布处理：${entry.name}/${GARDEN_META_FILE}（${message}）`);
      }
    }

    gardens.push({ id: entry.name, directory, title, description, homeContent });
  }
  return gardens.sort((left, right) => left.id.localeCompare(right.id));
}

function splitReferenceSuffix(reference: string): { pathname: string; suffix: string } {
  const markerIndex = reference.search(/[?#]/);
  if (markerIndex < 0) return { pathname: reference, suffix: "" };
  return { pathname: reference.slice(0, markerIndex), suffix: reference.slice(markerIndex) };
}

function resolveLocalAsset(
  reference: string,
  articlePath: string,
  contentDir: string,
): ResolvedAsset | null {
  const unwrapped = reference.trim().replace(/^<|>$/g, "");
  if (!unwrapped || unwrapped.startsWith("#") || /^(?:[a-z]+:|\/\/)/i.test(unwrapped)) return null;

  const { pathname: referencePath, suffix } = splitReferenceSuffix(decodeURI(unwrapped));
  let sourcePath: string;
  if (referencePath.startsWith("/api/posts/assets/")) {
    sourcePath = path.resolve(contentDir, referencePath.slice("/api/posts/assets/".length));
  } else if (referencePath.startsWith("/content/")) {
    sourcePath = path.resolve(contentDir, referencePath.slice("/content/".length));
  } else if (referencePath.startsWith("/")) {
    return null;
  } else {
    sourcePath = path.resolve(path.dirname(articlePath), referencePath);
  }

  // Markdown 文章链接由站点路由处理，不属于附件复制范围；先过滤类型，避免把普通跨库链接误报为泄露。
  const extension = path.extname(sourcePath).toLowerCase();
  if (!PUBLIC_ASSET_EXTENSIONS.has(extension)) return null;

  const contentRoot = path.resolve(contentDir);
  if (!isPathInside(contentRoot, sourcePath)) {
    throw new Error(`公开文章引用越出 content：${articlePath} -> ${reference}`);
  }
  if (!fs.existsSync(sourcePath)) return null;

  // realpath 能识别父目录中的符号链接；任何指向 content 外部的链接都不得进入公开产物。
  const realContentRoot = fs.realpathSync(contentRoot);
  const realSourcePath = fs.realpathSync(sourcePath);
  if (!isPathInside(realContentRoot, realSourcePath)) {
    throw new Error(`公开资源符号链接越出 content：${articlePath} -> ${reference}`);
  }
  if (!fs.statSync(realSourcePath).isFile()) return null;

  const contentRelativePath = toPosixPath(path.relative(contentRoot, sourcePath));
  const sourceHash = createHash("sha256").update(fs.readFileSync(realSourcePath)).digest("hex");
  const optimizeAsWebp = OPTIMIZED_IMAGE_EXTENSIONS.has(extension);
  const outputExtension = optimizeAsWebp ? ".webp" : extension;
  // 内容寻址同时去重不同花园里的重复图片，并让浏览器长期缓存不受文章改名影响。
  const outputRelativePath = `${sourceHash.slice(0, 2)}/${sourceHash}${outputExtension}`;
  return {
    sourcePath: realSourcePath,
    contentRelativePath,
    outputRelativePath,
    optimizeAsWebp,
    publicUrl: `/api/v1/assets/${encodePublicPath(outputRelativePath)}${suffix}`,
  };
}

/**
 * 改写 Markdown 中的本地资源引用，并登记需要复制的文件。
 * 这里只解析常见 Markdown 与 HTML 属性；无法确认的写法保持原文并产生构建警告。
 */
function rewriteAssetReferences(
  content: string,
  articlePath: string,
  contentDir: string,
  assets: Map<string, ResolvedAsset>,
  warnings: string[],
): string {
  const rewrite = (reference: string): string => {
    try {
      const resolved = resolveLocalAsset(reference, articlePath, contentDir);
      if (!resolved) {
        const { pathname: candidate } = splitReferenceSuffix(reference.trim().replace(/^<|>$/g, ""));
        if (candidate && !candidate.startsWith("#") && !/^(?:[a-z]+:|\/\/|\/)/i.test(candidate)) {
          const extension = path.extname(candidate).toLowerCase();
          if (PUBLIC_ASSET_EXTENSIONS.has(extension)) {
            warnings.push(`资源不存在或不可公开：${toPosixPath(path.relative(contentDir, articlePath))} -> ${reference}`);
          }
        }
        return reference;
      }
      assets.set(resolved.contentRelativePath, resolved);
      return resolved.publicUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`公开资源解析失败：${message}`);
    }
  };

  let rewritten = content.replace(
    /(!?\[[^\]]*\]\(\s*)(<?[^\s)>]+>?)([^)]*\))/g,
    (_match, prefix: string, reference: string, suffix: string) => `${prefix}${rewrite(reference)}${suffix}`,
  );
  rewritten = rewritten.replace(
    /(<(?:img|video|audio|source|a)\b[^>]*?\s(?:src|href)=["'])([^"']+)(["'][^>]*>)/gi,
    (_match, prefix: string, reference: string, suffix: string) => `${prefix}${rewrite(reference)}${suffix}`,
  );
  rewritten = rewritten.replace(
    /(^[ \t]{0,3}\[[^\]]+\]:[ \t]*)(<?\S+>?)/gm,
    (_match, prefix: string, reference: string) => `${prefix}${rewrite(reference)}`,
  );
  return rewritten;
}

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function buildAssets(temporaryDir: string, assets: Iterable<ResolvedAsset>): Promise<number> {
  const uniqueAssets = Array.from(
    new Map(Array.from(assets, (asset) => [asset.outputRelativePath, asset])).values(),
  );
  let cursor = 0;

  const worker = async (): Promise<void> => {
    while (cursor < uniqueAssets.length) {
      const asset = uniqueAssets[cursor++];
      if (!asset) continue;
      const target = path.join(temporaryDir, "assets", asset.outputRelativePath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      if (asset.optimizeAsWebp) {
        await sharp(asset.sourcePath)
          .rotate()
          .resize({ width: PUBLIC_IMAGE_MAX_WIDTH, withoutEnlargement: true })
          .webp({ quality: PUBLIC_IMAGE_WEBP_QUALITY, effort: 4 })
          .toFile(target);
      } else {
        fs.copyFileSync(asset.sourcePath, target);
      }
    }
  };

  await Promise.all(Array.from({ length: IMAGE_BUILD_CONCURRENCY }, () => worker()));
  return uniqueAssets.length;
}

/**
 * 从完整知识库生成可部署目录。
 *
 * 不变量：只有 frontmatter 中严格等于布尔值 true 的普通文章会进入结果；生成目录每次整体重建，
 * 因而文章取消发布后不会留下旧 JSON 或附件。
 */
export async function buildPublicContent(options: PublicContentBuildOptions): Promise<PublicContentBuildResult> {
  const contentDir = path.resolve(options.contentDir);
  const outputDir = path.resolve(options.outputDir);
  if (!fs.existsSync(contentDir) || !fs.statSync(contentDir).isDirectory()) {
    throw new Error(`content 目录不存在：${contentDir}`);
  }
  assertSeparatedRoots(contentDir, outputDir);

  const temporaryDir = `${outputDir}.tmp-${process.pid}`;
  fs.rmSync(temporaryDir, { recursive: true, force: true });
  fs.mkdirSync(temporaryDir, { recursive: true });

  const posts: PublicPost[] = [];
  const publicGardens: PublicGarden[] = [];
  const assets = new Map<string, ResolvedAsset>();
  const warnings: string[] = [];

  try {
    for (const garden of discoverGardens(contentDir, warnings)) {
      const gardenPosts: PublicPost[] = [];
      for (const articlePath of collectMarkdownFiles(garden.directory)) {
        let parsed: matter.GrayMatterFile<string>;
        try {
          parsed = matter(fs.readFileSync(articlePath, "utf8"));
        } catch (error) {
          // 无法可靠解析 frontmatter 就无法证明 published 为布尔 true，因此必须跳过。
          const message = error instanceof Error ? error.message : String(error);
          warnings.push(
            `文章 frontmatter 无效，已按未发布跳过：${toPosixPath(path.relative(contentDir, articlePath))}（${message}）`,
          );
          continue;
        }
        if (parsed.data.published !== true) continue;

        const relativeMarkdownPath = toPosixPath(path.relative(garden.directory, articlePath));
        const slug = relativeMarkdownPath.replace(/\.md$/i, "");
        const title = readString(parsed.data.title) ?? path.basename(slug);
        const rewrittenContent = rewriteAssetReferences(
          parsed.content.replace(/^\uFEFF/, ""),
          articlePath,
          contentDir,
          assets,
          warnings,
        );
        const id = `${garden.id}/${slug}`;
        const apiPath = `/api/v1/posts/${encodePublicPath(id)}.json`;
        const post: PublicPost = {
          id,
          garden: garden.id,
          slug,
          title,
          excerpt: readString(parsed.data.excerpt) ?? createExcerpt(rewrittenContent),
          category: readString(parsed.data.category),
          tags: readTags(parsed.data.tags),
          apiPath,
          content: rewrittenContent,
          contentHash: createHash("sha256").update(rewrittenContent).digest("hex"),
        };
        gardenPosts.push(post);
        posts.push(post);
      }

      if (gardenPosts.length > 0) {
        publicGardens.push({
          id: garden.id,
          title: garden.title,
          description: garden.description,
          homeContent: garden.homeContent,
          postCount: gardenPosts.length,
        });
      }
    }

    posts.sort((left, right) => left.id.localeCompare(right.id, "zh-CN"));
    const summaries = posts.map(({ content: _content, contentHash: _hash, ...summary }) => summary);
    const manifest: PublicContentManifest = {
      schemaVersion: PUBLIC_SCHEMA_VERSION,
      gardens: publicGardens,
      posts: summaries,
    };
    const searchEntries: PublicSearchEntry[] = posts.map((post) => ({
      ...summaries.find((summary) => summary.id === post.id)!,
      searchText: createSearchText(post),
    }));

    writeJson(path.join(temporaryDir, "index.json"), manifest);
    writeJson(path.join(temporaryDir, "search.json"), {
      schemaVersion: PUBLIC_SCHEMA_VERSION,
      posts: searchEntries,
    });
    for (const post of posts) {
      writeJson(path.join(temporaryDir, "posts", post.garden, `${post.slug}.json`), {
        schemaVersion: PUBLIC_SCHEMA_VERSION,
        post,
      });
    }
    await buildAssets(temporaryDir, assets.values());

    // 先完整写入临时目录，再替换旧产物。构建中断时不会留下“半新半旧”的公开集合。
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.renameSync(temporaryDir, outputDir);
  } catch (error) {
    fs.rmSync(temporaryDir, { recursive: true, force: true });
    throw error;
  }

  return {
    gardenCount: publicGardens.length,
    postCount: posts.length,
    assetCount: new Set(Array.from(assets.values(), (asset) => asset.outputRelativePath)).size,
    warnings,
  };
}
