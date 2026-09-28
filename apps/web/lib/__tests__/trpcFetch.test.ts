import { describe, it, expect, vi } from "vitest";
import { fetchWithTimeout } from "../trpcFetch";

describe("fetchWithTimeout", () => {
  it("超时后 abort 请求", async () => {
    const fetchImpl = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    });
    await expect(
      fetchWithTimeout("http://127.0.0.1:3010/api/trpc", {}, {
        timeoutMs: 40,
        fetch: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
