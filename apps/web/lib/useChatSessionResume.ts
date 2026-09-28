"use client";

/**
 * Chat 续传三件套（从 chat.tsx 原样迁出，effect 体未改）：
 * 1. mount：sessionStorage 恢复 compose + lifecycle 并续传
 * 2. 页面生命周期：beforeunload / visibilitychange / Ctrl+Shift+S / unmount 清 rAF
 * 3. listRunning：后端发现运行中会话并续传；幽灵占用 ABORT
 *
 * 禁止在本文件新增「监听状态 → drain」类 effect。
 */
import { useEffect, type MutableRefObject } from "react";
import { catchUnlessCancelled } from "@/lib/trpc";
import {
  sessionComposeActions,
  sessionComposeStore,
} from "@/lib/useSessionComposeState";
import {
  streamLifecycleActions,
  streamLifecycleStore,
  type StreamLifecycleState,
} from "@/lib/useStreamLifecycle";
import { saveChatStoresToStorage, type RunStreamOptions, type RunStreamOutcome } from "@/lib/useChatRunStream";
import {
  COMPOSE_STORAGE_KEY,
  LIFECYCLE_STORAGE_KEY,
  NEW_STREAM_KEY,
} from "@/lib/chatKeys";
import { ensureSessionConfigHydrated } from "@/lib/sessionConfigStore";

export function useChatSessionResume(opts: {
  isPageUnloadingRef: MutableRefObject<boolean>;
  pendingStreamDeltaRef: MutableRefObject<Map<string, string>>;
  streamRafRef: MutableRefObject<Map<string, number>>;
  pendingThinkingDeltaRef: MutableRefObject<Map<string, string>>;
  thinkingRafRef: MutableRefObject<Map<string, number>>;
  streamSaveTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  reorderTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  runStreamRef: MutableRefObject<((opts: RunStreamOptions) => Promise<RunStreamOutcome>) | null>;
  runningSessionItems: Array<{ sessionId: string }> | undefined;
  runningSessionsFetched: boolean;
  setShowCreateSubagent: (open: boolean) => void;
}): void {
  const {
    isPageUnloadingRef,
    pendingStreamDeltaRef,
    streamRafRef,
    pendingThinkingDeltaRef,
    thinkingRafRef,
    streamSaveTimeoutRef,
    reorderTimerRef,
    runStreamRef,
    runningSessionItems,
    runningSessionsFetched,
    setShowCreateSubagent,
  } = opts;

  // 【mount 恢复与续传 · 心脏区】从 sessionStorage 恢复 compose + lifecycle，并自动续传
  useEffect(() => {
    try {
      const composeRaw = sessionStorage.getItem(COMPOSE_STORAGE_KEY);
      if (composeRaw) {
        const parsed = JSON.parse(composeRaw) as Record<string, Parameters<typeof sessionComposeStore.hydrate>[0][string]>;
        sessionComposeStore.hydrate(parsed);
      }
      const lifeRaw = sessionStorage.getItem(LIFECYCLE_STORAGE_KEY);
      if (lifeRaw) {
        const parsed = JSON.parse(lifeRaw) as Record<string, StreamLifecycleState & { isStreaming?: boolean }>;
        for (const [sid, st] of Object.entries(parsed)) {
          if (sid === NEW_STREAM_KEY) continue;
          const wasStreaming = st.phase === "streaming" || st.isStreaming === true;
          if (wasStreaming) {
            streamLifecycleActions.restoreStreamSnapshot(sid, {
              streamTargetUserId: st.streamTargetUserId ?? null,
              streamingContent: st.streamingContent ?? "",
              liveTimeline: st.liveTimeline ?? [],
              lastEventId: st.lastEventId ?? 0,
            });
            console.log("[mount] resuming", sid, "lastEventId", st.lastEventId);
            ensureSessionConfigHydrated(sid);
            runStreamRef.current?.({
              targetSessionId: sid,
              resumeAfter: streamLifecycleStore.resolveResumeAfter(sid),
              isResume: true,
            }).catch(catchUnlessCancelled("components/chat.tsx"));
          }
        }
      }
      for (const sid of sessionComposeStore.listSessionIds()) {
        if (streamLifecycleStore.isRunOccupied(sid)) continue;
        const compose = sessionComposeStore.get(sid);
        const hasPending =
          compose.userQueue.some(
            (t) =>
              (t.kind === "user" || t.kind === "child_notify") &&
              (t.text.trim() || t.attachments?.length),
          ) ||
          compose.asyncOverlays.some(
            (t) =>
              t.kind === "async-result" &&
              !t.serverConsumed &&
              t.sourceType !== "async_task_tool" &&
              t.sourceType !== "sleep" &&
              (t.text.trim() || t.asyncResult),
          );
        if (hasPending) streamLifecycleActions.hydrateDone(sid);
      }
    } catch (e) {
      console.error("[mount] restore error", e);
    }
    // 原 chat.tsx 即 mount-once；runStreamRef 是稳定 ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 【页面生命周期与全局监听群】beforeunload + visibilitychange + Ctrl+Shift+S + unmount
  useEffect(() => {
    const onBeforeUnload = () => {
      isPageUnloadingRef.current = true;
      saveChatStoresToStorage();
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    const onVisibilityChange = () => {
      if (document.hidden) {
        saveChatStoresToStorage();
        return;
      }
      const life = streamLifecycleStore.serialize();
      for (const [sid, st] of Object.entries(life)) {
        if (sid === NEW_STREAM_KEY) continue;
        if (st.phase === "streaming" && !sessionComposeActions.getActiveAbortController(sid)) {
          ensureSessionConfigHydrated(sid);
          runStreamRef.current?.({
            targetSessionId: sid,
            resumeAfter: streamLifecycleStore.resolveResumeAfter(sid),
            isResume: true,
          }).catch(catchUnlessCancelled("components/chat.tsx"));
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        setShowCreateSubagent(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    const rafMap = streamRafRef.current;
    const deltaMap = pendingStreamDeltaRef.current;
    const thinkRafMap = thinkingRafRef.current;
    const thinkDeltaMap = pendingThinkingDeltaRef.current;
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("keydown", onKeyDown);
      saveChatStoresToStorage();
      rafMap.forEach((id) => cancelAnimationFrame(id));
      rafMap.clear();
      deltaMap.clear();
      thinkRafMap.forEach((id) => cancelAnimationFrame(id));
      thinkRafMap.clear();
      thinkDeltaMap.clear();
      if (streamSaveTimeoutRef.current) {
        clearTimeout(streamSaveTimeoutRef.current);
        streamSaveTimeoutRef.current = null;
      }
      if (reorderTimerRef.current) {
        clearTimeout(reorderTimerRef.current);
        reorderTimerRef.current = null;
      }
    };
    // 原 chat.tsx 即 mount-once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 【listRunning 挂接 · INV-5 · 心脏区】
  useEffect(() => {
    if (!runningSessionsFetched) return;
    const items = runningSessionItems ?? [];
    const runningIds = new Set(items.map((item) => item.sessionId).filter(Boolean));
    for (const item of items) {
      const sid = item.sessionId;
      if (!sid || sid === NEW_STREAM_KEY) continue;
      if (sessionComposeActions.getActiveAbortController(sid)) continue;
      ensureSessionConfigHydrated(sid);
      runStreamRef.current?.({
        targetSessionId: sid,
        resumeAfter: streamLifecycleStore.resolveResumeAfter(sid),
        isResume: true,
      }).catch(catchUnlessCancelled("components/chat.tsx"));
    }
    const released: string[] = [];
    for (const [sid, st] of Object.entries(streamLifecycleStore.serialize())) {
      if (sid === NEW_STREAM_KEY) continue;
      if (st.phase !== "streaming" && st.phase !== "done") continue;
      if (runningIds.has(sid)) continue;
      if (sessionComposeActions.getActiveAbortController(sid)) continue;
      streamLifecycleActions.abortStream(sid, {
        partialAssistantMessageId: null,
        leftoverContent: st.streamingContent,
      });
      released.push(sid);
    }
    for (const sid of released) {
      const compose = sessionComposeStore.get(sid);
      const hasPending =
        compose.userQueue.some(
          (t) =>
            (t.kind === "user" || t.kind === "child_notify") &&
            (t.text.trim() || t.attachments?.length),
        ) ||
        compose.asyncOverlays.some(
          (t) =>
            t.kind === "async-result" &&
            !t.serverConsumed &&
            (t.text.trim() || t.asyncResult),
        );
      if (hasPending) streamLifecycleActions.hydrateDone(sid);
    }
    // 原 chat.tsx deps 不含 runStreamRef（稳定 ref）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runningSessionItems, runningSessionsFetched]);
}
