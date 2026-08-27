import { postDetailHref } from "./postHref";

/**
 * 相关笔记展示态：loading / error / empty / list。空列表必须可见空态，禁止静默 return null。
 */
export type RelatedPostCard = {
  id: string;
  slug: string;
  garden: string;
  title: string;
  excerpt?: string | null;
  score: number;
  category?: string | null;
  tags: string[];
  reasons: string[];
};

export type RelatedPostsViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "empty" }
  | { kind: "list"; items: RelatedPostCard[] };

export function relatedPostsViewState(input: {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  items?: RelatedPostCard[] | null;
}): RelatedPostsViewState {
  if (input.isLoading) return { kind: "loading" };
  if (input.isError) return { kind: "error", message: input.errorMessage || "加载失败" };
  if (!input.items?.length) return { kind: "empty" };
  return { kind: "list", items: input.items };
}

/** 相关笔记链接必须走文章详情单源，禁止手写 /posts/... 以免死链。 */
export function relatedPostHref(item: Pick<RelatedPostCard, "slug" | "garden">): string {
  return postDetailHref(item.slug, item.garden);
}
