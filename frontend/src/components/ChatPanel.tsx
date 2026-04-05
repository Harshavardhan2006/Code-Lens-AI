import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Loader2, Bot } from 'lucide-react';
import { cn } from '../utils/cn';
import type { ChatMessage } from '../App';

interface ChatPanelProps {
  history: ChatMessage[];
  onSend: (question: string) => void;
  isLoading: boolean;
}

export function ChatPanel({ history, onSend, isLoading }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    const newLength = history.length + (isLoading ? 1 : 0);
    if (newLength > prevLengthRef.current) {
      prevLengthRef.current = newLength;
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history.length, isLoading]);

  const handleSend = () => {
    const q = input.trim();
    if (!q || isLoading) return;
    setInput('');
    onSend(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass-panel flex flex-col overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-[var(--border-color)] bg-[rgba(12,14,20,0.4)] shrink-0">
        <h3 className="text-sm font-semibold flex items-center gap-2 font-display tracking-wide">
          <MessageSquare className="w-4 h-4 text-[var(--accent-color)]" />
          Ask a Follow-up
        </h3>
        <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-mono hidden sm:block">
          Enter to send · Shift+Enter for newline
        </span>
      </div>

      <div className="overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 max-h-56 sm:max-h-64 min-h-[140px] sm:min-h-[180px]">
        {history.length === 0 && (
          <div className="flex items-center justify-center h-20 sm:h-24">
            <p className="text-xs text-[var(--text-muted)] text-center font-mono px-4">Have a question about the code? Ask anything below.</p>
          </div>
        )}
        {history.map((msg, idx) => (
          <div key={idx} className={cn('flex gap-2 sm:gap-2.5 items-start', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'model' && (
              <div className="w-6 h-6 rounded-lg bg-[var(--accent-subtle)] border border-[var(--border-active)] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-[var(--accent-color)]" />
              </div>
            )}
            <div className={cn(
              'max-w-[88%] sm:max-w-[82%] rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
              msg.role === 'user'
                ? 'bg-[var(--accent-color)] text-[#0c0e14] font-medium rounded-br-sm'
                : 'bg-[rgba(255,255,255,0.04)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-bl-sm'
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2.5 items-start">
            <div className="w-6 h-6 rounded-lg bg-[var(--accent-subtle)] border border-[var(--border-active)] flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-[var(--accent-color)]" />
            </div>
            <div className="bg-[rgba(255,255,255,0.04)] border border-[var(--border-color)] rounded-xl rounded-bl-sm px-3.5 py-2.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-color)]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-[var(--border-color)] bg-[rgba(12,14,20,0.4)] shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the code…"
            rows={1}
            className={cn(
              'flex-1 bg-[rgba(255,255,255,0.04)] border border-[var(--border-color)] rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5',
              'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none font-sans',
              'focus:outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/10',
              'max-h-24 overflow-y-auto transition-colors'
            )}
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all',
              'bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-[#0c0e14]',
              'shadow-[0_2px_8px_rgba(94,168,255,0.25)] hover:shadow-[0_4px_16px_rgba(94,168,255,0.35)]',
              'disabled:opacity-40 disabled:pointer-events-none active:scale-95'
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-1.5 font-mono sm:hidden">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}