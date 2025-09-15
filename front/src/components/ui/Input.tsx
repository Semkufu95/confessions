import React, {forwardRef} from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="space-y-1">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 tracking-tight">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
                      w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500
                      dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-all duration-200 tracking-tight font-inter
                      ${error ? 'border-red-500' : ''}
                      ${className}
                    `}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400 tracking-tight">{error}</p>
                )}
            </div>
        )
    }
)