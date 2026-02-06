"use client";

import { ReactNode, useEffect, useState } from "react";

interface PhoneMockupWrapperProps {
  children: ReactNode;
}

export function PhoneMockupWrapper({ children }: PhoneMockupWrapperProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-neutral-100">
      {/* Custom CSS Frame */}
      <div
        className="
          relative
          box-content
          h-[800px]
          w-[375px]
          overflow-hidden
          rounded-[50px]
          border-[8px]
          border-[#1A1816]
          bg-[#F7F5F2]
          shadow-2xl
        "
        style={{
          boxShadow: "0 0 0 2px #333, 0 20px 40px -10px rgba(0,0,0,0.3)",
        }}
      >
        {/* Dynamic Island / Notch */}
        <div className="absolute left-1/2 top-[11px] z-50 h-[28px] w-[120px] -translate-x-1/2 rounded-full bg-black" />

        {/* Content Container */}
        <div className="relative h-full w-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
