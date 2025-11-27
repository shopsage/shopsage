"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import type { DemoMessage, TrackedItem } from "@/lib/mock-data";

interface ChatContainerProps {
  messages: DemoMessage[];
  isTyping?: boolean;
  onPreferenceChange?: (groupLabel: string, value: string) => void;
  onConfirmSelection?: () => void;
  onPriceConfirm?: (price: number) => void;
  onTrackProduct?: (product: TrackedItem) => void;
}

export function ChatContainer({
  messages,
  isTyping,
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
        />
      ))}

      {isTyping && (
        <div className="animate-slide-up text-left">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-400" style={{ animationDelay: "0s" }} />
              <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-400" style={{ animationDelay: "0.2s" }} />
              <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-400" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

