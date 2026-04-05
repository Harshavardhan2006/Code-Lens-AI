import React from 'react';
import { cn } from '../utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium font-sans transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-color)] disabled:opacity-40 disabled:pointer-events-none select-none';

  const variants = {
    primary: 'bg-[var(--accent-color)] text-[#0c0e14] hover:bg-[var(--accent-hover)] shadow-[0_0_0_1px_rgba(94,168,255,0.3),0_2px_8px_rgba(94,168,255,0.2)] hover:shadow-[0_0_0_1px_rgba(94,168,255,0.5),0_4px_16px_rgba(94,168,255,0.3)] active:scale-[0.98]',
    secondary: 'bg-[rgba(255,255,255,0.06)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[rgba(255,255,255,0.1)] hover:border-[var(--border-active)] active:scale-[0.98]',
    ghost: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.97]',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-11 px-6 text-base gap-2',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}