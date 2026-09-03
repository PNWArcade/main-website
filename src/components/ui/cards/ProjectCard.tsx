import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { FALLBACK_IMAGE } from "@/config/routes"

interface ProjectCardProps {
  title: string
  image: string
  link: string
  category?: string
  className?: string
}

export default function ProjectCard({ title, image, link, className }: ProjectCardProps) {
  return (
    <Link
      href={link}
      className={cn(
        "group lift relative h-64 overflow-hidden rounded-2xl border border-black/10",
        className
      )}
    >
      <Image
        src={image || FALLBACK_IMAGE}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 20vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
      <div className="absolute right-0 bottom-0 left-0 p-4">
        <h3 className="font-semibold text-foreground group-hover:text-purdue-gold">{title}</h3>
      </div>
    </Link>
  )
}
