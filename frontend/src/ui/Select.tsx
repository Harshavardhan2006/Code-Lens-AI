import React from 'react';
import { cn } from '../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ className, label, options, id, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider font-mono">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'glass-input h-9 w-full rounded-lg px-3 text-sm appearance-none cursor-pointer font-sans',
          'focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:border-[var(--accent-color)]',
          'bg-[rgba(12,14,20,0.7)] text-[var(--text-primary)]',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#111420] text-[var(--text-primary)]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}