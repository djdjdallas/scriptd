import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function MarketingButton({ 
  children, 
  variant = 'primary',
  size = 'default',
  href,
  onClick,
  className,
  icon: Icon,
  iconRight = false,
  ...props 
}) {
  const variants = {
    primary: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25",
    secondary: "glass hover:bg-white/20 text-white",
    outline: "border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 text-white",
    ghost: "hover:bg-white/10 text-gray-400 hover:text-white"
  };

  const sizes = {
    small: "px-4 py-2 text-sm",
    default: "px-6 py-3",
    large: "px-8 py-4 text-lg"
  };

  const buttonClass = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105",
    variants[variant],
    sizes[size],
    className
  );

  const content = (
    <>
      {Icon && !iconRight && <Icon className="w-5 h-5" />}
      {children}
      {Icon && iconRight && <Icon className="w-5 h-5" />}
    </>
  );

  if (href) {
    return (
      <Link href={href}>
        <button className={buttonClass} {...props}>
          {content}
        </button>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={buttonClass} {...props}>
      {content}
    </button>
  );
}