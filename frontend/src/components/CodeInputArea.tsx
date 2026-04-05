import React, { useState } from 'react';
import { Play, Copy, Check, Wand2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { cn } from '../utils/cn';

interface CodeInputAreaProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  resolvedLanguage: string;
  difficulty: string;
  setDifficulty: (diff: string) => void;
  onExplain: () => void;
  isLoading: boolean;
  isDetecting: boolean;
}

const LANGUAGES = [
  { value: 'auto', label: '✦ Auto Detect' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
];

const DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner (ELI5)' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert (Technical)' },
];

export function CodeInputArea({
  code, setCode, language, setLanguage, resolvedLanguage,
  difficulty, setDifficulty, onExplain, isLoading, isDetecting,
}: CodeInputAreaProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code.trim()) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel panel-accent-top flex flex-col h-full animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--accent-color)] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Toolbar row 1: selects — wrap on very small screens */}
      <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 pt-3 pb-0">
        <Select
          options={LANGUAGES}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-36 sm:w-40"
        />
        <Select
          options={DIFFICULTIES}
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-40 sm:w-48"
        />
        {language === 'auto' && isDetecting && (
          <span className="text-xs text-[var(--accent-color)] flex items-center gap-1.5 animate-pulse font-mono">
            <Wand2 className="w-3 h-3" /> Detecting…
          </span>
        )}
        {language === 'auto' && !isDetecting && resolvedLanguage && !isLoading && (
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 font-mono">
            <Wand2 className="w-3 h-3 text-[var(--accent-color)]" />
            <span className="text-[var(--text-secondary)] capitalize">{resolvedLanguage}</span>
          </span>
        )}
      </div>

      {/* Toolbar row 2: actions */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-[var(--border-color)]">
        <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!code.trim()} title="Copy code">
          {copied ? <Check className="w-3.5 h-3.5 text-[var(--success-color)]" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="text-xs hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </Button>
        <Button onClick={onExplain} isLoading={isLoading} disabled={!code.trim()} size="sm">
          {!isLoading && <Play className="w-3.5 h-3.5" />}
          <span>Explain Code</span>
        </Button>
      </div>

      {/* Code textarea */}
      <div className="flex-1 relative min-h-0">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here to analyze..."
          className={cn(
            'code-input w-full h-full p-3 sm:p-4 bg-transparent text-[var(--text-primary)] resize-none block',
            'focus:outline-none placeholder:text-[var(--text-muted)]'
          )}
          spellCheck={false}
        />
      </div>

      {/* Footer */}
      <div className="px-3 sm:px-4 py-2 border-t border-[var(--border-color)] bg-[rgba(12,14,20,0.4)] text-xs text-[var(--text-muted)] flex justify-between font-mono">
        <span>{code.length} chars</span>
        <span>13+ languages</span>
      </div>
    </div>
  );
}