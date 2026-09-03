import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type PageContainerProps = HTMLAttributes<HTMLElement> & {
  children: React.ReactNode
  className?: string
  as?: "div" | "section" | "article"
}

export function PageContainer({
  children,
  className,
  as: Comp = "div",
  ...props
}: PageContainerProps) {
  return (
    <Comp className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10", className)} {...props}>
      {children}
    </Comp>
  )
}
