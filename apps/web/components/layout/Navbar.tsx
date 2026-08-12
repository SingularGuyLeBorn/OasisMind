"use client";

import { useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Home, LayoutGrid, Menu, MessageSquare, Sofa, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { safeRouterPrefetch, scheduleIdlePrefetch } from "@/lib/safeRouterPrefetch";
import { ThemeToggle } from "@/components/themeToggle";
import type { LayoutMode } from "./layoutMode";

/**
 * idle 只预热轻路由 RSC（秒切主力）。
 * /about /office 含 three，禁止 idle 拉 chunk——悬停再拉，避免长跑堆内存。
 */
const IDLE_PREFETCH_HREFS = ["/", "/blog", "/gardens", "/chat", "/agents", "/dashboard", "/posts"] as const;

/** CmdK 面板按需加载，勿进根布局静态图 */
const CommandPalette = dynamic(
  () => import("./CommandPalette").then((m) => m.CommandPalette),
  { ssr: false, loading: () => null },
);

interface NavbarProps {
  mode: LayoutMode;
  onMenuClick?: () => void;
  className?: string;
}

/** 内容域：库首页 / 文章列表 / 编辑器都算「知识库」高亮 */
function isKnowledgeActive(pathname: string): boolean {
  return (
    pathname.startsWith("/gardens") ||
    pathname.startsWith("/posts") ||
    pathname.startsWith("/editor") ||
    pathname.startsWith("/categories") ||
    pathname.startsWith("/tags")
  );
}

/**
 * 「管理」= 原 Agents 工作台 + 侧栏全部 app 路由（Skill / 记忆 / Inbox / 凭据等）。
 * 不含知识库内容域、对话、关于我、登录。
 */
function isManageActive(pathname: string): boolean {
  if (isKnowledgeActive(pathname)) return false;
  if (
    pathname.startsWith("/chat") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/office") ||
    pathname === "/login"
  ) {
    return false;
  }
  if (pathname === "/" || pathname === "") return false;
  return true;
}

function prefetchHref(router: ReturnType<typeof useRouter>, href: string) {
  safeRouterPrefetch(router, href);
}

export function Navbar({ mode, onMenuClick, className }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const showMobileMenu = mode === "app" || mode === "content";

  useEffect(() => {
    return scheduleIdlePrefetch(() => {
      for (const href of IDLE_PREFETCH_HREFS) {
        prefetchHref(router, href);
      }
      // 侧栏 chunk 提前拉，home↔app 切换不卡第一帧（勿预拉 Office/About three）
      import("./Sidebar").catch(() => {});
      import("./PostSidebar").catch(() => {});
    }, { timeoutMs: 1200, delayMs: 50 });
  }, [router]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 shrink-0 border-b border-[var(--kp-divider)]",
        "bg-[var(--kp-glass-bg)] backdrop-blur-md",
        "shadow-[0_1px_0_0_color-mix(in_srgb,var(--kp-brand)_12%,transparent)]",
        className,
      )}
    >
      <div className="flex h-14 w-full items-center gap-3 px-3 md:gap-4 md:px-6">
        {showMobileMenu && (
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-[var(--kp-text-2)] transition hover:bg-[var(--kp-bg-mute)] lg:hidden"
            aria-label="打开菜单"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <nav className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto md:flex">
          <TopNavLink
            href="/"
            active={pathname === "/" || pathname === ""}
            icon={<Home className="h-4 w-4" />}
            onPrefetch={() => prefetchHref(router, "/")}
          >
            首页
          </TopNavLink>
          <TopNavLink
            href="/blog"
            active={pathname.startsWith("/blog")}
            icon={<BookOpen className="h-4 w-4" />}
            onPrefetch={() => prefetchHref(router, "/blog")}
          >
            博客
          </TopNavLink>
          <TopNavLink
            href="/gardens"
            active={isKnowledgeActive(pathname)}
            icon={<LayoutGrid className="h-4 w-4" />}
            onPrefetch={() => prefetchHref(router, "/gardens")}
          >
            知识库
          </TopNavLink>
          <TopNavLink
            href="/chat"
            active={pathname.startsWith("/chat")}
            icon={<MessageSquare className="h-4 w-4" />}
            onPrefetch={() => prefetchHref(router, "/chat")}
          >
            对话
          </TopNavLink>
          <TopNavLink
            href="/about"
            active={pathname.startsWith("/about")}
            icon={<UserCircle className="h-4 w-4" />}
            onPrefetch={() => {
              prefetchHref(router, "/about");
              import("@/components/about/AboutView").catch(() => {});
            }}
          >
            关于我
          </TopNavLink>
          <TopNavLink
            href="/office"
            active={pathname.startsWith("/office")}
            icon={<Sofa className="h-4 w-4" />}
            onPrefetch={() => {
              prefetchHref(router, "/office");
              import("@/components/office/OfficeScene").catch(() => {});
            }}
          >
            办公室
          </TopNavLink>
          <TopNavLink
            href="/agents"
            active={isManageActive(pathname)}
            icon={<LayoutGrid className="h-4 w-4" />}
            onPrefetch={() => {
              prefetchHref(router, "/agents");
              import("./Sidebar").catch(() => {});
            }}
          >
            管理
          </TopNavLink>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 md:gap-2">
          <CommandPalette />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function TopNavLink({
  href,
  active,
  icon,
  children,
  onPrefetch,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
  onPrefetch?: () => void;
}) {
  return (
    <Link
      href={href}
      prefetch
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      onTouchStart={onPrefetch}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition",
        active
          ? "kp-nav-pill-active"
          : "text-[var(--kp-text-2)] hover:bg-[var(--kp-bg-mute)] hover:text-[var(--kp-text-1)]",
      )}
    >
      {icon}
      <span className="hidden md:inline">{children}</span>
    </Link>
  );
}
