import React, { useState } from 'react';
import { Header } from './components/Header';
import { CodeInputArea } from './components/CodeInputArea';
import { ExplanationView, type ExplanationData } from './components/ExplanationView';
import { ChatPanel } from './components/ChatPanel';
import { AnalysisSection } from './components/AnalysisSection';

export type ChatMessage = { role: 'user' | 'model'; content: string };

export interface AnalysisData {
  complexity: { time: string; space: string; explanation: string };
  scores: { readability: number; maintainability: number; performance: number };
  smells: Array<{ type: string; line: number; description: string; fix: string }>;
}

export interface RewriteData {
  rewritten: string;
  changes: string[];
}

export interface FlowchartData {
  nodes: Array<{ id: string; type: 'start' | 'end' | 'process' | 'decision'; label: string }>;
  edges: Array<{ from: string; to: string; label?: string }>;
}

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');
  const [resolvedLanguage, setResolvedLanguage] = useState('javascript');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [rewrite, setRewrite] = useState<RewriteData | null>(null);
  const [flowchart, setFlowchart] = useState<FlowchartData | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isFlowcharting, setIsFlowcharting] = useState(false);

  const handleExplain = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setChatHistory([]);
    setAnalysis(null);
    setRewrite(null);
    setFlowchart(null);

    try {
      let effectiveLanguage = language;

      if (language === 'auto') {
        setIsDetecting(true);
        const detectRes = await fetch(import.meta.env.VITE_API_URL + '/api/detect-language', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const detected = await detectRes.json();
        effectiveLanguage = detected.language || 'javascript';
        setResolvedLanguage(effectiveLanguage);
        setIsDetecting(false);
      } else {
        setResolvedLanguage(language);
      }

      const response = await fetch(import.meta.env.VITE_API_URL + '/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: effectiveLanguage, difficulty }),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Explainer API failed.');
      setExplanation(responseData);

      fetchAnalysis(effectiveLanguage);
      fetchFlowchart(effectiveLanguage);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsDetecting(false);
    }
  };

  const fetchAnalysis = async (lang: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: lang }),
      });
      const data = await res.json();
      if (res.ok) setAnalysis(data);
    } catch (e) {
      console.error('Analysis failed', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchRewrite = async () => {
    setIsRewriting(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: resolvedLanguage }),
      });
      const data = await res.json();
      if (res.ok) setRewrite(data);
    } catch (e) {
      console.error('Rewrite failed', e);
    } finally {
      setIsRewriting(false);
    }
  };

  const fetchFlowchart = async (lang: string) => {
    setIsFlowcharting(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: lang }),
      });
      const data = await res.json();
      if (res.ok) setFlowchart(data);
    } catch (e) {
      console.error('Flowchart failed', e);
    } finally {
      setIsFlowcharting(false);
    }
  };

  const handleChat = async (question: string) => {
    const userMsg: ChatMessage = { role: 'user', content: question };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setIsChatLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: resolvedLanguage, explanation, question, history: chatHistory }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chat failed.');
      setChatHistory([...newHistory, { role: 'model', content: data.answer }]);
    } catch (error: any) {
      setChatHistory([...newHistory, { role: 'model', content: `Error: ${error.message}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* On mobile: single column stack. On desktop: two-column fixed height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:h-[calc(100vh-8rem)] lg:min-h-[600px]">
          {/* Code input — on mobile natural height, on desktop fills column */}
          <div className="h-[60vh] min-h-[360px] lg:h-full">
            <CodeInputArea
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
              resolvedLanguage={resolvedLanguage}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              onExplain={handleExplain}
              isLoading={isLoading}
              isDetecting={isDetecting}
            />
          </div>

          {/* Explanation — on mobile natural height, on desktop fills column */}
          <div className="h-[70vh] min-h-[400px] lg:h-full overflow-hidden">
            <ExplanationView
              data={explanation}
              language={resolvedLanguage}
              isDetecting={isDetecting}
            />
          </div>
        </div>

        {explanation && (
          <>
            <ChatPanel
              history={chatHistory}
              onSend={handleChat}
              isLoading={isChatLoading}
            />
            <AnalysisSection
              language={resolvedLanguage}
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              rewrite={rewrite}
              isRewriting={isRewriting}
              onRequestRewrite={fetchRewrite}
              flowchart={flowchart}
              isFlowcharting={isFlowcharting}
            />
          </>
        )}

      </main>
    </div>
  );
}

export default App;