import Image from "next/image"
import { PageContainer } from "@/components/layout/PageContainer"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16 text-foreground">
      <div className="lab-grid pointer-events-none absolute inset-0 opacity-25" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(207,185,145,0.16),transparent_55%)]" />
      <PageContainer className="relative z-10 flex max-w-md flex-col items-center">
        <Image
          src="/arcade.png"
          alt="Arcade PNW"
          width={160}
          height={48}
          className="mb-8 h-12 w-auto"
          style={{ width: "auto", height: "auto" }}
        />
        {children}
      </PageContainer>
    </div>
  )
}
