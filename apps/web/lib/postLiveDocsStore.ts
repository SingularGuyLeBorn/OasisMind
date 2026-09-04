"use client";

/**
 * 已打开文章的跨路由保活 store（外部 store，非组件 state）。
 *
 * 为什么不在 [slug] 页面组件里：App Router 的 page 在任何路由跳转（含 /posts/a → /posts/b）
 * 都会卸载重建，组件内 useState 的保活缓存活不过导航。store 挂在模块级、由 posts 布局的
 * Provider 订阅渲染，布局不换就不卸载——列表 ↔ 文章、文章 ↔ 文章都受益。
 */

import type { PostLiveDocModel } from "@/components/post/PostLiveDoc";

/**
 * 保活上限（LRU）。
 * [OM-FREEPLAY] 3 是经验值——用户明确接受用内存换切换速度；再大内存收益比下降。
 */
const KEEP_ALIVE_LIMIT = 3;

export interface LiveDocsSnapshot {
  /** LRU 顺序：最新激活的在前 */
  docs: PostLiveDocModel[];
  /** 当前应可见的文章 id；null = 全部隐藏（如列表页、NotFound） */
  activeId: string | null;
}

let snapshot: LiveDocsSnapshot = { docs: [], activeId: null };
const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

export function subscribeLiveDocs(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getLiveDocsSnapshot(): LiveDocsSnapshot {
  return snapshot;
}

const SERVER_SNAPSHOT: LiveDocsSnapshot = { docs: [], activeId: null };
export function getLiveDocsServerSnapshot(): LiveDocsSnapshot {
  return SERVER_SNAPSHOT;
}

/** 激活一篇文章：入缓存（LRU 去重+截断）并置为可见 */
export function activateLiveDoc(post: PostLiveDocModel): void {
  const rest = snapshot.docs.filter((p) => p.id !== post.id);
  snapshot = { docs: [post, ...rest].slice(0, KEEP_ALIVE_LIMIT), activeId: post.id };
  emit();
}

/** 摘掉可见态（文章全部隐藏，实例保留在缓存里） */
export function deactivateLiveDocs(): void {
  if (snapshot.activeId === null) return;
  snapshot = { ...snapshot, activeId: null };
  emit();
}
