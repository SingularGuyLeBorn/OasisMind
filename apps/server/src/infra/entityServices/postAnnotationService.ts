/**
 * 文章私人批注服务
 *
 * 批注是用户知识资产，不把 SQLite 当事实源。每条批注独立保存为
 * content/.private/annotations/{文章哈希}/{批注 id}.yaml：数据库重建不丢，公开生成器也不会扫描点目录。
 * Service 只接受已鉴权路由传入的文章 id，并校验路径隔离；文章不存在、YAML 损坏或原子替换失败
 * 都返回明确错误，不静默丢批注，也不把私人内容写入文章正文。
 */
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { dump, load } from "js-yaml";
import type { PrismaClient } from "@prisma/client";
import type { PostAnnotation, PostAnnotationAnchor } from "@oasismind/shared";
import type { AppConfig } from "../config.js";

interface AnnotationLocator {
  garden: string;
  slug: string;
}

interface CreateAnnotationInput extends AnnotationLocator {
  anchor: PostAnnotationAnchor;
  style: PostAnnotation["style"];
  comment: string;
}

interface UpdateAnnotationInput extends AnnotationLocator {
  id: string;
  style?: PostAnnotation["style"];
  comment?: string;
}

interface DeleteAnnotationInput extends AnnotationLocator {
  id: string;
}

function articleKey(locator: AnnotationLocator): string {
  return `${locator.garden}/${locator.slug}`;
}

function articleHash(locator: AnnotationLocator): string {
  return createHash("sha256").update(articleKey(locator)).digest("hex");
}

function isAnnotation(value: unknown): value is PostAnnotation {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  const anchor = row.anchor;
  return (
    typeof row.id === "string" &&
    typeof row.garden === "string" &&
    typeof row.slug === "string" &&
    typeof row.comment === "string" &&
    (row.style === "highlight" || row.style === "underline" || row.style === "wavy") &&
    typeof row.createdAt === "string" &&
    typeof row.updatedAt === "string" &&
    !!anchor &&
    typeof anchor === "object" &&
    !Array.isArray(anchor) &&
    typeof (anchor as Record<string, unknown>).exact === "string" &&
    typeof (anchor as Record<string, unknown>).prefix === "string" &&
    typeof (anchor as Record<string, unknown>).suffix === "string" &&
    typeof (anchor as Record<string, unknown>).startOffset === "number" &&
    typeof (anchor as Record<string, unknown>).endOffset === "number"
  );
}

export class PostAnnotationService {
  private readonly rootDir: string;

  constructor(
    private readonly prisma: PrismaClient,
    config: Pick<AppConfig, "contentDir">,
  ) {
    this.rootDir = path.join(config.contentDir, ".private", "annotations");
  }

  private articleDir(locator: AnnotationLocator): string {
    return path.join(this.rootDir, articleHash(locator));
  }

  private annotationPath(locator: AnnotationLocator, id: string): string {
    // id 已由共享 schema 校验为 UUID；basename 再收一道口，避免未来调用方绕过路由造成路径穿越。
    return path.join(this.articleDir(locator), `${path.basename(id)}.yaml`);
  }

  private readOne(locator: AnnotationLocator, id: string): PostAnnotation | null {
    const filePath = this.annotationPath(locator, id);
    const backupPath = `${filePath}.bak`;
    // 上次进程若恰好在“旧文件改名、新文件就位”之间退出，先恢复仍完整的备份。
    if (!fs.existsSync(filePath) && fs.existsSync(backupPath)) fs.renameSync(backupPath, filePath);
    if (!fs.existsSync(filePath)) return null;
    try {
      const parsed = load(fs.readFileSync(filePath, "utf8"));
      if (!isAnnotation(parsed)) throw new Error("字段不完整或类型错误");
      if (parsed.garden !== locator.garden || parsed.slug !== locator.slug) {
        throw new Error("批注归属与目录哈希不一致");
      }
      return parsed;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`读取私人批注失败：${filePath}（${message}）`);
    }
  }

  private writeOne(annotation: PostAnnotation): void {
    const locator = { garden: annotation.garden, slug: annotation.slug };
    const target = this.annotationPath(locator, annotation.id);
    const backup = `${target}.bak`;
    const temporary = `${target}.tmp-${process.pid}-${randomUUID()}`;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(
      temporary,
      dump(annotation, { noRefs: true, lineWidth: 120, sortKeys: false }),
      { encoding: "utf8", flag: "wx" },
    );
    try {
      // Windows 不保证 rename 覆盖已有文件：先保留完整旧版，再把完整临时文件原子改名到目标。
      if (fs.existsSync(target)) {
        fs.rmSync(backup, { force: true });
        fs.renameSync(target, backup);
      }
      fs.renameSync(temporary, target);
      fs.rmSync(backup, { force: true });
    } catch (error) {
      if (!fs.existsSync(target) && fs.existsSync(backup)) fs.renameSync(backup, target);
      throw error;
    } finally {
      fs.rmSync(temporary, { force: true });
    }
  }

  async list(locator: AnnotationLocator): Promise<PostAnnotation[]> {
    const directory = this.articleDir(locator);
    if (!fs.existsSync(directory)) return [];
    const rows: PostAnnotation[] = [];
    const ids = new Set<string>();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (entry.name.endsWith(".yaml")) ids.add(entry.name.slice(0, -".yaml".length));
      // 进程可能在“旧文件改为备份”后退出；列表阶段也必须发现并恢复这类文件。
      if (entry.name.endsWith(".yaml.bak")) ids.add(entry.name.slice(0, -".yaml.bak".length));
    }
    for (const id of ids) {
      const annotation = this.readOne(locator, id);
      if (annotation) rows.push(annotation);
    }
    return rows.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  async create(input: CreateAnnotationInput): Promise<PostAnnotation> {
    const post = await this.prisma.post.findFirst({
      where: { garden: input.garden, slug: input.slug, deletedAt: null },
      select: { id: true },
    });
    if (!post) throw new Error(`文章不存在，无法添加批注：${articleKey(input)}`);

    const now = new Date().toISOString();
    const annotation: PostAnnotation = {
      id: randomUUID(),
      garden: input.garden,
      slug: input.slug,
      anchor: input.anchor,
      style: input.style,
      comment: input.comment,
      createdAt: now,
      updatedAt: now,
    };
    this.writeOne(annotation);
    return annotation;
  }

  async update(input: UpdateAnnotationInput): Promise<PostAnnotation> {
    const current = this.readOne(input, input.id);
    if (!current) throw new Error(`私人批注不存在：${input.id}`);
    const next: PostAnnotation = {
      ...current,
      ...(input.style ? { style: input.style } : {}),
      ...(input.comment !== undefined ? { comment: input.comment } : {}),
      updatedAt: new Date().toISOString(),
    };
    this.writeOne(next);
    return next;
  }

  async delete(input: DeleteAnnotationInput): Promise<{ id: string }> {
    const current = this.readOne(input, input.id);
    if (!current) throw new Error(`私人批注不存在：${input.id}`);
    fs.rmSync(this.annotationPath(input, input.id), { force: true });
    const directory = this.articleDir(input);
    if (fs.existsSync(directory) && fs.readdirSync(directory).length === 0) fs.rmdirSync(directory);
    return { id: input.id };
  }
}
