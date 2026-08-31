import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
} from 'lucide-react';
import { AnamnesisForensicReport, MediaIntakeData } from '../types';

interface ForensicCopilotChatProps {
  report: AnamnesisForensicReport;
  intake: MediaIntakeData;
  imageBase64?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const ForensicCopilotChat: React.FC<ForensicCopilotChatProps> = ({
  report,
  intake,
  imageBase64,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `ANAMESIS Cross-Examiner online for Case **${report.case_summary.evidence_id}**.\n\nI have evaluated the evidence against the 5 Core Questions. You can ask me to probe specific visual inconsistencies, analyze shadow/lighting physics, generate OSINT geolocation confirmation checklists, or formulate legal admissibility briefs.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/forensics/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          reportContext: {
            summary: report.case_summary,
            fiveQuestions: report.the_five_questions,
            integrity: report.context_integrity_check,
            intakeMeta: {
              claimedLocation: intake.claimedLocation,
              claimedDateTime: intake.claimedDateTime,
              claimedNarrative: intake.claimedNarrative,
              hash: intake.fileHashSha256,
            },
          },
          imageBase64: imageBase64 || (intake.previewUrl.startsWith('data:') ? intake.previewUrl : undefined),
        }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.reply || 'Analysis completed with no additional discrepancies found.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error during forensic query processing: ${err.message || 'Unable to connect to engine.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const SUGGESTED_QUERIES = [
    'Cross-examine lighting and shadow ray consistency',
    'Explain how raw media was decoupled from narrative',
    'Generate OSINT satellite geolocation checklist',
    'Draft Executive Summary for Legal Admissibility',
  ];

  return (
    <div className="rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-[#0c0c16] to-[#07070e] p-5 space-y-4 flex flex-col h-[520px] shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl logo-gradient-bg text-white shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-zinc-100 uppercase">
              AI Forensic Cross-Examiner
            </h3>
            <span className="text-[10px] text-pink-300 font-mono block">Evidentiary Invariant Auditor</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-pink-300 bg-pink-950/60 border border-pink-500/40 px-3 py-1 rounded-full flex items-center gap-1.5 font-bold shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-[#ec4899]" />
          <span>AUDITOR ACTIVE</span>
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 font-mono text-xs scrollbar-thin">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-2xl bg-[#06060c] border border-[#ec4899]/50 flex items-center justify-center shrink-0 text-[#ec4899] mt-0.5 shadow-[0_0_10px_rgba(236,72,153,0.3)]">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 space-y-1.5 leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-[#3b82f6]/20 via-[#ec4899]/20 to-[#f97316]/20 border border-[#ec4899]/50 text-zinc-100'
                  : 'bg-[#06060c] border border-zinc-800 text-zinc-200 shadow-md font-sans'
              }`}
            >
              <div className="flex items-center justify-between gap-4 text-[10px] text-zinc-400 font-mono border-b border-zinc-800/80 pb-1">
                <span className="font-bold text-pink-300">{m.role === 'user' ? 'INVESTIGATOR' : 'ANAMESIS ENGINE'}</span>
                <span>{m.timestamp}</span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed text-xs">{m.content}</div>
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-zinc-300 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-2xl bg-[#06060c] border border-[#ec4899]/40 flex items-center justify-center text-[#ec4899]">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-[#06060c] border border-zinc-800 font-mono text-xs text-pink-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ec4899] animate-ping" />
              <span>Cross-examining forensic indicators and physical invariants...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        {SUGGESTED_QUERIES.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-[#06060c] border border-zinc-800 hover:border-[#ec4899]/60 hover:bg-[#120d1c] text-[11px] font-mono text-zinc-300 hover:text-pink-300 whitespace-nowrap transition-all disabled:opacity-50 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-zinc-800"
      >
        <input
          type="text"
          placeholder="Ask a forensic question (e.g. 'How do shadow angles disprove the claimed timestamp?')..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-2xl bg-[#06060c] border border-zinc-800 focus:border-[#ec4899] focus:outline-none text-zinc-100 text-xs font-mono placeholder:text-zinc-500 disabled:opacity-50 transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="px-5 py-2.5 rounded-2xl logo-gradient-bg hover:opacity-95 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-mono font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.3)]"
        >
          <Send className="w-3.5 h-3.5" />
          <span>QUERY</span>
        </button>
      </form>
    </div>
  );
};
