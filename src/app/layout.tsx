// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

// Define metadata for the application
export const metadata: Metadata = {
  title: "Spare Parts Quotation Service",
  description: "Request quotations for spare parts",
};

// Root layout component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Clerk authentication provider wrapper */}
        <ClerkProvider>
          {/* Main content */}
          {children}

          {/* Toast notifications component */}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              duration: 5000,
            }}
          />
        </ClerkProvider>
      </body>
    </html>
  );
}