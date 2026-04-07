"use client";

import { Star } from "lucide-react";
import type { Product } from "@/lib/mock-data";

interface ProductCardProps {
  product: Product;
  onTrack?: (product: Product) => void;
}

export function ProductCard({ product, onTrack }: ProductCardProps) {
  const isCheapest = product.badge === "Cheapest";

  return (
    <a
      href={product.url ?? undefined}
      target={product.url ? "_blank" : undefined}
      rel={product.url ? "noopener noreferrer" : undefined}
      className="
        flex
        items-center
        gap-3
        rounded-[var(--radius-sm)]
        border
        border-neutral-200/30
        bg-surface-card
        p-2.5
        transition-all
        duration-200
        active:scale-[0.99]
        no-underline
      "
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Thumbnail */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-100 bg-white">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <div className="h-6 w-6 rounded-full border-2 border-neutral-400" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Line 1: Title */}
        <h3 className="truncate text-sm font-semibold leading-tight text-neutral-800">
          {product.title}
        </h3>

        {/* Line 2: Price · Rating · Seller · Cheapest tag */}
        <div className="mt-1 flex items-center gap-2 text-xs">
          {/* Price */}
          <span className="font-bold text-neutral-800">
            ${product.price}
          </span>

          {product.originalPrice && (
            <span className="text-neutral-400 line-through">
              ${product.originalPrice}
            </span>
          )}

          {/* Divider */}
          <span className="text-neutral-300">·</span>

          {/* Rating */}
          <span className="flex items-center gap-0.5 text-neutral-500">
            <Star className="h-3 w-3 fill-warning text-warning" />
            {product.rating}
          </span>

          {/* Divider */}
          <span className="text-neutral-300">·</span>

          {/* Seller */}
          <span className="truncate text-neutral-500">
            {product.platform}
          </span>

          {/* Spacer + Cheapest tag */}
          {isCheapest && (
            <>
              <span className="flex-1" />
              <span className="shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Cheapest
              </span>
            </>
          )}
        </div>
      </div>
    </a>
  );
}
