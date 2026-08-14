/**
 * 合作式取消：timeout 只 abort signal，await body 直到 settle。
 * 本文件禁止用 race 丢弃未 settle 的 body。
 */

export function fuseSignals(
  ...signals: Array<AbortSignal | undefined>
): { signal: AbortSignal; dispose: () => void } {
  const ac = new AbortController();
  const listeners: Array<{ s: AbortSignal; fn: () => void }> = [];

  const abortFrom = (s: AbortSignal) => {
    if (!ac.signal.aborted) ac.abort(s.reason);
  };

  for (const s of signals) {
    if (!s) continue;
    if (s.aborted) {
      abortFrom(s);
      continue;
    }
    const fn = () => abortFrom(s);
    s.addEventListener("abort", fn);
    listeners.push({ s, fn });
  }

  return {
    signal: ac.signal,
    dispose: () => {
      for (const { s, fn } of listeners) s.removeEventListener("abort", fn);
    },
  };
}

export type CooperativeOk<T> = { status: "ok"; value: T; elapsedMs: number };
export type CooperativeFail<T> = {
  status: "TIMEOUT" | "ABORTED" | "ABORTED_BEFORE_DISPATCH";
  error: Error;
  elapsedMs: number;
  bodyInvoked: boolean;
  value?: T;
};

function timeoutError(label: string, timeoutMs: number): Error {
  return new Error(
    `工具 ${label} 执行超时（${timeoutMs}ms）。建议改用 async_task_run 异步执行，或 spawn_subagent 派生子代理处理长任务，避免阻塞主对话。`,
  );
}

function abortError(label: string, before: boolean): Error {
  return new Error(
    before ? `工具 ${label} 在 dispatch 前已取消` : `工具 ${label} 已取消`,
  );
}

export async function runCooperative<T>(
  body: (signal: AbortSignal) => Promise<T>,
  opts: { timeoutMs: number; signal?: AbortSignal; label: string },
): Promise<CooperativeOk<T> | CooperativeFail<T>> {
  const started = Date.now();
  const timeoutAc = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    if (!timeoutAc.signal.aborted) timeoutAc.abort();
  }, opts.timeoutMs);

  const fused = fuseSignals(opts.signal, timeoutAc.signal);
  const elapsed = () => Date.now() - started;

  if (opts.signal?.aborted) {
    fused.dispose();
    clearTimeout(timer);
    return {
      status: "ABORTED_BEFORE_DISPATCH",
      error: abortError(opts.label, true),
      elapsedMs: elapsed(),
      bodyInvoked: false,
    };
  }

  let bodyInvoked = false;
  try {
    bodyInvoked = true;
    const p = body(fused.signal);
    const value = await p;
    if (timedOut) {
      return {
        status: "TIMEOUT",
        error: timeoutError(opts.label, opts.timeoutMs),
        elapsedMs: elapsed(),
        bodyInvoked,
        value,
      };
    }
    if (opts.signal?.aborted) {
      return {
        status: "ABORTED",
        error: abortError(opts.label, false),
        elapsedMs: elapsed(),
        bodyInvoked,
        value,
      };
    }
    return { status: "ok", value, elapsedMs: elapsed() };
  } catch (err) {
    if (timedOut) {
      return {
        status: "TIMEOUT",
        error: timeoutError(opts.label, opts.timeoutMs),
        elapsedMs: elapsed(),
        bodyInvoked,
      };
    }
    if (opts.signal?.aborted) {
      return {
        status: "ABORTED",
        error: abortError(opts.label, false),
        elapsedMs: elapsed(),
        bodyInvoked,
      };
    }
    throw err;
  } finally {
    fused.dispose();
    clearTimeout(timer);
  }
}
