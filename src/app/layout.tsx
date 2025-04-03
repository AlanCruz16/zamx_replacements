import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { LayoutProvider } from "@/components/providers/LayoutProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Spare Parts Quotation Service",
  description: "Request quotations for spare parts",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutProvider>
          {children}
        </LayoutProvider>

        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            duration: 5000,
          }}
        />
      </body>
    </html>
  )
}