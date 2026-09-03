import { cn } from "@/lib/utils"

export function LoadingState({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 py-6", className)} aria-live="polite">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-16 overflow-hidden rounded-xl bg-muted">
          <div className="lab-shimmer h-full w-full" />
        </div>
      ))}
      <span className="sr-only">Loading</span>
    </div>
  )
}
