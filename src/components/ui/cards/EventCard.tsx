import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { PnwEvent } from "@/lib/pnw-events"
import { cn } from "@/lib/utils"

export function EventCard({
  event,
  className,
}: {
  event: PnwEvent
  className?: string
}) {
  return (
    <Link
      href={event.eventUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group lift lab-plate overflow-hidden rounded-2xl hover:border-purdue-gold/40",
        className
      )}
    >
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {event.eventPicture ? (
          <Image
            src={event.eventPicture}
            alt={event.eventName}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
            No image available
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-purdue-gold">
            {event.eventName}
          </h3>
          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
        {event.eventDates ? (
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            {event.eventDates}
          </p>
        ) : null}
        {event.eventLocation ? (
          <p className="mt-1 text-sm text-muted-foreground">{event.eventLocation}</p>
        ) : null}
      </div>
    </Link>
  )
}
