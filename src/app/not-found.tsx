import Link from "next/link"
import { Button } from "@/components/ui/buttons/Button"

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="lab-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative">
        <p className="font-mono text-xs tracking-[0.3em] text-purdue-gold uppercase">Signal lost</p>
        <h1 className="mt-4 text-7xl font-semibold tracking-tight text-foreground">404</h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          The page you’re looking for doesn’t exist. It might’ve been moved, deleted, or maybe you followed a bad link.
        </p>
        <Button asChild size="lg" className="mt-8 rounded-full">
          <Link href="/">Back to Home</Link>
        </Button>
        <p className="mt-8 font-mono text-xs text-muted-foreground">Purdue Northwest ARCADE</p>
      </div>
    </div>
  )
}
