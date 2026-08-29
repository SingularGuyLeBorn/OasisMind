import { describe, expect, it, vi, afterEach } from "vitest";
import { catchUnlessCancelled, isCancelledOrAbortError } from "../trpc";

describe("isCancelledOrAbortError", () => {
  it("name=CancelledError 为 true", () => {
    const err = new Error("cancelled");
    err.name = "CancelledError";
    expect(isCancelledOrAbortError(err)).toBe(true);
  });

  it("name=AbortError 为 true", () => {
    const err = new Error("aborted");
    err.name = "AbortError";
    expect(isCancelledOrAbortError(err)).toBe(true);
  });

  it("message=CancelledError 为 true", () => {
    expect(isCancelledOrAbortError(new Error("CancelledError"))).toBe(true);
  });

  it("普通 Error 为 false", () => {
    expect(isCancelledOrAbortError(new Error("network down"))).toBe(false);
  });
});

describe("catchUnlessCancelled", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("CancelledError 不 console.warn", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const err = new Error("cancelled");
    err.name = "CancelledError";
    catchUnlessCancelled("t")(err);
    expect(warn).not.toHaveBeenCalled();
  });

  it("其它 Error 调用 console.warn", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const err = new Error("boom");
    catchUnlessCancelled("t")(err);
    expect(warn).toHaveBeenCalledWith("t", err);
  });
});
