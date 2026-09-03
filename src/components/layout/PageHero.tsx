import Image from "next/image"
import { cn } from "@/lib/utils"
import { PageContainer } from "@/components/layout/PageContainer"

type PageHeroProps = {
  eyebrow?: string
  title: string
  description?: string
  image?: string
  imageAlt?: string
  children?: React.ReactNode
  className?: string
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt = "",
  children,
  className,
}: PageHeroProps) {
  return (
    <section className={cn("relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20", className)}>
      {image ? (
        <div className="absolute inset-0">
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-white/25 via-white/45 to-white" />
        </div>
      ) : (
        <div className="absolute inset-0 lab-grid opacity-40" />
      )}
      <PageContainer className="relative">
        {eyebrow ? (
          <p className="mb-4 font-mono text-xs tracking-[0.28em] text-purdue-gold uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </PageContainer>
    </section>
  )
}
