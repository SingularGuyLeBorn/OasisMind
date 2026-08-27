/**
 * 上传目录分段：按 postId / draftKey / agentId 分桶，与 slug 解耦。
 * 改文章 slug 不得改 `/uploads/...` 公共 URL。
 */
export type UploadDirLoc = {
  garden?: string;
  postId?: string;
  draftKey?: string;
  agentId?: string;
};

/** 相对 `content/uploads/` 的目录段（不含文件名）。postId 优先于草稿键。 */
export function buildUploadDirSegments(loc: UploadDirLoc): string[] {
  const segments: string[] = [];
  if (loc.garden) segments.push(loc.garden);
  if (loc.postId) {
    segments.push(loc.postId);
  } else if (loc.draftKey) {
    segments.push("_draft", loc.draftKey);
  } else if (loc.agentId) {
    segments.push("_agent", loc.agentId);
  }
  return segments;
}

export function buildUploadPublicUrl(segments: string[], fileName: string): string {
  return `/uploads/${[...segments, fileName].join("/")}`;
}
