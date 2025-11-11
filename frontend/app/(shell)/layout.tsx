"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { useUserStore } from "@/lib/stores/user.store";
import { getClient } from "@/lib/adapters";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useUserStore((state) => state.setUser);

  // Initialize user on mount
  useEffect(() => {
    const initUser = async () => {
      try {
        const client = getClient();
        const user = await client.whoAmI();
        setUser(user);
      } catch (error) {
        console.error("Failed to initialize user:", error);
      }
    };

    initUser();
  }, [setUser]);

  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
