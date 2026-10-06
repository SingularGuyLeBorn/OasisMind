"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { getAuthToken } from "@/lib/auth";

/**
 * 完整工作台只属于业主。公开阅读已经迁移到独立的 apps/site，
 * 因此密码模式下这里不再给任何内容页留下匿名旁路。
 */
const PUBLIC_PATHS = ["/login"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  return false;
}

/** 完整工作台路由鉴权守卫；公开站不装载此组件。 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isLoading } = trpc.auth.status.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    if (isLoading || !data?.enabled) return;
    if (isPublicPath(pathname)) return;
    if (data.authenticated || getAuthToken()) return;
    const href = `/login?redirect=${encodeURIComponent(pathname)}`;
    // 等 App Router 初始化后再 replace，避免 Next 16「Router action before initialization」
    const id = window.setTimeout(() => {
      try {
        router.replace(href);
      } catch {
        window.location.assign(href);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [data, isLoading, pathname, router]);

  if (data?.enabled && !isPublicPath(pathname) && !data.authenticated && !getAuthToken()) {
    if (isLoading) {
      return (
        <div className="flex flex-1 items-center justify-center text-sm text-[var(--om-text-3)]">
          验证登录状态…
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
}
