import type { Metadata } from "next"
import { Exo, Roboto_Mono } from "next/font/google"
import "./globals.css"

import { NavbarWrapper } from "@/components/layout/navbar/NavbarWrapper"
import { Footer } from "@/components/layout/Footer/Footer"
import { FooterWrapper } from "@/components/layout/Footer/FooterWrapper"
import { QueryProvider } from "@/providers/QueryProvider"
import { MotionPreferences } from "@/components/motion/MotionPreferences"

const exo = Exo({
  variable: "--font-exo",
  subsets: ["latin"],
})

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ARCADE PNW | Purdue Northwest",
  description:
    "Advancing mechanical and aeronautical engineering at Purdue University Northwest through student led innovation and collaboration.",
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
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${exo.variable} ${robotoMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          <MotionPreferences>
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>
            <NavbarWrapper />
            <main id="main-content">{children}</main>
            <FooterWrapper>
              <Footer />
            </FooterWrapper>
          </MotionPreferences>
        </QueryProvider>
      </body>
    </html>
  )
}
