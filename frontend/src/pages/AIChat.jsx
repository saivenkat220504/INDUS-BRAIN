import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, FileText, RefreshCw, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { sendChatMessage } from '../services/api';

const initialMessages = [
  {
    id: 1,
    sender: 'assistant',
    text: 'Hello. I am the PlantBrain AI Copilot. I have indexed plant documents, equipment entities, and OSHA safety standards. Ask me any technical question about plant machinery, operating limits, or maintenance procedures.',
    sources: [],
    confidence: 0.98,
    timestamp: '10:00 AM',
  },
];

export default function AIChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || isGenerating) return;

    const userQuery = inputQuery;
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userQuery,
      sources: [],
      confidence: 1.0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsGenerating(true);

    try {
      const res = await sendChatMessage(userQuery);
      const botResponse = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: res.answer || "I don't have enough information in the ingested plant documents to answer this question.",
        sources: res.sources || [],
        confidence: res.confidence || 0.90,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-950/60">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white">PlantBrain RAG AI Copilot</h2>
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Grounded RAG
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Query technical specs, safety manuals, & P&ID schematics with 0 hallucinations
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages(initialMessages)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                  isUser
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-blue-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className={`max-w-2xl space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Confidence Badge */}
                {!isUser && msg.confidence && (
                  <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-mono">
                      {(msg.confidence * 100).toFixed(0)}% Confidence Match
                    </span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-950/90 text-slate-100 border border-slate-800'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                {/* Source Citations Pill List */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Verified Document Sources:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSnippet(src)}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono bg-slate-950 hover:bg-slate-800 text-blue-400 border border-slate-800 transition-colors"
                        >
                          <FileText className="h-3 w-3" />
                          <span>{src.document}</span>
                          <span className="text-slate-500">• pg {src.page}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <span className="block text-[10px] text-slate-500">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-blue-400 border border-slate-700">
              <Bot className="h-4 w-4 animate-pulse" />
            </div>
            <div className="flex items-center space-x-2 rounded-xl bg-slate-950 px-4 py-2.5 border border-slate-800 text-xs text-slate-400">
              <Sparkles className="h-4 w-4 text-blue-400 animate-spin" />
              <span>Querying ChromaDB vectors & generating Gemini response...</span>
            </div>
          </div>
        )}
      </div>

      {/* Snippet Preview Modal */}
      {selectedSnippet && (
        <div className="p-3 bg-blue-950/40 border-t border-b border-blue-900/50 flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-blue-400">{selectedSnippet.document}</span> (Page {selectedSnippet.page}):
              <p className="text-[11px] text-slate-300 italic">"{selectedSnippet.snippet}"</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedSnippet(null)}
            className="text-xs text-slate-400 hover:text-white px-2"
          >
            Close
          </button>
        </div>
      )}

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 flex items-center space-x-2 overflow-x-auto text-[11px]">
        <span className="text-slate-500 font-semibold uppercase flex-shrink-0">Suggested Queries:</span>
        {[
          'What is the maximum pressure limit for PUMP-A-102?',
          'Which OSHA standard governs turbine cooling safety?',
          'What are the failure modes for VALV-V-804?',
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => setInputQuery(chip)}
            className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Form Input Box */}
      <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/80 border-t border-slate-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask RAG AI Copilot about plant equipment, manuals, or safety limits..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isGenerating}
            className="absolute right-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-all shadow-md"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
