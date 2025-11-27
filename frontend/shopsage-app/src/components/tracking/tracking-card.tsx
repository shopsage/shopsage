"use client";

import { Star, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrackedItem } from "@/lib/mock-data";

interface TrackingCardProps {
  item: TrackedItem;
  onRemove?: (id: string) => void;
  isCompact?: boolean;
  showBadge?: boolean;
}

export function TrackingCard({
  item,
  onRemove,
  isCompact = false,
  showBadge = false,
}: TrackingCardProps) {
  const priceDiff = item.currentPrice - item.targetPrice;
  const isAtTarget = priceDiff <= 0;

  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-neutral-200/30 bg-surface-card transition-all duration-300",
        isCompact ? "min-w-[220px] p-3" : "p-4"
      )}
      style={{
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Badge */}
      {showBadge && (
        <div
          className="
            mb-2
            inline-block
            rounded-md
            bg-success-bg
            px-2
            py-1
            text-[10px]
            font-bold
            uppercase
            tracking-wide
            text-success
          "
        >
          Tracking Active
        </div>
      )}

      {/* Image Area (Compact) */}
      {isCompact && (
        <div
          className="
            mb-3
            flex
            h-[100px]
            items-center
            justify-center
            rounded-xl
            bg-surface-bg
          "
        >
          <div
            className="
              relative
              h-[60%]
              w-[60%]
              scale-[0.8]
              rounded-full
              border-2
              border-neutral-600
              border-b-transparent
            "
          >
            <div className="absolute -left-1.5 bottom-0 h-5 w-3 rounded bg-neutral-600" />
            <div className="absolute -right-1.5 bottom-0 h-5 w-3 rounded bg-neutral-600" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className={cn("flex", !isCompact && "gap-4")}>
        {/* Image (Non-Compact) */}
        {!isCompact && (
          <div
            className="
              flex
              h-16
              w-16
              flex-shrink-0
              items-center
              justify-center
              rounded-xl
              bg-surface-bg
            "
          >
            <div
              className="
                relative
                h-[70%]
                w-[70%]
                rounded-full
                border-2
                border-neutral-600
                border-b-transparent
              "
            >
              <div className="absolute -left-1 bottom-0 h-3 w-2 rounded-sm bg-neutral-600" />
              <div className="absolute -right-1 bottom-0 h-3 w-2 rounded-sm bg-neutral-600" />
            </div>
          </div>
        )}

        {/* Details */}
        <div className={cn("flex-1", isCompact && "")}>
          <h3
            className={cn(
              "font-semibold text-neutral-800",
              isCompact ? "text-sm" : "text-base"
            )}
          >
            {item.title}
          </h3>

          {!isCompact && (
            <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span>{item.rating}</span>
              <span>({item.reviewCount})</span>
              <span className="mx-1">·</span>
              <span>{item.platform}</span>
            </div>
          )}

          {/* Price Info */}
          <div className={cn("flex items-end justify-between", isCompact ? "mt-2" : "mt-3")}>
            <div className="text-base font-bold text-neutral-800">
              ${item.currentPrice}
            </div>
            <div
              className={cn(
                "text-[11px] font-semibold",
                isAtTarget ? "text-success" : "text-success"
              )}
            >
              Target: ${item.targetPrice}
            </div>
          </div>

          {/* Actions (Non-Compact) */}
          {!isCompact && onRemove && (
            <div className="mt-3 flex gap-2">
              <button
                className="
                  flex
                  flex-1
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  bg-surface-bg
                  py-2
                  text-[13px]
                  font-semibold
                  text-neutral-800
                  transition-colors
                  duration-200
                  hover:bg-neutral-200
                "
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View
              </button>
              <button
                onClick={() => onRemove(item.id)}
                className="
                  flex
                  items-center
                  justify-center
                  rounded-lg
                  bg-error-bg
                  px-3
                  py-2
                  text-error
                  transition-colors
                  duration-200
                  hover:bg-error/10
                "
                aria-label="Remove from tracking"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* View Button (Compact) */}
          {isCompact && (
            <button
              className="
                mt-3
                w-full
                rounded-lg
                bg-surface-bg
                py-2.5
                text-[13px]
                font-semibold
                text-neutral-800
                transition-colors
                duration-200
                hover:bg-neutral-200
              "
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

