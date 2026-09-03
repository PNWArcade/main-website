import { cn } from "@/lib/utils"

const variants: Record<string, string> = {
  draft: "bg-purdue-gold/15 text-purdue-gold",
  published: "bg-emerald-500/15 text-emerald-300",
  archived: "bg-white/8 text-muted-foreground",
  new: "bg-sky-500/15 text-sky-300",
  in_progress: "bg-purdue-gold/15 text-purdue-gold",
  resolved: "bg-emerald-500/15 text-emerald-300",
  pending: "bg-purdue-gold/15 text-purdue-gold",
  accepted: "bg-emerald-500/15 text-emerald-300",
  expired: "bg-white/8 text-muted-foreground",
  default: "bg-white/8 text-muted-foreground",
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string
  label?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        variants[status] || variants.default,
        className
      )}
    >
      {label || status.replace("_", " ")}
    </span>
  )
}
