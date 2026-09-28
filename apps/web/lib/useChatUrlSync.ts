/**
 * useChatUrlSync —— Chat URL ↔ 焦点会话同步（P3-04 / p13 自 chat.tsx 拆出）。
 *
 * 不变量：
 * - URL→tabs 只响应 sessionId **查询串本身**变化（深链 / 前进后退 / 外链 goto）。
 * - tabs→URL 只响应 focusedSessionId 变化（openTab / 新建对话）。
 * 禁止把 searchParams 放进 tabs→URL 的 effect deps：goto 会先改 URL、焦点仍是旧会话，
 * 若此时用旧焦点回写 URL，会把刚打开的会话立刻覆盖回去。
 */

"use client";

import { useCallback, useEffect, useRef, type MutableRefObject } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { catchUnlessCancelled, trpc } from "@/lib/trpc";

type RouterLike = {
  replace: (href: string, opts?: { scroll?: boolean }) => void;
};

/**
 * URL→tabs 上次观测值的首屏哨兵。必须是 undefined，不能初始化成当前 URL：
 * 否则 `sessionFromUrl === prev`，首屏深链不会 adopt，storage 旧焦点会盖住 goto。
 */
export const INITIAL_PREV_SESSION_FROM_URL: string | null | undefined = undefined;

/** URL 查询串相对上次观测值变了、且与当前焦点不一致时，adopt URL。 */
export function shouldAdoptUrlSession(opts: {
  prevSessionFromUrl: string | null | undefined;
  sessionFromUrl: string | null;
  focusedSessionId: string | null;
}): boolean {
  const urlChanged = opts.sessionFromUrl !== opts.prevSessionFromUrl;
  if (!urlChanged) return false;
  return Boolean(opts.sessionFromUrl && opts.sessionFromUrl !== opts.focusedSessionId);
}

/** 水合完成后：storage 旧焦点不得盖住深链。 */
export function shouldCorrectFocusAfterHydrate(opts: {
  tabsHydrated: boolean;
  sessionFromUrl: string | null;
  focusedSessionId: string | null;
}): boolean {
  if (!opts.tabsHydrated) return false;
  return Boolean(opts.sessionFromUrl && opts.sessionFromUrl !== opts.focusedSessionId);
}

/**
 * 由焦点会话推导应写入的 query（纯函数，供单测）。
 * 首屏焦点从空变成 storage 值、但 URL 已是另一会话 → 深链优先，不回写。
 */
export function nextChatSearchFromFocus(opts: {
  search: string;
  focusedSessionId: string | null;
  prevFocusedSessionId: string | null;
}): { nextSearch: string; changed: boolean } {
  const params = new URLSearchParams(opts.search);
  const urlSession = params.get("sessionId");
  const deepLinkPending =
    opts.prevFocusedSessionId == null &&
    Boolean(opts.focusedSessionId) &&
    Boolean(urlSession) &&
    urlSession !== opts.focusedSessionId;

  let changed = false;
  if (!deepLinkPending) {
    if (opts.focusedSessionId) {
      if (urlSession !== opts.focusedSessionId) {
        params.set("sessionId", opts.focusedSessionId);
        changed = true;
      }
    } else if (params.has("sessionId") && opts.prevFocusedSessionId) {
      params.delete("sessionId");
      changed = true;
    }
  }
  if (params.has("split")) {
    params.delete("split");
    changed = true;
  }
  return { nextSearch: params.toString(), changed };
}

export function useChatUrlSync(args: {
  searchParams: ReadonlyURLSearchParams;
  pathname: string;
  router: RouterLike;
  sessionFromUrl: string | null;
  focusedSessionId: string | null;
  tabsHydrated: boolean;
  ensureFocusedSession: (id: string) => void;
  consumeRef: MutableRefObject<(preferredSessionId?: string) => void>;
}) {
  const {
    searchParams,
    pathname,
    router,
    sessionFromUrl,
    focusedSessionId,
    tabsHydrated,
    ensureFocusedSession,
    consumeRef,
  } = args;

  const utils = trpc.useUtils();
  const prevFocusedRef = useRef<string | null>(null);
  const focusedSessionIdRef = useRef(focusedSessionId);
  const prevSessionFromUrlRef = useRef<string | null | undefined>(INITIAL_PREV_SESSION_FROM_URL);
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const syncChatUiToUrl = useCallback(
    (patch: { view?: "main" | "sub"; panel?: "history" | "runtime" }) => {
      const params = new URLSearchParams(searchParams.toString());
      let changed = false;
      if (patch.view === "sub" || patch.view === "main") {
        if (params.get("view") !== patch.view) {
          params.set("view", patch.view);
          changed = true;
        }
      }
      if (patch.panel === "runtime") {
        if (params.get("panel") !== "runtime") {
          params.set("panel", "runtime");
          changed = true;
        }
      } else if (patch.panel === "history") {
        if (params.has("panel")) {
          params.delete("panel");
          changed = true;
        }
      }
      if (changed) {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [searchParams, pathname, router],
  );

  useEffect(() => {
    focusedSessionIdRef.current = focusedSessionId;
  }, [focusedSessionId]);

  useEffect(() => {
    const adopt = shouldAdoptUrlSession({
      prevSessionFromUrl: prevSessionFromUrlRef.current,
      sessionFromUrl,
      focusedSessionId: focusedSessionIdRef.current,
    });
    prevSessionFromUrlRef.current = sessionFromUrl;
    if (!adopt || !sessionFromUrl) return;
    ensureFocusedSession(sessionFromUrl);
    utils.session.list.invalidate().catch(catchUnlessCancelled("useChatUrlSync"));
    utils.session.listRunning.invalidate().catch(catchUnlessCancelled("useChatUrlSync"));
    consumeRef.current(sessionFromUrl);
  }, [sessionFromUrl, ensureFocusedSession, utils.session.list, utils.session.listRunning, consumeRef]);

  useEffect(() => {
    // 禁止把 focusedSessionId 放进 deps，否则 openTab 后 URL 未跟上会被拽回去。
    if (
      !shouldCorrectFocusAfterHydrate({
        tabsHydrated,
        sessionFromUrl,
        focusedSessionId: focusedSessionIdRef.current,
      }) ||
      !sessionFromUrl
    ) {
      return;
    }
    ensureFocusedSession(sessionFromUrl);
  }, [tabsHydrated, sessionFromUrl, ensureFocusedSession]);

  useEffect(() => {
    const { nextSearch, changed } = nextChatSearchFromFocus({
      search: searchParamsRef.current.toString(),
      focusedSessionId,
      prevFocusedSessionId: prevFocusedRef.current,
    });
    prevFocusedRef.current = focusedSessionId;
    if (changed) {
      router.replace(`${pathname}?${nextSearch}`, { scroll: false });
    }
  }, [focusedSessionId, pathname, router]);

  return { syncChatUiToUrl };
}
