"use client";

/**
 * Chat 视图级 toast：内联重置定时器（重复调用重新计时、传 null 停表）。
 * 从 chat.tsx 原样迁出，行为不变。
 */
import { useCallback, useEffect, useRef, useState } from "react";

export function useChatToast() {
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string | null) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(msg);
    if (msg !== null) {
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, 2500);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, []);

  return { toast, showToast };
}
