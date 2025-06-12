import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "LET ME COOK - Admin Dashboard",
  description: "Admin dashboard for cooking recipe management",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
