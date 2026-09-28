import type { ReactNode } from "react";
import { PostLiveDocsProvider } from "@/components/post/PostLiveDocsProvider";

/** posts 段布局：保活层挂这里，/posts 列表 ↔ 文章 ↔ 文章导航都不卸载缓存实例 */
export default function PostsLayout({ children }: { children: ReactNode }) {
  return <PostLiveDocsProvider>{children}</PostLiveDocsProvider>;
}
