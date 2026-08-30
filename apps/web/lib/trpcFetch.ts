/**
 * 浏览器 tRPC fetch：给挂死的代理加硬超时。
 * Next rewrite 到 3010 时若后端没起来，TCP SYN 能空等 20s×默认 3 次重试，切页假死、空态被当成「库空了」。
 */

/** [OM-FREEPLAY] 本机 tRPC 6s 封顶；列表/树查询应远低于此。 */
export const TRPC_FETCH_TIMEOUT_MS = 6_000;

function mergeAbortSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  if (typeof AbortSignal.any === "function") return AbortSignal.any([a, b]);
  const ctrl = new AbortController();
  const abort = () => ctrl.abort();
  if (a.aborted || b.aborted) {
    ctrl.abort();
    return ctrl.signal;
  }
  a.addEventListener("abort", abort, { once: true });
  b.addEventListener("abort", abort, { once: true });
  return ctrl.signal;
}

export function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  opts?: { timeoutMs?: number; fetch?: typeof fetch },
): Promise<Response> {
  const timeoutMs = opts?.timeoutMs ?? TRPC_FETCH_TIMEOUT_MS;
  const fetchImpl = opts?.fetch ?? globalThis.fetch;
  const timeout =
    typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(timeoutMs)
      : (() => {
          const c = new AbortController();
          setTimeout(() => c.abort(), timeoutMs);
          return c.signal;
        })();
  const signal = init?.signal ? mergeAbortSignals(init.signal, timeout) : timeout;
  return fetchImpl(input, { ...init, signal });
}
