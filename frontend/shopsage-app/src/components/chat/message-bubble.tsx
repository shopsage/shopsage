"use client";

import { useEffect } from "react";
import { ProductCarousel } from "@/components/product/product-carousel";
import { FilterChips } from "@/components/product/filter-chips";
import { PriceInput } from "@/components/product/price-input";
import { TrackingCard } from "@/components/tracking/tracking-card";
import type { DemoMessage, MessageContent, TrackedItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface MessageBubbleProps {
  message: DemoMessage;
  animationDelay?: number;
  onPreferenceChange?: (groupLabel: string, value: string) => void;
  onConfirmSelection?: () => void;
  onPriceConfirm?: (price: number) => void;
  onTrackProduct?: (product: TrackedItem) => void;
}

export function MessageBubble({
  message,
  animationDelay = 0,
  onPreferenceChange,
  onConfirmSelection,
  onPriceConfirm,
  onTrackProduct,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  const hasPreferences = message.content.some((c) => c.type === "preferences");

  return (
    <div
      className={cn(
        "animate-slide-up w-full",
        isUser ? "text-right" : "text-left"
      )}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div className={cn("flex flex-col gap-4", isUser ? "items-end" : "items-start")}>
        {message.content.map((content, index) => (
          <MessageContentRenderer
            key={index}
            content={content}
            isUser={isUser}
            onPreferenceChange={onPreferenceChange}
            onPriceConfirm={onPriceConfirm}
            onTrackProduct={onTrackProduct}
          />
        ))}

        {/* Confirm button for preference selections */}
        {hasPreferences && onConfirmSelection && (
          <button
            onClick={() => onConfirmSelection()}
            className="
              flex
              items-center
              gap-2
              rounded-lg
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
            <Check className="h-4 w-4" />
            Confirm
          </button>
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
}

function MessageContentRenderer({
  content,
  isUser,
  onPreferenceChange,
  onPriceConfirm,
  onTrackProduct,
}: MessageContentRendererProps) {
  switch (content.type) {
    case "text":
      return (
        <div
          className={cn(
            "text-[15px] leading-relaxed font-light",
            isUser
              ? "inline-block max-w-[85%] rounded-[20px_20px_4px_20px] bg-user-bubble px-4 py-3 text-left text-surface-bg shadow-card"
              : "max-w-full bg-transparent p-0 text-neutral-800"
          )}
          dangerouslySetInnerHTML={{ __html: content.text }}
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

