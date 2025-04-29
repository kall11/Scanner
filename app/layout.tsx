import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Mona_Sans as FontSans } from "next/font/google"

import { cn } from "@/lib/utils"
import { Toaster } from "@/components/toaster"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Web Barcode Scanner",
  description: "Scan multiple barcodes and save them for later use",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
