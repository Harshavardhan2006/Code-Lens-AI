import React from 'react';
import { Check, Copy, BookOpen, ListTree, Code, Wand2 } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import go from 'react-syntax-highlighter/dist/esm/languages/hljs/go';
import rust from 'react-syntax-highlighter/dist/esm/languages/hljs/rust';
import atomOneDark from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark';
import { Button } from '../ui/Button';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('rust', rust);

export interface ExplanationData {
  summary: string;
  stepByStep: string[];
  lineByLine?: Array<{ line: number; code: string; explanation: string }>;
}

interface ExplanationViewProps {
  data: ExplanationData | null;
  language: string;
  isDetecting?: boolean;
}

export function ExplanationView({ data, language, isDetecting }: ExplanationViewProps) {
  const [copied, setCopied] = React.useState(false);

  if (!data) {
    return (
      <div className="glass-panel h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center">
        {isDetecting ? (
          <>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--border-active)] flex items-center justify-center mb-4 animate-pulse">
              <Wand2 className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--accent-color)]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-1.5 font-display">Detecting Language…</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs">Identifying the programming language in your code.</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[var(--border-color)] flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-1.5 font-display">Awaiting the Code</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs leading-relaxed">
              Paste your code on the left and hit Explain Code to get a detailed AI breakdown.
            </p>
          </>
        )}
      </div>
    );
  }

  const handleCopy = () => {
    const text = `Summary:\n${data.summary}\n\nStep-by-Step:\n${data.stepByStep.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nLine-by-Line:\n${data.lineByLine?.map((l) => `Line ${l.line}: ${l.explanation}`).join('\n') || 'N/A'}`.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel panel-accent-top flex flex-col h-full animate-fade-in overflow-hidden">
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-[var(--border-color)] bg-[rgba(12,14,20,0.4)] shrink-0">
        <h2 className="text-sm font-semibold flex items-center gap-2 font-display tracking-wide">
          <BookOpen className="w-4 h-4 text-[var(--accent-color)]" />
          Explanation Insights
        </h2>
        <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy explanation">
          {copied
            ? <><Check className="w-3.5 h-3.5 text-[var(--success-color)]" /><span className="text-xs hidden sm:inline">Copied</span></>
            : <><Copy className="w-3.5 h-3.5" /><span className="text-xs hidden sm:inline">Copy</span></>
          }
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-5 sm:space-y-6 stagger-children">

        {/* Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold flex items-center gap-2 text-[var(--text-secondary)] uppercase tracking-wider font-mono">
            <ListTree className="w-3.5 h-3.5 text-[var(--purple-color)]" />
            Summary
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed p-3 sm:p-3.5 bg-[var(--purple-subtle)] border border-[rgba(157,126,240,0.15)] rounded-xl">
            {data.summary}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold flex items-center gap-2 text-[var(--text-secondary)] uppercase tracking-wider font-mono">
            <Check className="w-3.5 h-3.5 text-[var(--success-color)]" />
            Step-by-step Logic
          </h3>
          <div className="space-y-1.5">
            {data.stepByStep.map((step, idx) => (
              <div key={idx} className="flex gap-3 items-start group p-2 sm:p-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <div className="shrink-0 w-5 h-5 rounded-md bg-[rgba(255,255,255,0.04)] border border-[var(--border-color)] flex items-center justify-center text-[10px] font-mono text-[var(--text-muted)] group-hover:border-[var(--accent-color)] group-hover:text-[var(--accent-color)] transition-colors mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed group-hover:text-[var(--text-primary)] transition-colors">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Line by Line */}
        {data.lineByLine && data.lineByLine.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold flex items-center gap-2 text-[var(--text-secondary)] uppercase tracking-wider font-mono">
              <Code className="w-3.5 h-3.5 text-[var(--accent-color)]" />
              Line-by-line Dive
            </h3>
            <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[rgba(12,14,20,0.5)] divide-y divide-[var(--border-color)]">
              {data.lineByLine.map((lineDetails, idx) => (
                <div key={idx} className="flex flex-col hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <div className="border-b border-[var(--border-color)]">
                    <SyntaxHighlighter
                      language={language}
                      style={atomOneDark}
                      customStyle={{ margin: 0, padding: '8px 12px', background: 'transparent', fontSize: '12px', lineHeight: '1.6' }}
                      wrapLines={true}
                    >
                      {lineDetails.code}
                    </SyntaxHighlighter>
                  </div>
                  <div className="p-2.5 px-3">
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      <span className="font-mono text-[10px] text-[var(--text-muted)] mr-2 border border-[var(--border-color)] rounded px-1 py-0.5">L{lineDetails.line}</span>
                      {lineDetails.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}