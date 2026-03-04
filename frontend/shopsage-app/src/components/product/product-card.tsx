"use client";

import { Star } from "lucide-react";
import type { Product } from "@/lib/mock-data";

interface ProductCardProps {
  product: Product;
  onTrack?: (product: Product) => void;
}

export function ProductCard({ product, onTrack }: ProductCardProps) {
  return (
    <a
      href={product.url ?? undefined}
      target={product.url ? "_blank" : undefined}
      rel={product.url ? "noopener noreferrer" : undefined}
      className="
        block
        min-w-[260px]
        cursor-pointer
        rounded-[var(--radius-md)]
        border
        border-neutral-200/30
        bg-surface-card
        p-3
        transition-all
        duration-300
        active:scale-[0.98]
        no-underline
      "
      style={{
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Image Area */}
      <div className="relative mb-3 flex h-[140px] items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm border border-neutral-100">
        {/* Badge */}
        {product.badge && (
          <div
            className="
              glass
              absolute
              left-2
              top-2
              z-10
              rounded-md
              px-2
              py-1
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              text-primary-500
            "
            style={{
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            }}
          >
            {product.badge}
          </div>
        )}

        {/* Product Image or Placeholder */}
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <div
            className="
              relative
              h-[60%]
              w-[60%]
              rounded-full
              border-2
              border-neutral-600
              border-b-transparent
            "
          >
            <div className="absolute -left-1.5 bottom-0 h-5 w-3 rounded bg-neutral-600" />
            <div className="absolute -right-1.5 bottom-0 h-5 w-3 rounded bg-neutral-600" />
          </div>
        )}
      </div>

      {/* Title */}
      <h3
        className="
          mb-1
          line-clamp-2
          text-sm
          font-semibold
          leading-tight
          text-neutral-800
        "
      >
        {product.title}
      </h3>

      {/* Meta */}
      <div className="mt-2 flex items-end justify-between">
        <div>
          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-neutral-800">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs font-normal text-neutral-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-neutral-500">
            <Star className="h-3 w-3 fill-warning text-warning" />
            <span>{product.rating}</span>
            <span>({product.reviewCount})</span>
          </div>
        </div>

        {/* Platform */}
        <span className="text-[11px] font-normal tracking-wide text-neutral-500">
          {product.platform}
        </span>
      </div>

      {/* Optional Track Button */}
      {onTrack && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTrack(product);
          }}
          className="
            mt-3
            w-full
            rounded-lg
            bg-surface-bg
            px-3
            py-2.5
            text-[13px]
            font-semibold
            text-neutral-800
            transition-colors
            duration-200
            hover:bg-neutral-200
          "
        >
          Track Price
        </button>
      )}
    </a>
  );
}
