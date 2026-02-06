"use client";

import { Search, BarChart3, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Search;
}

const navItems: NavItem[] = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/tracking", label: "Tracking", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="
        glass
        absolute
        bottom-0
        left-0
        right-0
        z-50
        flex
        h-[85px]
        items-center
        justify-around
        border-t
        border-neutral-200/30
        pb-[25px]
      "
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all duration-300",
              isActive
                ? "text-primary-500"
                : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            <Icon
              className="h-6 w-6"
              strokeWidth={isActive ? 2.5 : 1.5}
            />
            <span
              className={cn(
                "text-[10px] font-semibold tracking-wide",
                isActive && "text-primary-500"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

