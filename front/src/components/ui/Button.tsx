
import React from "react";
import {motion, type HTMLMotionProps} from "framer-motion";

interface ButtonProps extends HTMLMotionProps<'button'> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'lg' | 'md';
    children?: React.ReactNode;
    loading?: boolean;
}

export function Button({
    variant = 'primary',
    size = 'md',
    children,
    loading = false,
    className = '',
    ...props
}: ButtonProps) {
    const baseClasses = `
        inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50
        disabled:cursor-not-allowed tracking-tight font-inter`;

    const variants = {
        primary: `
            bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800
            shadow-sm hover:shadow-md active:shadow-sm`,
        secondary: `
            bg-gray-100 text-gray hover:bg-gray-200 active:bg-gray-300
            dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700`,
        ghost: `
            text-gray-700 hover:bg-gray-100 active:bg-gray-200
            dark:text-gray-300 dark:hover:bg-gray-800`,
        danger: `
            bg-red-700 text-white hover:bg-red-700 active:bg-red-700
            shadow-sm hover:shadow-md active:shadow-ms`
    };

    const sizes = {
        sm: 'px-3, py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };
    // @ts-ignore
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
            ) : (
                children
            )}
        </motion.button>
    )
}