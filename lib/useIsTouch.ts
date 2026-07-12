"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Tracks a CSS media query. SSR-safe: false on the server. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True on touch-first devices (no hover, coarse pointer). */
export function useIsTouch(): boolean {
  return useMediaQuery("(hover: none) and (pointer: coarse)");
}
