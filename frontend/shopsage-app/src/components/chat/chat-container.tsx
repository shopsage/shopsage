"use client";

import { useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageBubble } from "./message-bubble";
import { ThinkingIndicator } from "./thinking-indicator";
import type { DemoMessage, TrackedItem, Product } from "@/lib/mock-data";

interface ChatContainerProps {
  messages: DemoMessage[];
  isTyping?: boolean;
  thinkingStage?: "researching" | "supplier-research" | "analyzing" | "finding-prices" | "comparing" | "general";
  onPreferenceChange?: (groupLabel: string, value: string) => void;
  onConfirmSelection?: () => void;
  onPriceConfirm?: (price: number) => void;
  onTrackProduct?: (product: TrackedItem) => void;
  onProductSearch?: (productName: string) => void;
  onSaveProduct?: (query: string, products: Product[]) => void;
  isProductSaved?: (name: string) => boolean;
  isLoadedChat?: boolean;
}

export function ChatContainer({
  messages,
  isTyping,
  thinkingStage = "general",
  onPreferenceChange,
  onConfirmSelection,
  onPriceConfirm,
  onTrackProduct,
  onProductSearch,
  onSaveProduct,
  isProductSaved,
  isLoadedChat = false,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const userHasScrolledUp = useRef(false);

  // Track whether the user has manually scrolled away from the bottom
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    userHasScrolledUp.current = distanceFromBottom > 150;
  }, []);

  // Auto-scroll to bottom only when the user hasn't scrolled up
  useEffect(() => {
    if (scrollRef.current && !userHasScrolledUp.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const handleScrollToBottom = (options?: { force?: boolean; behavior?: ScrollBehavior }) => {
    if (scrollRef.current && !userHasScrolledUp.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: options?.behavior || "instant",
      });
    }
  };

  return (
    <main
      ref={scrollRef}
      onScroll={handleScroll}
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
        pt-[120px]
        relative
      "
    >
      {messages.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center -mt-16">
          <h2 className="px-8 text-3xl text-neutral-800" style={{ fontFamily: 'var(--font-serif)' }}>
            What are we looking for today?
          </h2>
        </div>
      )}

      <AnimatePresence mode="popLayout" initial={false}>
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            animationDelay={index * 0.1}
            onPreferenceChange={onPreferenceChange}
            onConfirmSelection={onConfirmSelection}
            onPriceConfirm={onPriceConfirm}
            onTrackProduct={onTrackProduct}
            onProductSearch={onProductSearch}
            onSaveProduct={onSaveProduct}
            isProductSaved={isProductSaved}
            enableTypewriter={!isLoadedChat && index === messages.length - 1 && message.role === "assistant"}
            onScrollToBottom={handleScrollToBottom}
          />
        ))}

        {isTyping && (
          <motion.div
            key="thinking-indicator"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <ThinkingIndicator stage={thinkingStage} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

