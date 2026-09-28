import { afterEach, describe, expect, it, vi } from "vitest";
import {
  catchUnlessCancelled,
  isCancelledOrAbortError,
  warnUnlessCancelled,
} from "../trpc";

function namedError(name: string, message = name): Error {
  const err = new Error(message);
  err.name = name;
  return err;
}

describe("isCancelledOrAbortError", () => {
  it("CancelledError / AbortError 的 name 或 message 为 true", () => {
    expect(isCancelledOrAbortError(namedError("CancelledError", "x"))).toBe(true);
    expect(isCancelledOrAbortError(namedError("AbortError", "x"))).toBe(true);
    expect(isCancelledOrAbortError(namedError("Error", "CancelledError"))).toBe(true);
    expect(isCancelledOrAbortError(namedError("Error", "AbortError"))).toBe(true);
    expect(isCancelledOrAbortError(new Error("boom"))).toBe(false);
    expect(isCancelledOrAbortError("nope")).toBe(false);
  });
});

describe("catchUnlessCancelled", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("CancelledError 不 console.warn，其它 Error 会 warn", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const catcher = catchUnlessCancelled("t");
    catcher(namedError("CancelledError"));
    expect(warn).not.toHaveBeenCalled();
    catcher(new Error("boom"));
    expect(warn).toHaveBeenCalledWith("t", expect.any(Error));
    warnUnlessCancelled("t", namedError("AbortError"));
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
