"use client";

/**
 * 绑定 Agent 主会话 + 开新对话。从 chat.tsx 原样迁出。
 */
import { useCallback, useEffect, type Dispatch, type SetStateAction } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { Agent } from "@oasismind/shared";
import { trpc, catchUnlessCancelled } from "@/lib/trpc";
import {
  loadDefaultChatConfig,
  resolveNewChatConfig,
  saveDefaultChatConfig,
} from "@/lib/chatConfig";
import { sessionComposeActions } from "@/lib/useSessionComposeState";
import { streamLifecycleActions } from "@/lib/useStreamLifecycle";
import { NEW_STREAM_KEY } from "@/lib/chatKeys";
import {
  getSessionConfig,
  migrateSessionConfig,
  setSessionConfig,
} from "@/lib/sessionConfigStore";

export function useChatStartNewChat(opts: {
  backendDown: boolean;
  agentId: string;
  setAgentId: Dispatch<SetStateAction<string>>;
  setEditingSessionId: (id: string | null) => void;
  effectiveAgentId: string;
  selectedAgent: Agent | undefined;
  agentsItems: Agent[] | undefined;
  focusedSessionId: string | null;
  sessionFromUrl: string | null;
  tabsHydrated: boolean;
  searchParams: ReadonlyURLSearchParams;
  pathname: string;
  router: { replace: (href: string, opts?: { scroll?: boolean }) => void };
  setHistorySubTab: (tab: "main" | "sub") => void;
  startNewChatInTabs: () => void;
  openTab: (id: string) => void;
  showToast: (msg: string | null) => void;
  ensureMainMutateAsync: (input: { agentId: string }) => Promise<{ id: string }>;
  openNewSessionMutateAsync: (input: {
    agentId: string;
    focusedSessionId: string | null;
    model?: string;
  }) => Promise<{ id: string; action?: string }>;
}) {
  const {
    backendDown,
    agentId,
    setAgentId,
    setEditingSessionId,
    effectiveAgentId,
    selectedAgent,
    agentsItems,
    focusedSessionId,
    sessionFromUrl,
    tabsHydrated,
    searchParams,
    pathname,
    router,
    setHistorySubTab,
    startNewChatInTabs,
    openTab,
    showToast,
    ensureMainMutateAsync,
    openNewSessionMutateAsync,
  } = opts;
  const utils = trpc.useUtils();

  const bindAgentMainSession = useCallback(
    async (aid: string): Promise<string | null> => {
      if (!aid || backendDown) return null;
      try {
        const res = await ensureMainMutateAsync({ agentId: aid });
        const agent = (agentsItems ?? []).find((a: Agent) => a.id === aid);
        const cfg = resolveNewChatConfig(getSessionConfig(NEW_STREAM_KEY), agent);
        setSessionConfig(NEW_STREAM_KEY, cfg);
        migrateSessionConfig(NEW_STREAM_KEY, res.id);
        openTab(res.id);
        utils.session.list.invalidate().catch(catchUnlessCancelled("components/chat.tsx"));
        return res.id;
      } catch {
        return null;
      }
    },
    [backendDown, ensureMainMutateAsync, openTab, utils.session.list, agentsItems],
  );

  useEffect(() => {
    if (!tabsHydrated || backendDown) return;
    if (focusedSessionId || sessionFromUrl) return;
    if (!effectiveAgentId) return;
    bindAgentMainSession(effectiveAgentId).catch(catchUnlessCancelled("components/chat.tsx"));
  }, [
    tabsHydrated,
    backendDown,
    focusedSessionId,
    sessionFromUrl,
    effectiveAgentId,
    bindAgentMainSession,
  ]);

  const startNewChat = useCallback(() => {
    const aid = agentId || effectiveAgentId;
    setAgentId((prev) => prev || effectiveAgentId);
    setEditingSessionId(null);
    const next = resolveNewChatConfig(loadDefaultChatConfig(), selectedAgent);
    setSessionConfig(NEW_STREAM_KEY, next);
    saveDefaultChatConfig(next);
    setHistorySubTab("main");
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;
    if (params.get("split")) {
      params.delete("split");
      changed = true;
    }
    if (params.get("agentId")) {
      params.delete("agentId");
      changed = true;
    }
    if (params.get("view") !== "main") {
      params.set("view", "main");
      changed = true;
    }
    if (changed) {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    (async () => {
      if (!aid || backendDown) {
        startNewChatInTabs();
        streamLifecycleActions.resetSession(NEW_STREAM_KEY);
        sessionComposeActions.resetComposeSession(NEW_STREAM_KEY);
        const p = new URLSearchParams(searchParams.toString());
        if (p.get("sessionId")) {
          p.delete("sessionId");
          router.replace(`${pathname}?${p.toString()}`, { scroll: false });
        }
        return;
      }
      try {
        const res = await openNewSessionMutateAsync({
          agentId: aid,
          focusedSessionId: focusedSessionId,
          model: selectedAgent?.model,
        });
        if (res.action === "already_here") {
          showToast("当前已在新会话中");
          return;
        }
        openTab(res.id);
        migrateSessionConfig(NEW_STREAM_KEY, res.id);
        const p = new URLSearchParams(searchParams.toString());
        p.set("sessionId", res.id);
        p.delete("agentId");
        router.replace(`${pathname}?${p.toString()}`, { scroll: false });
        utils.session.list.invalidate().catch(catchUnlessCancelled("components/chat.tsx"));
      } catch {
        showToast("创建新会话失败");
      }
    })().catch(catchUnlessCancelled("components/chat.tsx"));
  }, [
    agentId,
    selectedAgent,
    effectiveAgentId,
    backendDown,
    focusedSessionId,
    searchParams,
    pathname,
    router,
    setHistorySubTab,
    startNewChatInTabs,
    openNewSessionMutateAsync,
    openTab,
    showToast,
    utils.session.list,
    setAgentId,
    setEditingSessionId,
  ]);

  return { bindAgentMainSession, startNewChat };
}
