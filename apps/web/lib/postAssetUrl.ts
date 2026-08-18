import { DEFAULT_POST_GARDEN } from "@oasismind/shared";

export type PostAssetMeta = {
  slug?: string;
  garden?: string;
};

function assetSlugDir(slug: string): string {
  const file = slug.replace(/\\/g, "/");
  if (file === "_garden" || file.endsWith("/_garden")) return "";
  return file.replace(/\/[^/]+$/, "");
}

/**
 * 文章配图显示地址。Markdown 里仍写相对路径（如 images/foo.png），
 * 浏览时解析到 /api/posts/assets/{garden}/{文章目录}/…。
 * content/uploads 与 /uploads 走上传静态托管，不改写进 assets。
 */
export function resolvePostAssetUrl(src: string, meta?: PostAssetMeta): string {
  const raw = src.trim();
  if (!raw) return src;
  if (/^([a-z][a-z0-9+.-]*:|\/\/|\/)/i.test(raw)) return raw;

  const normalized = raw.replace(/\\/g, "/");
  const upload = normalized.match(/^(?:content\/)?uploads\/(.+)$/i);
  if (upload) return `/uploads/${upload[1]}`;

  const slug = meta?.slug?.replace(/\\/g, "/");
  if (!slug) return raw;

  const garden = (meta?.garden || DEFAULT_POST_GARDEN).replace(/\\/g, "/");
  const slugDir = assetSlugDir(slug);
  const base = `http://a/${slugDir ? `${slugDir}/` : ""}`;
  let pathname: string;
  try {
    pathname = decodeURI(new URL(normalized, base).pathname);
  } catch {
    return raw;
  }
  const rel = pathname.replace(/^\/+/, "");
  const parts = [garden, rel].filter(Boolean).join("/");
  return `/api/posts/assets/${parts}`;
}
