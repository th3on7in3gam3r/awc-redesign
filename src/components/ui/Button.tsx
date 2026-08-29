import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import React from 'react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ className, variant = 'primary', ...props }) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2";
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-slate-100 text-slate-700",
    };

    return <button className={cn(baseStyles, variants[variant], className)} {...props} />;
};
