/**
 * Milkdown 图片显示：节点 attrs.src 保持 Markdown 原值（相对路径），
 * DOM 上改写成 /api/posts/assets/{garden}/…，避免写回污染源文件。
 */

import { imageSchema } from "@milkdown/preset-commonmark";
import type { Node as ProseNode } from "@milkdown/prose/model";
import type { NodeView } from "@milkdown/prose/view";
import { $view } from "@milkdown/utils";
import { resolvePostAssetUrl, type PostAssetMeta } from "@/lib/postAssetUrl";

let assetMeta: PostAssetMeta = {};

export function setMilkdownImageAssetMeta(meta: PostAssetMeta) {
  assetMeta = { garden: meta.garden, slug: meta.slug };
}

function applyImgAttrs(img: HTMLImageElement, node: ProseNode) {
  const src = typeof node.attrs.src === "string" ? node.attrs.src : "";
  img.src = resolvePostAssetUrl(src, assetMeta);
  img.alt = typeof node.attrs.alt === "string" ? node.attrs.alt : "";
  img.title = typeof node.attrs.title === "string" ? node.attrs.title : "";
}

function createImageView(node: ProseNode): NodeView {
  const img = document.createElement("img");
  applyImgAttrs(img, node);
  return {
    dom: img,
    update(updated) {
      if (updated.type !== node.type) return false;
      applyImgAttrs(img, updated);
      return true;
    },
  };
}

export const milkdownImageView = $view(imageSchema.node, () => createImageView);
