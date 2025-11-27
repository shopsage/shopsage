"use client";

import { Menu } from "lucide-react";

import { usePathname } from "next/navigation";

export function TopBar() {
  const pathname = usePathname();
  const isTrackingPage = pathname === "/tracking";

  return (
    <header
      className="
        glass-light
        absolute
        left-0
        right-0
        top-0
        z-50
        flex
        items-center
        justify-between
        px-6
        py-4
      "
    >
      {/* Menu Button */}
      <button
        className={`
          -ml-2
          rounded-lg
          p-2
          transition-colors
          duration-200
          hover:bg-neutral-200/50
          focus-ring
          ${isTrackingPage ? "invisible pointer-events-none" : ""}
        `}
        aria-label="Menu"
        disabled={isTrackingPage}
      >
        <Menu className="h-6 w-6 text-neutral-800" strokeWidth={2} />
      </button>

      {/* Brand Logo - Centered */}
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
        <span
          className="font-serif text-[22px] font-semibold tracking-tight text-neutral-800"
          style={{ letterSpacing: "-0.02em" }}
        >
          ShopSage
        </span>
      </div>

      {/* Right Spacer for Balance */}
      <div className="w-6" />
    </header>
  );
}

