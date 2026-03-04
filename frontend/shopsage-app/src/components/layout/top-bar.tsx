"use client";

import { Menu, Wifi } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Surface background color (#F7F5F2 = --ss-neutral-100)
const SURFACE_BG = "#F7F5F2";

export function TopBar() {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState("9:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMenuClick = () => {
    if (pathname === "/search") {
      window.dispatchEvent(new CustomEvent("shopsage:back-to-list"));
    }
  };

  return (
    <header
      className="absolute left-0 right-0 top-0 z-50 flex flex-col pointer-events-none"
      style={{
        background: `linear-gradient(to bottom, ${SURFACE_BG} 0%, ${SURFACE_BG} 62%, rgba(247,245,242,0) 100%)`,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Status Bar Row — only visible inside desktop phone mockup, hidden on real mobile */}
      <div className="hidden md:flex pointer-events-auto items-center justify-between px-6 pt-3 pb-2 text-[15px] font-semibold text-neutral-900">
        <div className="flex items-center gap-1 pl-2">
          <span className="font-semibold tracking-tight">{currentTime}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Signal Bars */}
          <div className="flex items-end gap-[2px] h-[14px]">
            <div className="h-[5px] w-[3px] rounded-[1px] bg-neutral-900" />
            <div className="h-[8px] w-[3px] rounded-[1px] bg-neutral-900" />
            <div className="h-[11px] w-[3px] rounded-[1px] bg-neutral-900" />
            <div className="h-[14px] w-[3px] rounded-[1px] bg-neutral-900" />
          </div>

          {/* WiFi Icon */}
          <Wifi className="h-[17px] w-[17px] text-neutral-900" strokeWidth={3} />

          {/* Battery */}
          <div className="relative flex items-center">
            <div className="flex h-[13px] w-[25px] items-center justify-center rounded-[3px] bg-neutral-900/30 border-[1.5px] border-neutral-900/40">
              <div className="h-full w-full rounded-[1.5px] bg-neutral-900" />
            </div>
            <div className="absolute -right-[2px] h-[4px] w-[2px] rounded-r-[1px] bg-neutral-400/80" />
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="pointer-events-auto flex items-center justify-between px-6 pb-3 pt-2">
        {/* Hamburger — goes back to chat list on /search, hidden elsewhere */}
        <button
          onClick={handleMenuClick}
          className={`
            -ml-2 rounded-lg p-2
            transition-colors duration-200
            hover:bg-neutral-200/50
            ${pathname !== "/search" ? "invisible pointer-events-none" : ""}
          `}
          aria-label="Back to chats"
        >
          <Menu className="h-6 w-6 text-neutral-800" strokeWidth={1.5} />
        </button>

        {/* Brand — centered */}
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
          <span
            className="font-serif text-[22px] font-semibold tracking-tight text-neutral-800"
            style={{ letterSpacing: "-0.02em" }}
          >
            ShopSage
          </span>
        </div>

        {/* Spacer */}
        <div className="w-6" />
      </div>

      {/* Gradient fade zone — not interactive, creates the scroll-under effect */}
      <div className="h-8 pointer-events-none" />
    </header>
  );
}
