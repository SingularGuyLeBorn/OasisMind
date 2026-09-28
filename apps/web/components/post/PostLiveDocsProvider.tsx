"use client";

/**
 * 保活文章渲染层：挂在 posts 布局（布局跨路由存活），把缓存的文章实例渲染在
 * 页面树里，activeId 命中的可见、其余 hidden。详情页只负责 activate/deactivate，
 * 自身不再渲染 PostLiveDoc。
 */

import { useSyncExternalStore, type ReactNode } from "react";
import { PostLiveDoc } from "@/components/post/PostLiveDoc";
import {
  getLiveDocsServerSnapshot,
  getLiveDocsSnapshot,
  subscribeLiveDocs,
} from "@/lib/postLiveDocsStore";

export function PostLiveDocsProvider({ children }: { children: ReactNode }) {
  const { docs, activeId } = useSyncExternalStore(
    subscribeLiveDocs,
    getLiveDocsSnapshot,
    getLiveDocsServerSnapshot,
  );

  return (
    <>
      {children}
      {docs.map((p) => (
        <div key={p.id} hidden={p.id !== activeId}>
          <PostLiveDoc post={p} active={p.id === activeId} />
        </div>
      ))}
    </>
  );
}
