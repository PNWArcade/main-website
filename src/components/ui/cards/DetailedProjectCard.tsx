import Link from 'next/link';
import Image from 'next/image';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const detailedProjectCardVariants = cva(
    "group rounded-lg overflow-hidden transition-all duration-300",
    {
        variants: {
            variant: {
                default: "bg-white border border-gray-200 hover:border-purdue-gold shadow-sm hover:shadow-md",
                elevated: "bg-white shadow-md hover:shadow-xl border border-gray-100",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

interface DetailedProjectCardProps extends VariantProps<typeof detailedProjectCardVariants> {
    id: string | number;
    title: string;
    category: string;
    description: string;
    image: string;
    link: string;
    className?: string;
}

export default function DetailedProjectCard({ 
    id, 
    title, 
    category, 
    description, 
    image, 
    link,
    variant,
    className
}: DetailedProjectCardProps) {
    return (
        <Link href={link} className={cn(detailedProjectCardVariants({ variant }), className)}>
            <div className="h-48 bg-gray-200 relative overflow-hidden">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="p-6">
                <span className="text-yellow-500 text-sm font-semibold">{category}</span>
                <h3 className="text-xl font-bold text-purdue-black mt-2 mb-3 group-hover:text-purdue-gold transition-colors">
                    {title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                    {description}
                </p>
                <div className="text-yellow-500 hover:text-purdue-field transition-colors font-semibold text-sm inline-flex items-center gap-2">
                    Learn more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </Link>
    );
}
