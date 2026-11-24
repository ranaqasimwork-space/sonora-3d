import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import SmoothScroll from "@/components/SmoothScroll"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SONORA — Hear What Matters",
  description:
    "SONORA Reference Headphones. Pure detail, all-day comfort, engineered to last. A new standard in personal audio.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SmoothScroll />
        {children}
      </body>
    </html>
  )
}