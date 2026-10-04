"use client";

import { useEffect, useState } from "react";

interface PublicJsonState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** 静态站统一拉取器：请求可取消，失败可见，不依赖本地服务端。 */
export function usePublicJson<T>(url: string): PublicJsonState<T> {
  const [state, setState] = useState<PublicJsonState<T>>({ data: null, error: null, loading: true });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    fetch(url, { signal: controller.signal, headers: { accept: "application/json" } })
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
  }, [url]);

  return state;
}
