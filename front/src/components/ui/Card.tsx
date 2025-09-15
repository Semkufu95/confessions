import {motion} from "framer-motion";
import React from "react";


interface CardProps {
    children?: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export function Card({ children, className = '', hover = true, onClick }: CardProps) {
    const baseClasses = `
        bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100
        dark:border-gray-800 transition-all duration-200`;

    const hoverClasses = hover ? 'hover:shadow-md hover:-translate-y-0.5' : '';
    const clickableClasses = onClick ? 'cursor-pointer' : '';

    const Component = onClick ? motion.div : motion.div;

    return (
        <Component
            whileHover={hover && onClick ? { scale: 1.01 } : {}}
            whileTap={onClick ? { scale: 0.99 } : {}}
            className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
            onClick={onClick}
            layoutId={onClick ? undefined : 'card'}
            >
            {children}
        </Component>
    )

}