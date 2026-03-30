import Link from 'next/link';
import Image from 'next/image';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const projectCardVariants = cva(
    "group relative h-64 rounded-lg overflow-hidden transition-all duration-300",
    {
        variants: {
            variant: {
                default: "border border-transparent hover:border-purdue-gold",
                elevated: "shadow-md hover:shadow-xl border border-gray-200",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

interface ProjectCardProps extends VariantProps<typeof projectCardVariants> {
    title: string;
    image: string;
    link: string;
    category?: string;
    className?: string;
}

export default function ProjectCard({ title, image, link, category = "CATEGORY", variant, className }: ProjectCardProps) {
    return (
        <Link
            href={link}
            className={cn(projectCardVariants({ variant }), className)}>
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover"
                />
            </div>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-white via-white/5 to-transparent z-10"></div>
            {/* Fallback background if no image */}
            <div className="absolute inset-0 bg-gray-100 -z-10"></div>
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <h3 className="text-purdue-black font-semibold text-lg group-hover:text-purdue-gold transition-colors">
                    {title}
                </h3>
            </div>
        </Link>
    );
}
