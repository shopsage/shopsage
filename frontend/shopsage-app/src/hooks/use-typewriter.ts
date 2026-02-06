"use client";

import { useState, useEffect, useRef } from "react";

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  enabled?: boolean;
  onComplete?: () => void;
}

export function useTypewriter({
  text,
  speed = 20,
  enabled = true,
  onComplete
}: UseTypewriterOptions) {
  const [displayedText, setDisplayedText] = useState(enabled ? "" : text);
  const [isComplete, setIsComplete] = useState(!enabled);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const animatedTextRef = useRef<string>("");
  const isAnimationCompleteRef = useRef(false);

  // Keep onComplete ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // If not enabled, show full text immediately
    if (!enabled) {
      if (displayedText !== text) {
        setDisplayedText(text);
        setIsComplete(true);
        animatedTextRef.current = text;
        isAnimationCompleteRef.current = true;
      }
      return;
    }

    // If THIS EXACT TEXT was already animated AND COMPLETED, show it immediately
    if (animatedTextRef.current === text && isAnimationCompleteRef.current) {
      setDisplayedText(text);
      setIsComplete(true);
      setTimeout(() => {
        onCompleteRef.current?.();
      }, 0);
      return;
    }

    // If text changed, reset
    if (animatedTextRef.current !== text) {
      animatedTextRef.current = text;
      isAnimationCompleteRef.current = false;
      currentIndexRef.current = 0;
      setDisplayedText("");
      setIsComplete(false);
    }

    // Start typewriter animation
    intervalRef.current = setInterval(() => {
      currentIndexRef.current += 1;

      if (currentIndexRef.current <= text.length) {
        setDisplayedText(text.substring(0, currentIndexRef.current));
      } else {
        // Animation complete
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsComplete(true);
        isAnimationCompleteRef.current = true;
        onCompleteRef.current?.();
      }
    }, speed);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, enabled]);

  return { displayedText, isComplete };
}
