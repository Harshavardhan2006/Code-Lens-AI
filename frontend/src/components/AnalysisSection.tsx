import React, { useState } from 'react';
import { Zap, AlertTriangle, RefreshCw, GitBranch, Check, Copy, ArrowRight, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
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
import type { AnalysisData, RewriteData, FlowchartData } from '../App';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('rust', rust);

interface AnalysisSectionProps {
  language: string;
  analysis: AnalysisData | null;
  isAnalyzing: boolean;
  rewrite: RewriteData | null;
  isRewriting: boolean;
  onRequestRewrite: () => void;
  flowchart: FlowchartData | null;
  isFlowcharting: boolean;
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="text-white font-medium">{value}/100</span>
      </div>
      <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Card({ icon, title, color, children, defaultOpen = true }: {
  icon: React.ReactNode; title: string; color: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-panel overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[var(--border-color)] bg-[rgba(12,14,20,0.4)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
      >
        <h3 className="text-sm font-semibold flex items-center gap-2 text-white font-display">
          <span className={color}>{icon}</span>
          {title}
        </h3>
        {open
          ? <ChevronUp className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
          : <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
        }
      </button>
      {open && <div className="p-4 sm:p-5">{children}</div>}
    </div>
  );
}

function FlowchartCanvas({ data }: { data: FlowchartData }) {
  const NODE_W = 140;
  const NODE_H = 40;
  const H_GAP = 50;
  const V_GAP = 60;

  const levelMap: Record<string, number> = {};
  const visited = new Set<string>();

  const bfs = (startId: string) => {
    const queue = [{ id: startId, level: 0 }];
    while (queue.length) {
      const { id, level } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      levelMap[id] = level;
      data.edges.filter(e => e.from === id).forEach(e => {
        if (!visited.has(e.to)) queue.push({ id: e.to, level: level + 1 });
      });
    }
  };

  const startNode = data.nodes.find(n => n.type === 'start');
  if (startNode) bfs(startNode.id);
  data.nodes.forEach(n => { if (levelMap[n.id] === undefined) levelMap[n.id] = 0; });

  const levels: Record<number, string[]> = {};
  Object.entries(levelMap).forEach(([id, level]) => {
    if (!levels[level]) levels[level] = [];
    levels[level].push(id);
  });

  const posMap: Record<string, { x: number; y: number }> = {};
  const maxLevel = Math.max(...Object.keys(levels).map(Number));

  Object.entries(levels).forEach(([levelStr, ids]) => {
    const level = Number(levelStr);
    const count = ids.length;
    const totalW = count * NODE_W + (count - 1) * H_GAP;
    ids.forEach((id, i) => {
      posMap[id] = {
        x: -totalW / 2 + i * (NODE_W + H_GAP) + NODE_W / 2,
        y: level * (NODE_H + V_GAP) + NODE_H / 2,
      };
    });
  });

  const svgH = (maxLevel + 1) * (NODE_H + V_GAP) + 40;
  const allX = Object.values(posMap).map(p => p.x);
  const minX = Math.min(...allX) - NODE_W / 2 - 20;
  const maxX = Math.max(...allX) + NODE_W / 2 + 20;
  const svgW = Math.max(maxX - minX, 320);
  const offsetX = -minX;

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start': return { fill: 'rgba(94,168,255,0.15)', stroke: '#5ea8ff', text: '#5ea8ff' };
      case 'end': return { fill: 'rgba(241,107,107,0.12)', stroke: '#f16b6b', text: '#f16b6b' };
      case 'decision': return { fill: 'rgba(240,180,41,0.12)', stroke: '#f0b429', text: '#f0b429' };
      default: return { fill: 'rgba(52,201,122,0.1)', stroke: '#34c97a', text: '#34c97a' };
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[rgba(12,14,20,0.6)]">
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ minWidth: '100%', display: 'block' }}>
        <defs>
          <marker id="arrowhead" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#3a3f4b" />
          </marker>
        </defs>
        {data.edges.map((edge, i) => {
          const from = posMap[edge.from];
          const to = posMap[edge.to];
          if (!from || !to) return null;
          const x1 = from.x + offsetX;
          const y1 = from.y + NODE_H / 2 - 2;
          const x2 = to.x + offsetX;
          const y2 = to.y - NODE_H / 2 + 2;
          return (
            <g key={i}>
              <path d={`M${x1},${y1} C${x1},${y1 + 18} ${x2},${y2 - 18} ${x2},${y2}`} fill="none" stroke="#3a3f4b" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
              {edge.label && (
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2} textAnchor="middle" fontSize="10" fill="#666" dy="-4">{edge.label}</text>
              )}
            </g>
          );
        })}
        {data.nodes.map((node) => {
          const pos = posMap[node.id];
          if (!pos) return null;
          const cx = pos.x + offsetX;
          const cy = pos.y;
          const colors = getNodeColor(node.type);
          const isDecision = node.type === 'decision';
          const isRound = node.type === 'start' || node.type === 'end';
          return (
            <g key={node.id}>
              {isDecision ? (
                <polygon points={`${cx},${cy - NODE_H / 2} ${cx + NODE_W / 2},${cy} ${cx},${cy + NODE_H / 2} ${cx - NODE_W / 2},${cy}`} fill={colors.fill} stroke={colors.stroke} strokeWidth="1.5" />
              ) : (
                <rect x={cx - NODE_W / 2} y={cy - NODE_H / 2} width={NODE_W} height={NODE_H} rx={isRound ? NODE_H / 2 : 6} fill={colors.fill} stroke={colors.stroke} strokeWidth="1.5" />
              )}
              <foreignObject x={cx - NODE_W / 2 + 4} y={cy - NODE_H / 2} width={NODE_W - 8} height={NODE_H}>
                <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: colors.text, textAlign: 'center', lineHeight: '1.3', padding: '2px', fontFamily: 'monospace' }}>
                  {node.label}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function AnalysisSection({
  language, analysis, isAnalyzing,
  rewrite, isRewriting, onRequestRewrite,
  flowchart, isFlowcharting,
}: AnalysisSectionProps) {
  return (
    <div className="space-y-3 sm:space-y-4 pb-8 sm:pb-10">
      <div className="section-divider">Advanced Analysis</div>

      {/* Complexity + Smells: stacked on mobile, side by side on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

        <Card icon={<Zap className="w-4 h-4" />} title="Complexity & Quality Score" color="text-yellow-400">
          {isAnalyzing ? (
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
              Analyzing complexity…
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="p-2.5 sm:p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Time</p>
                  <p className="text-lg sm:text-xl font-mono font-bold text-yellow-400">{analysis.complexity.time}</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Space</p>
                  <p className="text-lg sm:text-xl font-mono font-bold text-yellow-400">{analysis.complexity.space}</p>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{analysis.complexity.explanation}</p>
              <div className="space-y-3">
                <ScoreBar label="Readability" value={analysis.scores.readability} color="bg-blue-400" />
                <ScoreBar label="Maintainability" value={analysis.scores.maintainability} color="bg-green-400" />
                <ScoreBar label="Performance" value={analysis.scores.performance} color="bg-orange-400" />
              </div>
            </div>
          ) : null}
        </Card>

        <Card icon={<AlertTriangle className="w-4 h-4" />} title="Code Smell Detector" color="text-orange-400">
          {isAnalyzing ? (
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
              Detecting code smells…
            </div>
          ) : analysis ? (
            analysis.smells.length === 0 ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-sm text-green-400">
                <Check className="w-4 h-4 shrink-0" />
                No code smells detected. Clean code!
              </div>
            ) : (
              <div className="space-y-3">
                {analysis.smells.map((smell, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full shrink-0">{smell.type}</span>
                      <span className="text-xs text-[var(--text-secondary)] font-mono">L{smell.line}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{smell.description}</p>
                    <div className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-[var(--success-color)] mt-0.5 shrink-0" />
                      <p className="text-xs text-[var(--success-color)]">{smell.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : null}
        </Card>

      </div>

      <Card icon={<RefreshCw className="w-4 h-4" />} title="Rewrite This Better" color="text-cyan-400">
        {!rewrite && !isRewriting ? (
          <Button variant="secondary" size="sm" onClick={onRequestRewrite}>
            <RefreshCw className="w-3.5 h-3.5" />
            Generate Improved Version
          </Button>
        ) : isRewriting ? (
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            Rewriting code…
          </div>
        ) : rewrite ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider font-mono">What changed</p>
              <div className="space-y-2">
                {rewrite.changes.map((change, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <Check className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    {change}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider mb-2 font-mono">Rewritten Code</p>
              <div className="overflow-x-auto rounded-lg">
                <SyntaxHighlighter language={language} style={atomOneDark} customStyle={{ borderRadius: '8px', fontSize: '12px', padding: '14px' }}>
                  {rewrite.rewritten}
                </SyntaxHighlighter>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(rewrite.rewritten)}>
              <Copy className="w-3.5 h-3.5" />
              Copy rewritten code
            </Button>
          </div>
        ) : null}
      </Card>

      <Card icon={<GitBranch className="w-4 h-4" />} title="Visual Logic Flowchart" color="text-pink-400">
        {isFlowcharting ? (
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
            Generating flowchart…
          </div>
        ) : flowchart ? (
          <FlowchartCanvas data={flowchart} />
        ) : null}
      </Card>

    </div>
  );
}