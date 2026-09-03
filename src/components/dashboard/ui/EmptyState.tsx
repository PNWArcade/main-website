import { cn } from "@/lib/utils"

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center", className)}>
      {icon ? <div className="mx-auto mb-3 text-muted-foreground">{icon}</div> : null}
      <p className="text-lg font-medium text-foreground">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
