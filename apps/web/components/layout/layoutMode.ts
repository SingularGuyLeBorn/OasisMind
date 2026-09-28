"use client";

/** 路由 → 布局模式（对齐 MetaBlog：文档页 / 应用页 / 全屏页 分离） */

export type LayoutMode = "home" | "chat" | "content" | "app";

export function getLayoutMode(pathname: string): LayoutMode {
  if (pathname === "/" || pathname === "" || pathname.startsWith("/about") || pathname === "/login") return "home";
  // 办公室：沉浸全宽，不要管理侧栏抢戏
  if (pathname.startsWith("/office")) return "home";
  // 知识库门户列表：全宽无侧栏；单库首页 `/gardens/{id}` 进内容模式（只显示该库目录树）
  if (pathname === "/gardens" || pathname === "/gardens/") return "home";
  if (pathname.startsWith("/chat")) return "chat";
  // 访客博客：全宽阅读面，不挂知识库侧栏
  if (pathname === "/blog" || pathname === "/blog/" || pathname.startsWith("/blog/")) {
    return "home";
  }
  if (
    pathname.startsWith("/gardens/") ||
    pathname.startsWith("/posts") ||
    pathname.startsWith("/editor") ||
    pathname.startsWith("/categories") ||
    pathname.startsWith("/tags")
  ) {
    return "content";
  }
  return "app";
}

export function showSystemSidebar(mode: LayoutMode): boolean {
  return mode === "app";
}

export function showPostSidebar(mode: LayoutMode): boolean {
  return mode === "content";
}

export function showSidebars(mode: LayoutMode): boolean {
  return mode === "app" || mode === "content";
}
