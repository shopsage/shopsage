import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopSage - Smart Shopping Research",
  description:
    "AI-powered product research and price tracking for Southeast Asian e-commerce",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
