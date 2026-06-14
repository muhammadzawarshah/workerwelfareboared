"use client";

import { useEffect, useRef, useState } from "react";
import { apiRequest } from "@/src/lib/api";

/**
 * Fetches a backend resource and tracks online/loading state.
 * Falls back to the supplied mock data when there is no token or the API fails,
 * so the UI stays usable offline ("Mock Data" mode).
 */
export function useResource<T>(path: string, token: string, fallback: T) {
  const fallbackRef = useRef(fallback);
  const [data, setData] = useState<T>(fallback);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    if (!token) {
      setData(fallbackRef.current);
      setOnline(false);
      return;
    }
    setLoading(true);
    try {
      const result = await apiRequest<T>(path, token);
      setData(result);
      setOnline(true);
    } catch {
      setData(fallbackRef.current);
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    if (!active) return;
    refresh();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, token]);

  return { data, online, loading, refresh };
}
