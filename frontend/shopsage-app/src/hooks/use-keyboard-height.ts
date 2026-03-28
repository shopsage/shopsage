"use client";

import { useState, useEffect } from "react";

/**
 * Returns the current on-screen keyboard height in pixels.
 * Uses the Visual Viewport API — works reliably on iOS Safari/Chrome and Android.
 * Returns 0 when no keyboard is visible or during SSR.
 */
export function useKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const diff = window.innerHeight - vv.height;
      // Only treat as keyboard if the difference is significant (> 100px)
      // to avoid false positives from browser chrome changes
      setKeyboardHeight(diff > 100 ? diff : 0);
    };

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return keyboardHeight;
}
