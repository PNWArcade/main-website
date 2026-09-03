import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type SponsorRecord = {
  id: string
  name: string
  logo_url?: string | null
  description?: string | null
  link?: string | null
  tier?: string | null
}

const TIER_COPY: Record<string, string> = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
}

function SponsorPlate({ sponsor, size }: { sponsor: SponsorRecord; size: "lg" | "md" | "sm" }) {
  const dimensions = {
    lg: { width: 200, height: 100, max: "max-w-md" },
    md: { width: 150, height: 75, max: "max-w-sm" },
    sm: { width: 120, height: 60, max: "max-w-xs" },
  }[size]

  const inner = (
    <div className={cn("lab-plate relative h-full w-full rounded-2xl p-5", dimensions.max)}>
      {sponsor.link ? (
        <ArrowUpRight className="absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
      ) : null}
      <div className="flex flex-col items-center text-center">
        {sponsor.logo_url ? (
          <Image
            src={sponsor.logo_url}
            alt={sponsor.name}
            width={dimensions.width}
            height={dimensions.height}
            unoptimized
            className="mb-3 object-contain"
          />
        ) : (
          <div className="mb-3 flex h-16 w-40 items-center justify-center rounded bg-muted font-mono text-xs text-muted-foreground">
            {sponsor.name}
          </div>
        )}
        <p className="font-medium text-foreground">{sponsor.name}</p>
        {sponsor.description ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{sponsor.description}</p>
        ) : null}
      </div>
    </div>
  )

  if (sponsor.link) {
    return (
      <a
        href={sponsor.link}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("block w-full", dimensions.max)}
      >
        {inner}
      </a>
    )
  }

  return <div className={cn("w-full", dimensions.max)}>{inner}</div>
}

export function SponsorTierGrid({
  sponsors,
}: {
  sponsors: {
    platinum: SponsorRecord[]
    gold: SponsorRecord[]
    silver: SponsorRecord[]
    bronze: SponsorRecord[]
  }
}) {
  const tiers = [
    { key: "platinum", items: sponsors.platinum, cols: "md:grid-cols-2", size: "lg" as const },
    { key: "gold", items: sponsors.gold, cols: "md:grid-cols-3", size: "md" as const },
    { key: "silver", items: sponsors.silver, cols: "grid-cols-2 md:grid-cols-4", size: "sm" as const },
    { key: "bronze", items: sponsors.bronze, cols: "grid-cols-2 md:grid-cols-4", size: "sm" as const },
  ]

  const empty =
    sponsors.platinum.length === 0 &&
    sponsors.gold.length === 0 &&
    sponsors.silver.length === 0 &&
    sponsors.bronze.length === 0

  if (empty) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        We are looking for sponsors. Contact us to learn more.
      </p>
    )
  }

  return (
    <div className="space-y-12">
      {tiers.map((tier) =>
        tier.items.length ? (
          <div key={tier.key}>
            <h3 className="mb-6 text-center font-mono text-xs tracking-[0.28em] text-purdue-gold uppercase">
              {TIER_COPY[tier.key]} Sponsors
            </h3>
            <div className={cn("grid justify-items-center gap-5", tier.cols)}>
              {tier.items.map((sponsor) => (
                <SponsorPlate key={sponsor.id} sponsor={sponsor} size={tier.size} />
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  )
}
