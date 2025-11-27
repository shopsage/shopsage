"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { ThinkingIndicator } from "./thinking-indicator";
import type { DemoMessage, TrackedItem } from "@/lib/mock-data";

interface ChatContainerProps {
  messages: DemoMessage[];
  isTyping?: boolean;
  thinkingStage?: "researching" | "analyzing" | "finding-prices" | "comparing" | "general";
  onPreferenceChange?: (groupLabel: string, value: string) => void;
  onConfirmSelection?: () => void;
  onPriceConfirm?: (price: number) => void;
  onTrackProduct?: (product: TrackedItem) => void;
}

export function ChatContainer({
  messages,
  isTyping,
  thinkingStage = "general",
  onPreferenceChange,
  onConfirmSelection,
  onPriceConfirm,
  onTrackProduct,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const handleScrollToBottom = (options?: { force?: boolean; behavior?: ScrollBehavior }) => {
    if (scrollRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = scrollRef.current;

      // If force is true, use a larger threshold (e.g., 1000px) to account for large content appearing
      // Otherwise use strict 100px threshold for typing
      const threshold = options?.force ? 1000 : 100;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < threshold;

      if (isNearBottom) {
        scrollRef.current.scrollTo({
          top: scrollHeight,
          behavior: options?.behavior || "instant",
        });
      }
    }
  };

  return (
    <main
      ref={scrollRef}
      className="
        hide-scrollbar
        flex
        flex-1
        flex-col
        gap-6
        overflow-y-auto
        scroll-smooth
        px-4
        pb-[160px]
        pt-[80px]
        relative
      "
    >
      {messages.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h2 className="px-8 text-3xl text-neutral-800" style={{ fontFamily: 'var(--font-serif)' }}>
            What are we looking for today?
          </h2>
        </div>
      )}

      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          animationDelay={index * 0.1}
          onPreferenceChange={onPreferenceChange}
          onConfirmSelection={onConfirmSelection}
          onPriceConfirm={onPriceConfirm}
          onTrackProduct={onTrackProduct}
          enableTypewriter={index === messages.length - 1 && message.role === "assistant"}
          onScrollToBottom={handleScrollToBottom}
        />
      ))}

      {isTyping && <ThinkingIndicator stage={thinkingStage} />}
    </main>
  );
}

