import Image from 'next/image';
import Link from 'next/link';

interface SubProjectCardProps {
    href: string;
    imageSrc: string;
    title: string;
    description: string;
    imageAlt?: string;
}

export default function SubProjectCard({ 
    href, 
    imageSrc, 
    title, 
    description,
    imageAlt 
}: SubProjectCardProps) {
    return (
        <Link href={href} className="group">
            <div className="bg-white border-2 border-gray-200 overflow-hidden rounded-2xl hover:border-black transition-all duration-300 h-full flex flex-col">
                <div className="relative h-48 w-full overflow-hidden">
                    <Image
                        src={imageSrc}
                        alt={imageAlt || title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700">
                        {title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 flex-1">
                        {description}
                    </p>
                    <span className="text-sm font-semibold text-black group-hover:underline">
                        Learn More →
                    </span>
                </div>
            </div>
        </Link>
    );
}
