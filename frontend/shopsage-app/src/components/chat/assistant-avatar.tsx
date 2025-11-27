"use client";

import { ShoppingBag } from "lucide-react";

export function AssistantAvatar() {
  return (
    <div
      className="
        flex
        h-7
        w-7
        items-center
        justify-center
        rounded-lg
        bg-primary-500
      "
      style={{
        boxShadow: "0 4px 8px rgba(235, 94, 40, 0.25)",
      }}
    >
      <ShoppingBag className="h-4 w-4 text-white" />
    </div>
  );
}

