"use client";

import { ProductCard } from "./product-card";
import type { Product } from "@/lib/mock-data";

interface ProductCarouselProps {
  products: Product[];
  onTrack?: (product: Product) => void;
}

export function ProductCarousel({ products, onTrack }: ProductCarouselProps) {
  return (
    <div
      className="
        hide-scrollbar
        -ml-1
        mt-4
        flex
        gap-3
        overflow-x-auto
        p-1
        pb-4
      "
      style={{
        scrollSnapType: "x mandatory",
      }}
    >
      {products.map((product) => (
        <div
          key={product.id}
          style={{ scrollSnapAlign: "center" }}
        >
          <ProductCard product={product} onTrack={onTrack} />
        </div>
      ))}
    </div>
  );
}

