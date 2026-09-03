import Image from "next/image"
import Link from "next/link"
import { FALLBACK_IMAGE } from "@/config/routes"

interface SubProjectCardProps {
  href: string
  imageSrc: string
  title: string
  description: string
  imageAlt?: string
}

export default function SubProjectCard({
  href,
  imageSrc,
  title,
  description,
  imageAlt,
}: SubProjectCardProps) {
  return (
    <Link href={href} className="group lab-plate flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <Image
          src={imageSrc || FALLBACK_IMAGE}
          alt={imageAlt || title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-purdue-gold">
          {title}
        </h3>
        <p className="mb-4 flex-1 text-sm text-muted-foreground">{description}</p>
        <span className="text-sm font-medium text-purdue-gold">Learn More →</span>
      </div>
    </Link>
  )
}
