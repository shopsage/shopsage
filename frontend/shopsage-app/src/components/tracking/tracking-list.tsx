"use client";

import { TrackingCard } from "./tracking-card";
import type { TrackedItem } from "@/lib/mock-data";
import { Package } from "lucide-react";

interface TrackingListProps {
  items: TrackedItem[];
  onRemove?: (id: string) => void;
  onSearch?: (title: string) => void;
}

export function TrackingList({ items, onRemove, onSearch }: TrackingListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="
            mb-4
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-neutral-200
          "
        >
          <Package className="h-8 w-8 text-neutral-500" strokeWidth={1.5} />
        </div>
        <h3 className="mb-2 text-base font-semibold text-neutral-800">
          No products tracked yet
        </h3>
        <p className="max-w-[240px] text-sm font-light text-neutral-500">
          Search for products and add them to your tracking list to monitor price changes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <TrackingCard item={item} onRemove={onRemove} onSearch={onSearch} />
        </div>
      ))}
    </div>
  );
}

