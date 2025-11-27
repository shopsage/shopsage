"use client";

import { useEffect, useState, useCallback } from "react";
import { ProductCarousel } from "@/components/product/product-carousel";
import { FilterChips } from "@/components/product/filter-chips";
import { PriceInput } from "@/components/product/price-input";
import { TrackingCard } from "@/components/tracking/tracking-card";
import { useTypewriter } from "@/hooks/use-typewriter";
import type { DemoMessage, MessageContent, TrackedItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: DemoMessage;
  animationDelay?: number;
  onPreferenceChange?: (groupLabel: string, value: string) => void;
  onConfirmSelection?: () => void;
  onPriceConfirm?: (price: number) => void;
  onTrackProduct?: (product: TrackedItem) => void;
  enableTypewriter?: boolean;
  onScrollToBottom?: (options?: { force?: boolean; behavior?: ScrollBehavior }) => void;
}

export function MessageBubble({
  message,
  animationDelay = 0,
  onPreferenceChange,
  onConfirmSelection,
  onPriceConfirm,
  onTrackProduct,
  enableTypewriter = false,
  onScrollToBottom,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [contentVisibility, setContentVisibility] = useState<boolean[]>(() => {
    if (message.content.length > 0) {
      const initial = new Array(message.content.length).fill(false);
      initial[0] = true;
      return initial;
    }
    return [];
  });

  const hasPreferences = message.content.some((c) => c.type === "preferences");

  const handleContentComplete = useCallback((index: number) => {
    setContentVisibility((prev) => {
      const next = [...prev];
      if (index + 1 < next.length) {
        next[index + 1] = true;
      }
      return next;
    });
  }, []);



  return (
    <div
      className={cn(
        "animate-slide-up w-full",
        isUser ? "text-right" : "text-left"
      )}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div className={cn("flex flex-col gap-3", isUser ? "items-end" : "items-start")}>
        {message.content.map((content, index) => (
          <div
            key={index}
            className={cn(
              "w-full transition-all duration-500",
              contentVisibility[index] || !enableTypewriter || isUser
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            )}
          >
            <MessageContentRenderer
              content={content}
              isUser={isUser}
              onPreferenceChange={onPreferenceChange}
              onPriceConfirm={onPriceConfirm}
              onTrackProduct={onTrackProduct}
              enableTypewriter={enableTypewriter}
              onContentComplete={() => handleContentComplete(index)}
              onScrollToBottom={onScrollToBottom}
              isVisible={contentVisibility[index] || !enableTypewriter || isUser}
            />
          </div>
        ))}

        {/* Confirm button for preference selections */}
        {hasPreferences && onConfirmSelection && (
          <div
            className={cn(
              "transition-all duration-500",
              contentVisibility[message.content.length - 1]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            )}
          >
            <button
              onClick={() => onConfirmSelection()}
              className="
                flex
                items-center
                gap-2
                rounded-md
                bg-primary-500
                px-4
                py-2
                text-sm
                font-medium
                text-white
                transition-all
                duration-200
                hover:bg-primary-600
                active:scale-95
              "
              style={{ boxShadow: "0 2px 8px rgba(235, 94, 40, 0.3)" }}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface MessageContentRendererProps {
  content: MessageContent;
  isUser: boolean;
  onPreferenceChange?: (groupLabel: string, value: string) => void;
  onPriceConfirm?: (price: number) => void;
  onTrackProduct?: (product: TrackedItem) => void;
  enableTypewriter?: boolean;
  onContentComplete?: () => void;
  onScrollToBottom?: (options?: { force?: boolean; behavior?: ScrollBehavior }) => void;
  isVisible?: boolean;
}

function MessageContentRenderer({
  content,
  isUser,
  onPreferenceChange,
  onPriceConfirm,
  onTrackProduct,
  enableTypewriter = false,
  onContentComplete,
  onScrollToBottom,
  isVisible = true,
}: MessageContentRendererProps) {
  // Trigger scroll when non-text content becomes visible
  useEffect(() => {
    if (isVisible && content.type !== "text") {
      // Small delay to allow the element to render/expand before scrolling
      const timer = setTimeout(() => {
        onScrollToBottom?.({ force: true, behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, content.type, onScrollToBottom]);

  // For non-text content, we need to manually trigger completion
  // so the next item in the message can be shown
  useEffect(() => {
    // Only trigger completion if we are actually visible!
    if (isVisible && content.type !== "text" && onContentComplete) {
      const timer = setTimeout(() => {
        onContentComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [content.type, onContentComplete, isVisible]);

  // Defer rendering until visible to ensure animations (like typewriter)
  // start exactly when the item appears, not before.
  if (!isVisible) {
    return null;
  }

  switch (content.type) {
    case "text":
      return (
        <TypewriterText
          text={content.text}
          isUser={isUser}
          enableTypewriter={enableTypewriter && !isUser}
          onComplete={onContentComplete}
          onScrollToBottom={onScrollToBottom}
        />
      );

    case "preferences":
      return (
        <div
          className="
            w-fit
            max-w-[90%]
            rounded-[var(--radius-md)]
            bg-surface-card
            p-1
            shadow-card
          "
        >
          {content.options.map((group, groupIndex) => (
            <FilterChips
              key={groupIndex}
              label={group.label}
              options={group.options}
              onChange={(value) => onPreferenceChange?.(group.label, value)}
              isLast={groupIndex === content.options.length - 1}
            />
          ))}
        </div>
      );

    case "products":
      return (
        <div className="w-full">
          <ProductCarousel products={content.products} />
        </div>
      );

    case "priceInput":
      return (
        <PriceInput
          defaultValue={content.currentPrice}
          onConfirm={onPriceConfirm}
        />
      );

    case "trackingConfirmation":
      return (
        <TrackingConfirmation
          product={content.product}
          onTrackProduct={onTrackProduct}
        />
      );

    default:
      return null;
  }
}

interface TypewriterTextProps {
  text: string;
  isUser: boolean;
  enableTypewriter: boolean;
  onComplete?: () => void;
  onScrollToBottom?: (options?: { force?: boolean; behavior?: ScrollBehavior }) => void;
}

function TypewriterText({ text, isUser, enableTypewriter, onComplete, onScrollToBottom }: TypewriterTextProps) {
  // We need to handle HTML tags for the typewriter effect.
  // Strategy:
  // 1. If typewriter is disabled, just render the HTML.
  // 2. If enabled, we strip tags for the *animation state* calculation,
  //    but we need to reconstruct the HTML for display.
  //    Actually, a simpler approach for now to fix the "chunk of text" issue
  //    is to replace <br> with newlines and strip other tags, OR use a library.
  //    Given the constraints, let's try to preserve newlines at least.

  // Better approach: Use the full text for display if not animating,
  // and if animating, we need a way to show partial HTML.
  // Since that's complex, let's just render the full HTML if animation is done/disabled.
  // If animating, we can show the plain text version (with newlines) growing.

  const [isDone, setIsDone] = useState(!enableTypewriter);

  // Convert <br> to newlines for the plain text version so we get paragraphs
  const plainText = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "");

  const { displayedText, isComplete } = useTypewriter({
    text: plainText,
    speed: 25, // Slower speed for better readability
    enabled: enableTypewriter,
    onComplete: () => {
      setIsDone(true);
      onComplete?.();
    },
  });

  // Trigger scroll when text updates
  useEffect(() => {
    if (enableTypewriter && !isComplete) {
      onScrollToBottom?.({ behavior: "instant" });
    }
  }, [displayedText, enableTypewriter, isComplete, onScrollToBottom]);

  // If user, or if animation is done, render the original HTML
  if (isUser || (!enableTypewriter) || (isComplete && isDone)) {
    return (
      <div
        className={cn(
          "text-[15px] leading-relaxed font-light",
          isUser
            ? "inline-block max-w-[85%] rounded-[20px_20px_4px_20px] bg-user-bubble px-4 py-3 text-left text-surface-bg shadow-card"
            : "max-w-full bg-transparent p-0 text-neutral-800"
        )}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  // While animating, render the plain text with preserved whitespace
  return (
    <div
      className={cn(
        "text-[15px] leading-relaxed font-light whitespace-pre-wrap",
        "max-w-full bg-transparent p-0 text-neutral-800"
      )}
    >
      {displayedText}
    </div>
  );
}

interface TrackingConfirmationProps {
  product: TrackedItem;
  onTrackProduct?: (product: TrackedItem) => void;
}

function TrackingConfirmation({ product, onTrackProduct }: TrackingConfirmationProps) {
  useEffect(() => {
    if (onTrackProduct) {
      onTrackProduct(product);
    }
  }, [product, onTrackProduct]);

  return (
    <div className="w-fit">
      <TrackingCard item={product} isCompact showBadge />
    </div>
  );
}

