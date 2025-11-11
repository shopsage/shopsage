"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/lib/stores/user.store";

const navItems = [
  { href: "/search", label: "Search", icon: "🔍" },
  { href: "/tracking", label: "Tracking", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function Navbar() {
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);

  return (
    <nav className="bg-dark text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/search" className="flex items-center gap-2 font-bold text-lg">
            <span>🛍️</span>
            <span>ShopSage</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 px-3 py-2 rounded transition-colors ${
                  pathname.startsWith(item.href)
                    ? "bg-primary"
                    : "hover:bg-gray-700"
                }`}
              >
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User ID / Mobile Menu Placeholder */}
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-300">
              {user ? `ID: ${user.id.substring(0, 8)}` : "Loading..."}
            </div>
            {/* Mobile menu button (TODO) */}
            <button className="md:hidden p-2 hover:bg-gray-700 rounded">☰</button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-2 pb-3 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1 px-3 py-2 rounded text-sm whitespace-nowrap transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-primary"
                  : "hover:bg-gray-700"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
