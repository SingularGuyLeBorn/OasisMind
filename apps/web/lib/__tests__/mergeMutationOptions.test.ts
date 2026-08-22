import { describe, expect, it, vi } from "vitest";
import { mergeMutationOptions } from "../mergeMutationOptions";

describe("mergeMutationOptions", () => {
  it("调用方 onSuccess 不能替换内置 invalidate", () => {
    const builtIn = vi.fn();
    const caller = vi.fn();
    const merged = mergeMutationOptions({ onSuccess: caller, retry: 0 }, builtIn);
    const onSuccess = merged.onSuccess as (res: unknown, ...rest: unknown[]) => void;

    onSuccess({ ok: true }, "vars", { context: 1 });

    expect(builtIn).toHaveBeenCalledTimes(1);
    expect(builtIn).toHaveBeenCalledWith({ ok: true });
    expect(caller).toHaveBeenCalledTimes(1);
    expect(caller).toHaveBeenCalledWith({ ok: true }, "vars", { context: 1 });
    expect(merged.retry).toBe(0);
  });

  it("无调用方 onSuccess 时仍跑内置", () => {
    const builtIn = vi.fn();
    const merged = mergeMutationOptions({ retry: 2 }, builtIn);
    const onSuccess = merged.onSuccess as (res: unknown) => void;
    onSuccess("done");
    expect(builtIn).toHaveBeenCalledWith("done");
  });

  it("options 为空时只跑内置", () => {
    const builtIn = vi.fn();
    const merged = mergeMutationOptions(undefined, builtIn);
    const onSuccess = merged.onSuccess as (res: unknown) => void;
    onSuccess(1);
    expect(builtIn).toHaveBeenCalledWith(1);
  });
});
