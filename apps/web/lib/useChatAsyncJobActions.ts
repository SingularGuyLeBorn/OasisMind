"use client";

/**
 * 右栏异步任务中断 / 恢复 / 置顶。从 chat.tsx 原样迁出。
 */
import { useCallback } from "react";
import { trpc, catchUnlessCancelled } from "@/lib/trpc";

export function useChatAsyncJobActions(opts: {
  backendDown: boolean;
  effectiveSessionId: string | null;
  showToast: (msg: string | null) => void;
  refetchAsyncQueue: () => Promise<unknown>;
  refetchAsyncQueueStats: () => Promise<unknown>;
}) {
  const {
    backendDown,
    effectiveSessionId,
    showToast,
    refetchAsyncQueue,
    refetchAsyncQueueStats,
  } = opts;

  const cancelAsyncJobMutation = trpc.agent.cancelAsyncJob.useMutation({
    onSuccess: () => {
      refetchAsyncQueue().catch(catchUnlessCancelled("components/chat.tsx"));
      refetchAsyncQueueStats().catch(catchUnlessCancelled("components/chat.tsx"));
      showToast("已中断任务");
    },
    onError: (err) => {
      showToast(err.message || "中断失败：后端不可用或任务已结束");
    },
  });
  const cancelAsyncJobMutateFn = cancelAsyncJobMutation.mutate;
  const cancelAsyncJobMutate = useCallback(
    (input: { jobId: string }) => {
      if (backendDown) {
        showToast("后端未连接，无法取消任务。请先运行 pnpm dev");
        return;
      }
      if (!effectiveSessionId) {
        showToast("无当前会话，无法中断任务");
        return;
      }
      cancelAsyncJobMutateFn({ jobId: input.jobId, sessionId: effectiveSessionId });
    },
    [backendDown, cancelAsyncJobMutateFn, effectiveSessionId, showToast],
  );

  const resumeAsyncJobMutation = trpc.agent.resumeAsyncJob.useMutation({
    onSuccess: () => {
      refetchAsyncQueue().catch(catchUnlessCancelled("components/chat.tsx"));
      refetchAsyncQueueStats().catch(catchUnlessCancelled("components/chat.tsx"));
      showToast("已恢复任务");
    },
    onError: (err) => {
      showToast(err.message || "恢复失败");
    },
  });
  const resumeAsyncJobMutateFn = resumeAsyncJobMutation.mutate;
  const resumeAsyncJobMutate = useCallback(
    (input: { jobId: string }) => {
      if (backendDown) {
        showToast("后端未连接，无法恢复任务。请先运行 pnpm dev");
        return;
      }
      if (!effectiveSessionId) {
        showToast("无当前会话，无法恢复任务");
        return;
      }
      resumeAsyncJobMutateFn({ jobId: input.jobId, sessionId: effectiveSessionId });
    },
    [backendDown, effectiveSessionId, resumeAsyncJobMutateFn, showToast],
  );

  const pinAsyncJobMutation = trpc.agent.toggleAsyncJobPinned.useMutation({
    onSuccess: () => {
      refetchAsyncQueue().catch(catchUnlessCancelled("components/chat.tsx"));
    },
  });

  return {
    cancelAsyncJobMutate,
    resumeAsyncJobMutate,
    pinAsyncJobMutate: pinAsyncJobMutation.mutate,
  };
}
