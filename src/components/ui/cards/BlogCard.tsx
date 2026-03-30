import React from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface BlogCardProps {
  image: string;
  date: string;
  category: string;
  categoryColor?: 'teal' | 'blue' | 'green' | 'purple' | 'red';
  title: string;
  description: string;
  href?: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({ 
  image, 
  date, 
  category, 
  categoryColor = 'teal',
  title, 
  description,
  href
}) => {
  const categoryColors: Record<string, string> = {
    teal: 'bg-teal-600',
    blue: 'bg-blue-900',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    red: 'bg-red-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-sm">
      <div className="relative h-48 overflow-hidden">
        <Image 
          src={image} 
          alt={title}
          height={400}
          width={400}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-gray-500 text-sm">{date}</span>
          <span className={`${categoryColors[categoryColor]} text-white text-xs font-medium px-3 py-1 rounded-full uppercase`}>
            {category}
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {description}
        </p>
        
        {href ? (
          <Link href={href} className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-teal-600 transition-colors group">
            READ MORE
            <span className="w-6 h-6 rounded-full bg-gray-900 group-hover:bg-teal-600 flex items-center justify-center transition-colors">
              <ArrowRight className="w-3 h-3 text-white" />
            </span>
          </Link>
        ) : (
          <button className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-teal-600 transition-colors group">
            READ MORE
            <span className="w-6 h-6 rounded-full bg-gray-900 group-hover:bg-teal-600 flex items-center justify-center transition-colors">
              <ArrowRight className="w-3 h-3 text-white" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
};