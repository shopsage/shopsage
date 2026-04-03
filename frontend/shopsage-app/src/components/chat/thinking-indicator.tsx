"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ThinkingStage =
  | "researching"
  | "supplier-research"
  | "analyzing"
  | "finding-prices"
  | "comparing"
  | "general";

interface ThinkingIndicatorProps {
  stage?: ThinkingStage;
}

const STAGE_MESSAGES: Record<ThinkingStage, string[]> = {
  researching: [
    "Scanning product listings...",
    "Reading customer reviews...",
    "Comparing specs across retailers...",
    "Finding the best options for you...",
    "Almost there — worth the wait!",
  ],
  "supplier-research": [
    "Searching verified suppliers...",
    "Checking supplier ratings & history...",
    "Comparing wholesale prices...",
    "Verifying stock availability...",
    "Pulling it all together...",
  ],
  "finding-prices": [
    "Scanning prices across platforms...",
    "Checking for active promotions...",
    "Comparing deals in real-time...",
    "Looking for hidden discounts...",
  ],
  comparing: [
    "Comparing your options...",
    "Analysing the key differences...",
    "Weighing up the trade-offs...",
    "Finding the best fit for you...",
  ],
  analyzing: [
    "Reviewing your preferences...",
    "Mapping out the best match...",
    "Putting it all together...",
  ],
  general: [
    "Thinking...",
    "Working on it...",
    "Just a moment...",
  ],
};

export function ThinkingIndicator({ stage = "general" }: ThinkingIndicatorProps) {
  const messages = STAGE_MESSAGES[stage];
  const [index, setIndex] = useState(0);

  // Reset index when stage changes
  useEffect(() => {
    setIndex(0);
  }, [stage]);

  // Cycle through messages
  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-3 text-left"
    >
      <div className="flex gap-1.5 shrink-0">
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
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="text-sm font-medium text-neutral-400"
        >
          {messages[index]}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}
