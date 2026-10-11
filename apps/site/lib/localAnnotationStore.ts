/**
 * 公开站的浏览器本地批注事实源。只使用当前 origin 的 IndexedDB；不会请求站点 API，
 * 也不与本地工作台的私人 YAML 同步。浏览器清理站点数据仍会删除这里的记录。
 */
import type { LocalAnnotationAnchor } from "./localAnnotationAnchor";

// [OM-FREEPLAY] 用户只要求可划线；黄色高亮、直线和波浪线是静态站沿用阅读习惯的保守默认样式。
export type LocalAnnotationStyle = "highlight" | "underline" | "wavy";

export interface LocalAnnotation {
  id: string;
  articleId: string;
  contentHash: string;
  anchor: LocalAnnotationAnchor;
  style: LocalAnnotationStyle;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalAnnotationBackup {
  format: "oasismind.local-annotations";
  version: 1;
  exportedAt: string;
  annotations: LocalAnnotation[];
}

const DATABASE_NAME = "oasismind-public-local-annotations";
const STORE_NAME = "annotations";
const DATABASE_VERSION = 1;

// [OM-FREEPLAY] 单次导入上限避免误选巨型 JSON 把手机内存耗尽；正常纯文本批注远低于此值。
export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
const MAX_BACKUP_ANNOTATIONS = 20_000;

// [OM-FREEPLAY] 单条引文 2000 字、文字笔记 5000 字是手机编辑与备份体积的上限默认值。
const MAX_QUOTE_LENGTH = 2_000;
const MAX_COMMENT_LENGTH = 5_000;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function isIsoTime(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value;
}

function isValidAnchor(value: unknown): value is LocalAnnotationAnchor {
  if (!isObject(value) || !hasOnlyKeys(value, ["exact", "prefix", "suffix", "startOffset", "endOffset", "headingId"])) return false;
  return typeof value.exact === "string" && value.exact.trim().length > 0 && value.exact.length <= MAX_QUOTE_LENGTH
    && typeof value.prefix === "string" && value.prefix.length <= 500
    && typeof value.suffix === "string" && value.suffix.length <= 500
    && typeof value.startOffset === "number" && Number.isSafeInteger(value.startOffset) && value.startOffset >= 0
    && typeof value.endOffset === "number" && Number.isSafeInteger(value.endOffset) && value.endOffset > value.startOffset
    && value.endOffset - value.startOffset === value.exact.length
    && (value.headingId === undefined || (typeof value.headingId === "string" && value.headingId.length > 0 && value.headingId.length <= 200));
}

function isValidAnnotation(value: unknown): value is LocalAnnotation {
  if (!isObject(value) || !hasOnlyKeys(value, ["id", "articleId", "contentHash", "anchor", "style", "comment", "createdAt", "updatedAt"])) return false;
  return typeof value.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.id)
    && typeof value.articleId === "string" && value.articleId.length > 0 && value.articleId.length <= 512
    && !/[\x00-\x1f]/.test(value.articleId)
    && typeof value.contentHash === "string" && /^[0-9a-f]{64}$/i.test(value.contentHash)
    && isValidAnchor(value.anchor)
    && (value.style === "highlight" || value.style === "underline" || value.style === "wavy")
    && typeof value.comment === "string" && value.comment.length <= MAX_COMMENT_LENGTH
    && isIsoTime(value.createdAt) && isIsoTime(value.updatedAt);
}

function assertValidAnnotation(value: unknown): asserts value is LocalAnnotation {
  if (!isValidAnnotation(value)) throw new Error("批注字段无效，未写入浏览器。");
}

/** 导入前一次性验证整个文件；任意坏记录会拒绝整份备份，不部分落库。 */
export function parseLocalAnnotationBackup(json: string): LocalAnnotationBackup {
  if (new TextEncoder().encode(json).byteLength > MAX_BACKUP_BYTES) throw new Error("备份文件过大，未导入。");
  let value: unknown;
  try { value = JSON.parse(json); }
  catch { throw new Error("备份不是有效 JSON，未导入。"); }
  if (!isObject(value) || !hasOnlyKeys(value, ["format", "version", "exportedAt", "annotations"])
    || value.format !== "oasismind.local-annotations" || value.version !== 1
    || !isIsoTime(value.exportedAt) || !Array.isArray(value.annotations)
    || value.annotations.length > MAX_BACKUP_ANNOTATIONS) {
    throw new Error("不是受支持的见微本地批注备份，未导入。");
  }
  const ids = new Set<string>();
  for (const item of value.annotations) {
    if (!isValidAnnotation(item) || ids.has(item.id)) throw new Error("备份含无效或重复批注，未导入。");
    ids.add(item.id);
  }
  return value as unknown as LocalAnnotationBackup;
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("浏览器存储事务已中止"));
    transaction.onerror = () => reject(transaction.error ?? new Error("浏览器存储事务失败"));
  });
}

async function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") throw new Error("此浏览器不允许本地存储，批注未保存。请使用普通浏览窗口。");
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
      store.createIndex("articleId", "articleId", { unique: false });
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => database.close();
      resolve(database);
    };
    request.onerror = () => reject(request.error ?? new Error("无法打开浏览器批注存储"));
    request.onblocked = () => reject(new Error("批注存储正在升级，请关闭本站的其他标签页后重试。"));
  });
}

export async function listArticleAnnotations(articleId: string): Promise<LocalAnnotation[]> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const done = transactionDone(transaction);
    const request = transaction.objectStore(STORE_NAME).index("articleId").getAll(articleId) as IDBRequest<LocalAnnotation[]>;
    await done;
    return request.result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } finally { database.close(); }
}

export async function listAllAnnotations(): Promise<LocalAnnotation[]> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const done = transactionDone(transaction);
    const request = transaction.objectStore(STORE_NAME).getAll() as IDBRequest<LocalAnnotation[]>;
    await done;
    return request.result.sort((a, b) => a.articleId.localeCompare(b.articleId) || a.createdAt.localeCompare(b.createdAt));
  } finally { database.close(); }
}

export async function saveLocalAnnotation(annotation: LocalAnnotation, expectedUpdatedAt: string | null): Promise<void> {
  assertValidAnnotation(annotation);
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const done = transactionDone(transaction);
    const store = transaction.objectStore(STORE_NAME);
    let conflict = false;
    if (expectedUpdatedAt === null) store.add(annotation);
    else {
      const current = store.get(annotation.id) as IDBRequest<LocalAnnotation | undefined>;
      current.onsuccess = () => {
        if (!current.result || current.result.updatedAt !== expectedUpdatedAt) {
          conflict = true;
          transaction.abort();
          return;
        }
        store.put(annotation);
      };
    }
    try { await done; }
    catch (error) {
      if (conflict) throw new Error("这条批注已在其他标签页修改或删除；请重新打开笔记后编辑。");
      throw error;
    }
  } finally { database.close(); }
}

export async function deleteLocalAnnotation(id: string, expectedUpdatedAt: string): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const done = transactionDone(transaction);
    const store = transaction.objectStore(STORE_NAME);
    let conflict = false;
    const current = store.get(id) as IDBRequest<LocalAnnotation | undefined>;
    current.onsuccess = () => {
      if (!current.result || current.result.updatedAt !== expectedUpdatedAt) {
        conflict = true;
        transaction.abort();
        return;
      }
      store.delete(id);
    };
    try { await done; }
    catch (error) {
      if (conflict) throw new Error("这条批注已在其他标签页修改或删除；请重新打开笔记后操作。");
      throw error;
    }
  } finally { database.close(); }
}

export function serializeLocalAnnotationBackup(annotations: LocalAnnotation[]): string {
  annotations.forEach(assertValidAnnotation);
  return JSON.stringify({
    format: "oasismind.local-annotations",
    version: 1,
    exportedAt: new Date().toISOString(),
    annotations,
  } satisfies LocalAnnotationBackup, null, 2);
}

function sameAnnotation(left: LocalAnnotation, right: LocalAnnotation): boolean {
  return left.id === right.id && left.articleId === right.articleId && left.contentHash === right.contentHash
    && left.style === right.style && left.comment === right.comment
    && left.createdAt === right.createdAt && left.updatedAt === right.updatedAt
    && left.anchor.exact === right.anchor.exact && left.anchor.prefix === right.anchor.prefix
    && left.anchor.suffix === right.anchor.suffix && left.anchor.startOffset === right.anchor.startOffset
    && left.anchor.endOffset === right.anchor.endOffset && left.anchor.headingId === right.anchor.headingId;
}

/** [OM-FREEPLAY] 导入默认只增加缺失项；同 ID 不同内容时拒绝整份导入，绝不默默覆盖当前批注。 */
export async function importLocalAnnotationBackup(backup: LocalAnnotationBackup): Promise<number> {
  const existing = new Map((await listAllAnnotations()).map((item) => [item.id, item]));
  const fresh: LocalAnnotation[] = [];
  for (const item of backup.annotations) {
    const current = existing.get(item.id);
    if (current && !sameAnnotation(current, item)) throw new Error("备份与当前批注存在同 ID 不同内容的冲突，未导入任何记录。请先导出当前笔记留存两份备份。");
    if (!current) fresh.push(item);
  }
  if (fresh.length === 0) return 0;
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const done = transactionDone(transaction);
    for (const item of fresh) transaction.objectStore(STORE_NAME).add(item);
    await done;
  } finally { database.close(); }
  return fresh.length;
}
