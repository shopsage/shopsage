"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
  selected?: boolean;
}

interface FilterChipsProps {
  label: string;
  options: FilterOption[];
  onChange?: (value: string) => void;
  isLast?: boolean;
}

export function FilterChips({
  label,
  options,
  onChange,
  isLast = false,
}: FilterChipsProps) {
  const [otherText, setOtherText] = useState("");

  // Check if this is the "Other" group (for text input only)
  const isOtherGroup = label.toLowerCase() === "other";

  const handleOtherSubmit = () => {
    if (otherText.trim()) {
      onChange?.(otherText.trim());
    }
  };

  // If this is the "Other" group, just show a text input
  if (isOtherGroup) {
    return (
      <div
        className={cn(
          "flex items-center gap-4 px-4 py-3",
          !isLast && "border-b border-neutral-200/40"
        )}
      >
        {/* Label */}
        <span className="min-w-[60px] text-sm font-medium text-neutral-800">
          {label}
        </span>

        {/* Text input */}
        <input
          type="text"
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleOtherSubmit();
            }
          }}
          placeholder="Specify any other preferences..."
          className="
            flex-1
            rounded-md
            border
            border-neutral-200
            bg-white
            px-3
            py-1.5
            text-xs
            text-neutral-800
            placeholder:text-neutral-400
            focus:border-primary-500
            focus:outline-none
            focus:ring-2
            focus:ring-primary-500/20
          "
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3",
        !isLast && "border-b border-neutral-200/40"
      )}
    >
      {/* Label */}
      <span className="min-w-[60px] text-sm font-medium text-neutral-800">
        {label}
      </span>

      {/* Options */}
      <div className="flex gap-1 flex-wrap">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange?.(option.value)}
            className={cn(
              "whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200",
              option.selected
                ? "bg-primary-500 text-white shadow-primary"
                : "bg-neutral-200/60 text-neutral-500 hover:bg-neutral-200"
            )}
            style={
              option.selected
                ? { boxShadow: "0 2px 6px rgba(235, 94, 40, 0.2)" }
                : undefined
            }
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

