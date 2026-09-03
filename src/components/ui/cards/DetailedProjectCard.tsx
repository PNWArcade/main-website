import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { FALLBACK_IMAGE } from "@/config/routes"

interface DetailedProjectCardProps {
  id?: string | number
  title: string
  category: string
  description: string
  image: string
  link: string
  className?: string
}

export default function DetailedProjectCard({
  title,
  category,
  description,
  image,
  link,
  className,
}: DetailedProjectCardProps) {
  return (
    <Link href={link} className={cn("group lift lab-plate overflow-hidden rounded-2xl", className)}>
      <div className="relative h-48 overflow-hidden bg-muted">
        <Image
          src={image || FALLBACK_IMAGE}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="p-6">
        <span className="font-mono text-xs tracking-[0.2em] text-purdue-gold uppercase">
          {category}
        </span>
        <h3 className="mt-2 mb-3 text-xl font-semibold text-foreground group-hover:text-purdue-gold">
          {title}
        </h3>
        <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{description}</p>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-purdue-gold">
          Learn more
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
