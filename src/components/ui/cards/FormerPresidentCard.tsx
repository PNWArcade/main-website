import Image, { StaticImageData } from "next/image"
import { cn } from "@/lib/utils"
import { FALLBACK_IMAGE } from "@/config/routes"

interface FormerPresidentCardProps {
  image: StaticImageData | string
  name: string
  tenure: string
  role?: string
  className?: string
}

export default function FormerPresidentCard({
  image,
  name,
  tenure,
  role = "Former President",
  className,
}: FormerPresidentCardProps) {
  const imageSrc = typeof image === "string" ? image || FALLBACK_IMAGE : image

  return (
    <article className={cn("lab-plate lift flex items-center gap-4 rounded-2xl p-5", className)}>
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted">
        <Image
          src={imageSrc}
          alt={`Former President ${name}`}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-lg font-semibold text-foreground">{name}</h3>
        <p className="font-mono text-xs tracking-wide text-purdue-gold uppercase">{role}</p>
        <p className="text-sm text-muted-foreground">{tenure}</p>
      </div>
    </article>
  )
}
