import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

// const geistSans = GeistSans({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// })

// const geistMono = GeistMono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased dark`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };