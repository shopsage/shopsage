import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { PhoneMockupWrapper } from "@/components/layout";
import { AuthProvider } from "@/hooks/use-auth";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "ShopSage",
  description: "AI-powered shopping assistant for Southeast Asia",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // enables env(safe-area-inset-*) on iPhone
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${playfairDisplay.variable} antialiased`}
      >
        <AuthProvider>
          <PhoneMockupWrapper>{children}</PhoneMockupWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
