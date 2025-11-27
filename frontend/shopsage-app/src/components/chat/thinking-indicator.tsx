"use client";

import { useEffect, useState } from "react";

interface ThinkingIndicatorProps {
  stage?: "researching" | "analyzing" | "finding-prices" | "comparing" | "general";
}

const THINKING_MESSAGES = {
  researching: "Researching products...",
  analyzing: "Analyzing options...",
  "finding-prices": "Finding best prices...",
  comparing: "Comparing deals...",
  general: "Thinking...",
};

const DOT_ANIMATION_DELAY = 0.2;

export function ThinkingIndicator({ stage = "general" }: ThinkingIndicatorProps) {
  const [message, setMessage] = useState(THINKING_MESSAGES[stage]);

  useEffect(() => {
    setMessage(THINKING_MESSAGES[stage]);
  }, [stage]);

  return (
    <div className="animate-slide-up flex items-center gap-3 text-left">
      <div className="flex gap-1.5">
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-primary-400"
          style={{ animationDelay: "0s", animationDuration: "1.5s" }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-primary-400"
          style={{ animationDelay: `${DOT_ANIMATION_DELAY}s`, animationDuration: "1.5s" }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-primary-400"
          style={{ animationDelay: `${DOT_ANIMATION_DELAY * 2}s`, animationDuration: "1.5s" }}
        />
      </div>
      <span className="text-sm font-medium text-neutral-500">{message}</span>
    </div>
  );
}
