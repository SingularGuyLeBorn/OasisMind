/**
 * 鍚屾鑴氭湰閫氱敤宸ュ叿鍑芥暟
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { load as loadYaml } from "js-yaml";
import { getAppConfig } from "../../infra/config.js";

/** 榛樿瀹夐潤锛汯P_VERBOSE_SYNC=1 鎴?OM_VERBOSE_BOOT=1 鎵撴槑缁?*/
export function isVerboseSync(): boolean {
  const v = (process.env.OM_VERBOSE_SYNC || process.env.OM_VERBOSE_BOOT || "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function syncDetail(...args: unknown[]): void {
  if (isVerboseSync()) console.log(...args);
}

export function syncDetailWarn(...args: unknown[]): void {
  if (isVerboseSync()) console.warn(...args);
}

/**
 * 瀹氫綅瀛樺偍瀛愮洰褰曪紙缁熶竴璇?AppConfig锛屾秷鐏笌 OM_*_DIR 鍙岃建锛?
 * posts/about/uploads 鈫?contentPaths锛沘gents/skills/mcp/memories/tasks/prompts/sources 鈫?configPaths锛?
 * 鍏朵綑锛堣繍琛屾椂浜х墿锛夆啋 dataPaths銆傛祴璇曢€氳繃 OM_CONTENT_DIR/OM_CONFIG_DIR/OM_DATA_DIR 闅旂銆?
 */
export function getContentDir(dirName: string): string {
  const config = getAppConfig();
  const cp = config.contentPaths as Record<string, string>;
  const gp = config.configPaths as Record<string, string>;
  const dp = config.dataPaths as Record<string, string>;
  // 鐭ヨ瘑搴撹矾寰勪紭鍏堬紙posts/knowledge/resources/about/uploads锛?
  if (cp[dirName]) return cp[dirName];
  if (gp[dirName]) return gp[dirName];
  if (dp[dirName]) return dp[dirName];
  // 鍔ㄦ€佽姳鍥細content/{id}/锛堝瓨鍦ㄥ垯鐢ㄤ箣锛夛紱閰嶇疆绫绘湭鐭ュ悕鍥為€€ config/
  const underContent = path.join(config.contentDir, dirName);
  if (fs.existsSync(underContent)) return underContent;
  return path.join(config.configDir, dirName);
}

/** 璺緞姣旇緝鍓嶇粺涓€涓烘鏂滄潬锛圵indows 鍙嶆枩鏉犱笌 POSIX 妯℃澘瀵归綈锛?*/
export function toPosixPath(p: string): string {
  return p.replace(/\\/g, "/");
}

/**
 * 閫掑綊鑾峰彇鐩綍涓嬫墍鏈夋寚瀹氭墿灞曞悕鐨勬枃浠躲€?
 * 榛樿璺宠繃锛?
 * - `_` 寮€澶寸洰褰曪紙濡?config/agents/_templates/锛學9锛?
 * - `.` 寮€澶寸洰褰曪紙濡?posts/.trash/ 鍥炴敹绔欙紝D2锛?
 * - ignoreDirs 鏄惧紡鍚嶅崟锛坕mages/public/assets/.trash锛?
 */
export function getFilesRecursive(
  dir: string,
  extensions: string[],
  ignoreDirs: string[] = ["images", "public", "assets", ".trash"],
): string[] {
  if (!fs.existsSync(dir)) return [];

  let results: string[] = [];
  const list = fs.readdirSync(dir);
  const ignoreSet = new Set(ignoreDirs);

  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // `.`/`_` 寮€澶翠笌 ignoreDirs 涓€寰嬭烦杩囷紝鍚?syncer 涓嶅啀鑷鍋氳矾寰勫瓧绗︿覆杩囨护
      if (file.startsWith(".") || file.startsWith("_") || ignoreSet.has(file)) {
        continue;
      }
      results = results.concat(getFilesRecursive(filePath, extensions, ignoreDirs));
    } else if (
      extensions.some((ext) => file.endsWith(ext)) &&
      // 璺宠繃 `_garden.md` 绛夊厓鏂囦欢锛堣姳鍥椤典簨瀹炴簮锛屼笉褰?Post锛?
      !file.startsWith("_")
    ) {
      results.push(filePath);
    }
  }

  return results;
}

/**
 * 鍓ユ帀姝ｆ枃寮€澶存畫鐣欑殑 YAML frontmatter锛坄---` 鈥?`---`锛夈€?
 * 甯歌浜?Agent post_update 鎶婃暣鏂囦欢锛堝惈澶达級濉炶繘 content锛宻erialize 鍐嶅寘涓€灞?鈫?鍙屽ご锛?
 * gray-matter 鍙悆鎺夌涓€灞傦紝绗簩灞備細杩涙鏂囪娓叉煋鎴?title/tags 鍒楄〃銆?
 */
export function stripLeadingMarkdownFrontmatter(raw: string): string {
  let text = String(raw ?? "").replace(/^\uFEFF/, "");
  for (let i = 0; i < 5 && /^\s*---\r?\n/.test(text); i++) {
    text = matter(text).content.replace(/^\uFEFF/, "");
  }
  return text.replace(/^\r?\n+/, "");
}

/** 瑙ｆ瀽 Markdown 鏂囦欢锛氳繑鍥?frontmatter 鏁版嵁 + 姝ｆ枃 */
export function parseMarkdownFile(filePath: string): { data: Record<string, any>; content: string; fileName: string } {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const fileName = path.basename(filePath);
  const { data, content } = matter(fileContent);
  return { data, content: stripLeadingMarkdownFrontmatter(content), fileName };
}

/** 瑙ｆ瀽 YAML 鏂囦欢 */
export function parseYamlFile(filePath: string): { data: Record<string, any>; fileName: string } {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const fileName = path.basename(filePath);
  const data = loadYaml(fileContent) as Record<string, any> || {};
  return { data, fileName };
}

/** 浠庢枃浠惰矾寰勭敓鎴?slug锛堢浉瀵硅矾寰勩€佹鏂滄潬銆佸幓鎵╁睍鍚嶏級 */
export function filePathToSlug(contentDir: string, filePath: string): string {
  const relativePath = path.relative(contentDir, filePath);
  return toPosixPath(relativePath).replace(/\.[^/.]+$/, "");
}

/** 瀹夊叏璇诲彇瀛楃涓叉暟缁勶紙鏀寔 YAML 鏁扮粍鎴栭€楀彿鍒嗛殧瀛楃涓诧級 */
export function readStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string").map((v) => v.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((v) => v.trim()).filter(Boolean);
  }
  return [];
}

/** 瀹夊叏璇诲彇甯冨皵鍊?*/
export function readBoolean(value: unknown, defaultValue = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return defaultValue;
}

/** 鑾峰彇鏂囦欢鏈€鍚庝慨鏀规椂闂?*/
export function getFileMtime(filePath: string): Date {
  return fs.statSync(filePath).mtime;
}

/** 瀹夊叏璇诲彇鏁板瓧 */
export function readNumber(value: unknown, defaultValue: number): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : defaultValue;
}
