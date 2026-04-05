import React from 'react';
import { Code2 } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-[rgba(12,14,20,0.85)] backdrop-blur-xl supports-[backdrop-filter]:bg-[rgba(12,14,20,0.75)]">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="flex items-center gap-2.5">
          <div className="relative p-1.5 rounded-lg border border-[rgba(94,168,255,0.25)] bg-[rgba(94,168,255,0.08)]">
            <Code2 className="h-5 w-5 text-[var(--accent-color)]" />
          </div>
          <span className="text-[17px] font-semibold tracking-tight text-white font-display">
            CodeLens <span className="text-[var(--accent-color)]">AI</span>
          </span>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--success-subtle)] border border-[rgba(52,201,122,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success-color)] shadow-[0_0_6px_var(--success-color)]" />
            <span className="text-xs font-medium text-[var(--success-color)] font-mono">LLM Engine Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
}