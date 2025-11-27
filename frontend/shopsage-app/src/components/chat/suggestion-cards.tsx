"use client";

import { Sparkles } from "lucide-react";

interface SuggestionCard {
  text: string;
}

const suggestions: SuggestionCard[] = [
  {
    text: "Find me the best noise cancelling headphones",
  },
  {
    text: "What's the cheapest gaming laptop?",
  },
  {
    text: "I'm looking for a smartwatch under $200",
  },
  {
    text: "Show me deals on wireless earbuds",
  },
];

interface SuggestionCardsProps {
  onSuggestionClick?: (text: string) => void;
}

export function SuggestionCards({ onSuggestionClick }: SuggestionCardsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5 px-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Suggestions</span>
      </div>
      <div className="hide-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick?.(suggestion.text)}
            className="
              flex-shrink-0
              max-w-[180px]
              rounded-[var(--radius-md)]
              border
              border-neutral-200/50
              bg-surface-card
              px-4
              py-3
              text-left
              transition-all
              duration-200
              hover:border-primary-300
              hover:shadow-card
              active:scale-[0.98]
            "
          >
            <span className="text-sm font-medium leading-snug text-neutral-800">
              {suggestion.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
