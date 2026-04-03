"use client";

import { motion } from "framer-motion";
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
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.15, duration: 0.5, ease: "easeOut" }}
          style={{ scrollSnapAlign: "center" }}
          className="flex flex-col"
        >
          {product.badge === "Cheapest" ? (
            <div className="mb-1.5 flex items-center gap-1.5 self-start rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
              <span>Cheapest</span>
            </div>
          ) : (
            /* Reserve the same height so all cards align */
            <div className="mb-1.5 h-[26px]" />
          )}
          <ProductCard product={product} onTrack={onTrack} />
        </motion.div>
      ))}
    </div>
  );
}
