'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const scrollButtonVariants = cva(
    'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
                outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
            sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
            md: "h-9 rounded-md gap-1.5 px-5 has-[>svg]:px-4",
            lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
            icon: "size-9",
            "icon-sm": "size-8",
            "icon-lg": "size-10"
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ScrollButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof scrollButtonVariants> {
    targetId: string;
}

const ScrollButton = forwardRef<HTMLButtonElement, ScrollButtonProps>(
    ({ className, variant, size, targetId, children, ...props }, ref) => {
        const handleClick = () => {
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        };

        return (
            <button
                className={cn(scrollButtonVariants({ variant, size, className }))}
                ref={ref}
                onClick={handleClick}
                {...props}
            >
                {children}
            </button>
        );
    }
);

ScrollButton.displayName = 'ScrollButton';

export { ScrollButton, scrollButtonVariants };
