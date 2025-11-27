"use client";

import { ReactNode } from "react";

interface AppFrameProps {
  children: ReactNode;
}

export function AppFrame({ children }: AppFrameProps) {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden">
      <div
        className="
          relative
          flex
          h-[var(--app-height)]
          w-full
          max-w-[var(--app-max-width)]
          flex-col
          overflow-hidden
          bg-surface-bg
          md:h-[850px]
          md:rounded-[40px]
          md:border-[8px]
          md:border-white
        "
        style={{
          boxShadow: "var(--shadow-4)",
          backgroundImage: `
            radial-gradient(circle at 100% 0%, rgba(235, 94, 40, 0.08) 0%, transparent 25%),
            radial-gradient(circle at 0% 100%, rgba(74, 124, 89, 0.05) 0%, transparent 30%)
          `,
        }}
      >
        {children}
      </div>
    </div>
  );
}

