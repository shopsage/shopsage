"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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

export function ThinkingIndicator({ stage = "general" }: ThinkingIndicatorProps) {
  const [message, setMessage] = useState(THINKING_MESSAGES[stage]);
  const showText = stage === "researching";

  useEffect(() => {
    setMessage(THINKING_MESSAGES[stage]);
  }, [stage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-3 text-left"
    >
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-primary-400"
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      {showText && (
        <span className="text-sm font-medium text-neutral-500">{message}</span>
      )}
    </motion.div>
  );
}
