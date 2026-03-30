import { StaticImageData } from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const formerPresidentCardVariants = cva(
  "rounded-lg shadow-md p-6 transition-shadow duration-300",
  {
    variants: {
      variant: {
        default: "bg-white hover:shadow-xl",
        outlined: "bg-white border-2 border-gray-200 hover:border-purdue-gold hover:shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface FormerPresidentCardProps extends VariantProps<typeof formerPresidentCardVariants> {
  image: StaticImageData | string;
  name: string;
  tenure: string;
  role: string;
  className?: string;
}

export default function FormerPresidentCard({
  image,
  name,
  tenure,
  role,
  variant,
  className
}: FormerPresidentCardProps) {
  const imageSrc = typeof image === 'string' ? image : image.src;

  return (
    <div className={cn(formerPresidentCardVariants({ variant }), className)}>
      <div className="flex items-center gap-4">
        <img
          src={imageSrc}
          alt={`Former President ${name}`}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-600">{role}</p>
          <p className="text-sm text-gray-500">{tenure}</p>
        </div>
      </div>
    </div>
  );
}
