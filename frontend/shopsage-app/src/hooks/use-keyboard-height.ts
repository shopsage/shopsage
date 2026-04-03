"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Returns the bottom position (in px) the composer should use.
 * When keyboard is closed: returns null (use CSS default).
 * When keyboard is open: returns the distance from the bottom of the
 * layout viewport to the top of the keyboard.
 *
 * On iOS, `position: fixed` elements are positioned relative to the
 * layout viewport (which does NOT shrink when the keyboard opens).
 * The visual viewport DOES shrink, so we compute:
 *   bottom = layoutHeight - (vv.offsetTop + vv.height)
 * This gives us exactly where the keyboard starts.
 */
export function useKeyboardOffset(): number | null {
  const [offset, setOffset] = useState<number | null>(null);

  const update = useCallback(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const layoutHeight = window.innerHeight;
    const visualBottom = vv.offsetTop + vv.height;
    const keyboardHeight = layoutHeight - visualBottom;

    // Only treat as keyboard if > 100px to avoid false positives
    setOffset(keyboardHeight > 100 ? keyboardHeight : null);
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [update]);

  return offset;
}
