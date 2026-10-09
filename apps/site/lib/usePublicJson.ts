"use client";

/**
 * 公开站统一 JSON 读取 Hook，仅允许浏览器对生成物发同源 GET。
 * 它不携带业主凭据、不调用写接口；取消请求不报错，HTTP/解析失败则进入显式 error 状态。
 */
import { useEffect, useState } from "react";
import { withSiteBasePath } from "@/siteConfig";

interface PublicJsonState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** 静态站统一拉取器：请求可取消，失败可见，不依赖本地服务端。 */
export function usePublicJson<T>(url: string, enabled = true): PublicJsonState<T> & { retry: () => void } {
  const [state, setState] = useState<PublicJsonState<T>>({ data: null, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let active = true;
    fetch(withSiteBasePath(url), { signal: controller.signal, headers: { accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json() as T;
      })
      .then((data) => {
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) return;
        const message = error instanceof Error ? error.message : String(error);
        setState({ data: null, error: `公开内容读取失败：${message}`, loading: false });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [url, enabled, attempt]);

  // [OM-FREEPLAY] 静态索引读取失败时允许手动重试，不自动循环请求。
  return { ...state, retry: () => { setState({ data: null, error: null, loading: true }); setAttempt(value => value + 1); } };
}
