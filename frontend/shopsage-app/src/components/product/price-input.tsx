"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface PriceInputProps {
  defaultValue?: number;
  onConfirm?: (price: number) => void;
}

export function PriceInput({ defaultValue = 0, onConfirm }: PriceInputProps) {
  const [value, setValue] = useState(defaultValue.toString());

  const handleConfirm = () => {
    const price = parseFloat(value);
    if (!isNaN(price) && price > 0) {
      onConfirm?.(price);
    }
  };

  return (
    <div
      className="
        mt-4
        flex
        w-fit
        items-center
        gap-1
        rounded-xl
        border
        border-primary-200/50
        bg-surface-card
        py-1.5
        pl-4
        pr-1.5
        transition-all
        duration-200
        hover:-translate-y-0.5
      "
      style={{
        boxShadow: "0 4px 12px rgba(235, 94, 40, 0.08)",
      }}
    >
      {/* Label */}
      <span className="mr-0.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Target
      </span>

      {/* Currency */}
      <span className="text-lg font-medium text-neutral-500">$</span>

      {/* Input */}
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="
          w-[50px]
          border-none
          bg-transparent
          p-0
          text-lg
          font-semibold
          text-neutral-800
          outline-none
          [appearance:textfield]
          [&::-webkit-inner-spin-button]:appearance-none
          [&::-webkit-outer-spin-button]:appearance-none
        "
      />

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        className="
          ml-2
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          bg-primary-500
          text-white
          transition-colors
          duration-200
          hover:bg-primary-600
        "
        aria-label="Set Price"
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </button>
    </div>
  );
}

