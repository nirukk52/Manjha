import "@/styles/globals.css"
import { Metadata } from "next"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: {
    default: "Manjha - Trading Journal",
    template: `%s - Manjha`,
  },
  description: "Chat-driven trading journal with mental models and portfolio analytics",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d4d4d8" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
  icons: {
    icon: "/favicon.ico",
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        {children}
      </body>
    </html>
  )
}
