/**
 * Next.js 16：App Router action queue 未就绪时 router.prefetch/push/replace
 * 会抛「Router action dispatched before initialization」。
 * 导航预热必须吞掉该错，并尽量推迟到 hydration 之后。
 */

type Prefetchable = { prefetch: (href: string) => void };

export function safeRouterPrefetch(router: Prefetchable, href: string): void {
  try {
    router.prefetch(href);
  } catch {
    // 初始化竞态 / 无效 href：预热失败不阻断导航
  }
}

/** 双 rAF + 短延迟，等 App Router action queue 就绪后再 idle 预热 */
export function scheduleIdlePrefetch(
  run: () => void,
  opts?: { timeoutMs?: number; delayMs?: number },
): () => void {
  const timeoutMs = opts?.timeoutMs ?? 1500;
  const delayMs = opts?.delayMs ?? 0;
  let cancelled = false;
  let idleId: number | undefined;
  let timeoutId: number | undefined;
  let raf1 = 0;
  let raf2 = 0;

  const invoke = () => {
    if (cancelled) return;
    try {
      run();
    } catch {
      // ignore
    }
  };

  const afterPaint = () => {
    if (cancelled) return;
    const start = () => {
      if (cancelled) return;
      const w = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };
      if (typeof w.requestIdleCallback === "function") {
        idleId = w.requestIdleCallback(invoke, { timeout: timeoutMs });
      } else {
        timeoutId = window.setTimeout(invoke, Math.min(400, timeoutMs));
      }
    };
    if (delayMs > 0) {
      timeoutId = window.setTimeout(start, delayMs);
    } else {
      start();
    }
  };

  raf1 = requestAnimationFrame(() => {
    raf2 = requestAnimationFrame(afterPaint);
  });

  return () => {
    cancelled = true;
    cancelAnimationFrame(raf1);
    cancelAnimationFrame(raf2);
    if (timeoutId != null) clearTimeout(timeoutId);
    const w = window as Window & { cancelIdleCallback?: (id: number) => void };
    if (idleId != null) w.cancelIdleCallback?.(idleId);
  };
}
