/** 目录结构由文章路径生成；工作台和公开站共用，权限及路由由各自适配器提供。 */
export interface ReadingPost {
  id: string;
  slug: string;
  title: string;
  garden?: string;
  published?: boolean;
}

export interface ReadingTreeNode {
  id: string;
  key: string;
  title: string;
  slug?: string;
  garden?: string;
  published?: boolean;
  type: "doc" | "group";
  children: ReadingTreeNode[];
}

interface Branch {
  post?: ReadingPost;
  children: Map<string, Branch>;
}

export function buildReadingTree(posts: ReadingPost[], options: {
  gardenLabels?: Record<string, string>;
  isPinned?: (garden: string, slug: string) => boolean;
} = {}): ReadingTreeNode[] {
  const root = new Map<string, Branch>();
  const multiGarden = new Set(posts.map((post) => post.garden ?? "posts")).size > 1;
  for (const post of posts) {
    const garden = post.garden ?? "posts";
    // 分组用原始 garden id，显示名相同也不会把两个库合并。
    const parts = multiGarden ? [garden, ...post.slug.split("/")] : post.slug.split("/");
    let map = root;
    let parent: Branch | undefined;
    for (let index = 0; index < parts.length; index++) {
      const part = parts[index];
      if (index === parts.length - 1 && parent && (part === "index" || part === parts[index - 1])) {
        parent.post = post;
        break;
      }
      let branch = map.get(part);
      if (!branch) {
        branch = { children: new Map() };
        map.set(part, branch);
      }
      if (index === parts.length - 1) branch.post = post;
      parent = branch;
      map = branch.children;
    }
  }
  const collator = new Intl.Collator("zh-CN", { numeric: true });
  const sort = (left: ReadingTreeNode, right: ReadingTreeNode) => {
    const rank = (node: ReadingTreeNode) => node.slug && node.garden && node.slug === node.garden ? 0
      : node.slug && node.garden && options.isPinned?.(node.garden, node.slug) ? 1 : 2;
    return rank(left) - rank(right) || collator.compare(left.key, right.key);
  };
  const convert = (map: Map<string, Branch>, parentKey: string): ReadingTreeNode[] => [...map].map(([part, branch]) => {
    const key = `${parentKey}/${part}`;
    const post = branch.post;
    return {
      id: post?.id ?? `group-${key}`, key,
      title: post?.title ?? (multiGarden && !parentKey ? options.gardenLabels?.[part] ?? part : part),
      slug: post?.slug, garden: post?.garden, published: post?.published,
      type: post ? "doc" as const : "group" as const,
      children: convert(branch.children, key),
    };
  }).sort(sort);
  return convert(root, "");
}
