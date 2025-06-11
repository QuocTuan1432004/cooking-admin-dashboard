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
      <body className="bg-gray-50 flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-[280px] p-8 max-lg:ml-[70px] max-md:ml-0">
          {children}
        </main>
      </body>
    </html>
  );
}
