/**
 * 鍙戠幇 content/ 涓嬬殑鑺卞洯 id锛堜緵 sync-posts / sync-gardens / ensure 鍏辩敤锛?
 */
import fs from "fs";
import path from "path";
import {
  isReservedContentDir,
  isValidGardenIdFormat,
  SEED_GARDENS,
} from "@oasismind/shared";

export const GARDEN_META_FILE = "_garden.md";

export function discoverGardenIds(contentRoot: string): string[] {
  if (!fs.existsSync(contentRoot)) return [];
  const ids = new Set<string>();
  const idsByCaseFold = new Map<string, string>();
  for (const ent of fs.readdirSync(contentRoot, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const id = ent.name;
    if (!isValidGardenIdFormat(id) || isReservedContentDir(id)) continue;
    const meta = path.join(contentRoot, id, GARDEN_META_FILE);
    if (!fs.existsSync(meta)) continue;
    const caseFold = id.toLowerCase();
    const existing = idsByCaseFold.get(caseFold);
    if (existing && existing !== id) {
      throw new Error(
        `知识库目录大小写冲突：content/${existing} 与 content/${id}。` +
          "Garden id 保留正式大小写，但不同知识库不能只靠大小写区分。",
      );
    }
    idsByCaseFold.set(caseFold, id);
    ids.add(id);
  }
  for (const seed of SEED_GARDENS) {
    const dir = path.join(contentRoot, seed);
    if (fs.existsSync(dir)) ids.add(seed);
  }
  return Array.from(ids).sort();
}
