import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const infoCardVariants = cva(
  "rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md",
  {
    variants: {
      variant: {
        default: "bg-white text-gray-800",
        primary: "bg-primary text-white",
        secondary: "bg-secondary text-white",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface InfoCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof infoCardVariants> {
  title: string
  children: React.ReactNode
}

export function InfoCard({ title, children, variant, size, className, ...props }: InfoCardProps) {
  return (
    <div className={cn(infoCardVariants({ variant, size, className }))} {...props}>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="text-gray-600">{children}</div>
    </div>
  )
}
