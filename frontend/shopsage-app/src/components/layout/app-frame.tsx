"use client";

import { ReactNode } from "react";

interface AppFrameProps {
  children: ReactNode;
}

export function AppFrame({ children }: AppFrameProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-surface-bg">
      <div
        className="
          relative
          flex
          h-full
          w-full
          flex-col
          overflow-hidden
        "
        style={{
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

