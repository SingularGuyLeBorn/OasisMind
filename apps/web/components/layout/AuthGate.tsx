"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { getAuthToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/", "/about", "/posts", "/categories", "/tags"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  if (pathname.startsWith("/posts/") && !pathname.startsWith("/posts/page")) return true;
  return false;
}

/** 控制台路由鉴权守卫（博客公开页不受影响） */
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
        <div className="flex flex-1 items-center justify-center text-sm text-[var(--kp-text-3)]">
          验证登录状态…
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
}
