"use client";

import { Plus, ArrowUp } from "lucide-react";
import { KeyboardEvent } from "react";

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
}

export function Composer({
  value,
  onChange,
  onSend,
  placeholder = "Ask follow-up...",
}: ComposerProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="absolute bottom-[80px] left-0 right-0 z-40 px-4">
      <div
        className="
          flex
          items-center
          gap-3
          rounded-[var(--radius-pill)]
          border
          border-white/50
          bg-surface-float
          py-2
          pl-4
          pr-2
          transition-all
          duration-200
          focus-within:translate-y-[-2px]
          focus-within:border-primary-200
        "
        style={{
          boxShadow:
            "0 12px 32px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.02)",
        }}
      >
        {/* Attach Button */}
        <button
          type="button"
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            text-neutral-500
            transition-colors
            duration-200
            hover:bg-surface-bg
            hover:text-neutral-700
          "
          aria-label="Attach"
        >
          <Plus className="h-5 w-5" />
        </button>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="
            flex-1
            border-none
            bg-transparent
            text-base
            font-light
            text-neutral-800
            outline-none
            placeholder:text-neutral-500/70
          "
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={onSend}
          disabled={!value.trim()}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-primary-500
            text-white
            transition-all
            duration-200
            hover:scale-105
            hover:bg-primary-600
            disabled:opacity-50
            disabled:hover:scale-100
          "
          style={{
            boxShadow: "0 4px 12px rgba(235, 94, 40, 0.3)",
          }}
          aria-label="Send"
        >
          <ArrowUp className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

