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
        <div className="mx-auto w-full max-w-md">

          <button
            onClick={() => (document.getElementById("add-product-modal") as HTMLDialogElement)?.showModal()}
            className="
            mb-6
            flex
            w-full
            items-center
            gap-4
            rounded-[var(--radius-md)]
            border
            border-dashed
            border-neutral-300
            bg-surface-bg
            p-4
            transition-all
            duration-200
            hover:border-primary-500
            hover:bg-primary-50/50
          "
          >
            <div
              className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-primary-100
              text-primary-600
            "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-neutral-800">Track New Item</h3>
            </div>
          </button>

          <TrackingList items={trackedItems} onRemove={removeItem} />
        </div>
      </main>
      <AddProductModal onAdd={handleAddProduct} />
    </>
  );
}

