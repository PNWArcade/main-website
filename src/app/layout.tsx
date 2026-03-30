import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

// 🧭 Import layout components
import { Navbar } from "@/components/layout/navbar/userNav/navbar"
import { Footer } from "@/components/layout/Footer/Footer"
import { QueryProvider } from "@/providers/QueryProvider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ASME PNW | Purdue Northwest",
  description:
    "Advancing mechanical engineering at Purdue University Northwest through student innovation and collaboration.",
  icons: {
    icon: "/favicon.ico",
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          <Navbar />
          <main className="min-h-[80vh]">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  )
}
