import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    active?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading,
    active,
    ...props
}) => {
    const baseStyles = "relative font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center rounded-lg disabled:opacity-50 disabled:cursor-not-allowed group";

    const variants = {
        primary: "bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 btn-glow",
        secondary: "bg-transparent border border-white/10 text-white/70 hover:bg-white/5 hover:border-white/30 hover:text-white",
        ghost: "bg-transparent text-white/50 hover:text-white hover:bg-white/5",
        icon: "rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/30 backdrop-blur-sm"
    };

    const sizes = {
        sm: "px-4 py-2 text-xs",
        md: "px-8 py-3 text-sm min-w-[200px]",
        lg: "px-10 py-4 text-base min-w-[240px]",
        icon: "w-10 h-10 p-2"
    };

    // Special override size for icon variant if not specified
    const currentSize = variant === 'icon' && size === 'md' ? sizes.icon : sizes[size];

    // Active state styles
    const activeStyles = active ? "ring-2 ring-cyan-500/50 bg-cyan-500/20 text-cyan-300" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${currentSize} ${activeStyles} ${className}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : (
                <>
                    {/* Hover Effect Light Glint */}
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 pointer-events-none" />
                    {children}
                </>
            )}
        </button>
    );
};
