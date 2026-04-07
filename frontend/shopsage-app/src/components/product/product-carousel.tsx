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
    <div className="mt-3 flex flex-col gap-2">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.35, ease: "easeOut" }}
        >
          <ProductCard product={product} onTrack={onTrack} />
        </motion.div>
      ))}
    </div>
  );
}
