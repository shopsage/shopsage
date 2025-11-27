"use client";

import { TrackingList } from "@/components/tracking/tracking-list";
import { AddProductModal } from "@/components/tracking/add-product-modal";
import { useTracking } from "@/hooks/use-tracking";

export default function TrackingPage() {
  const { trackedItems, removeItem, addItem } = useTracking();

  const handleAddProduct = (url: string, targetPrice: number) => {
    // In a real app, this would fetch product details from the URL
    // For now, we'll just create a placeholder item
    addItem({
      id: `manual-${Date.now()}`,
      title: "Manually Added Product",
      price: targetPrice + 10,
      currentPrice: targetPrice + 10,
      targetPrice,
      rating: 0,
      reviewCount: "0",
      platform: "Manual",
    });
  };

  return (
    <>
      <main className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-[90px] pt-[80px]">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-neutral-800">Price Tracking</h1>
          <p className="mt-1 text-sm font-light text-neutral-500">
            Monitor your favorite products for price drops
          </p>
        </div>
        <TrackingList items={trackedItems} onRemove={removeItem} />
      </main>
      <AddProductModal onAdd={handleAddProduct} />
    </>
  );
}

