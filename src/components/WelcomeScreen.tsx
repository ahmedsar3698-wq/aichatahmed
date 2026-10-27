import React, { useState } from 'react';
import { Sparkles, Code, Lightbulb, PenTool, Compass, ArrowUpRight, Zap, Shield, Cpu, MessageSquare } from 'lucide-react';
import { PromptSuggestion } from '../types/chat';

const ALL_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: 's1',
    category: 'code',
    badge: 'Architecture',
    title: 'WebSockets vs Server-Sent Events',
    prompt: 'Explain the fundamental differences between WebSockets and Server-Sent Events (SSE). When should I choose one over the other? Provide architecture trade-offs and code examples.',
  },
  {
    id: 's2',
    category: 'code',
    badge: 'TypeScript',
    title: 'Write a React useDebounce hook',
    prompt: 'Write a production-ready, fully typed React useDebounce hook in TypeScript, complete with cleanup logic, delay parameter, and unit test examples.',
  },
  {
    id: 's3',
    category: 'creative',
    badge: 'Marketing Strategy',
    title: 'Product launch campaign',
    prompt: 'Help me outline a viral, developer-focused launch strategy for a modern developer productivity tool, including Twitter/X threads, Hacker News approach, and demo video script.',
  },
  {
    id: 's4',
    category: 'analysis',
    badge: 'Database Design',
    title: 'PostgreSQL vs Vector DBs',
    prompt: 'How does pgvector in PostgreSQL compare to dedicated vector databases like Pinecone and Qdrant in terms of scale, latency, indexing algorithms (HNSW vs IVFFlat), and cost?',
  },
  {
    id: 's5',
    category: 'writing',
    badge: 'Writing & Pitch',
    title: 'Draft an executive investor summary',
    prompt: 'Draft an engaging, high-conviction 1-page executive summary for an AI startup that automates full-stack web software testing and deployment.',
  },
  {
    id: 's6',
    category: 'analysis',
    badge: 'Performance',
    title: 'React 19 Server Actions & Compiler',
    prompt: 'Explain what makes React 19 unique: React Compiler, Server Actions, useOptimistic, and useActionState. Provide concrete before/after code examples.',
  },
];

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
}

export function WelcomeScreen({ onSelectPrompt }: WelcomeScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'code' | 'creative' | 'writing' | 'analysis'>('all');

  const filteredSuggestions = selectedCategory === 'all'
    ? ALL_SUGGESTIONS
    : ALL_SUGGESTIONS.filter((s) => s.category === selectedCategory);

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 px-4 sm:px-8 max-w-4xl mx-auto w-full select-none animate-in fade-in duration-300">
      {/* Hero Badge with Radial Ambient Glow */}
      <div className="relative mb-4 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-pink-500/25 blur-3xl rounded-full scale-175 pointer-events-none" />
        <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/25 border border-white/20">
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white animate-pulse" />
        </div>
      </div>

      {/* Main Heading */}
      <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-center text-zinc-900 dark:text-zinc-50 mb-2">
        Welcome to <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">Ahmed AI Chat</span>
      </h1>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-lg mb-6 leading-relaxed">
        Ahmed AI is ready to code, brainstorm, analyze, and write. Ask any question in the box below or choose a topic:
      </p>

      {/* Interactive Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 mb-5 overflow-x-auto max-w-full scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          All Topics
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('code')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'code'
              ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          💻 Coding
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('creative')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'creative'
              ? 'bg-white dark:bg-zinc-800 text-pink-600 dark:text-pink-400 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          💡 Ideas & Strategy
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('analysis')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'analysis'
              ? 'bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          📊 Research
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('writing')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'writing'
              ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          ✍️ Writing
        </button>
      </div>

      {/* Suggested Prompt Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-3xl mb-6">
        {filteredSuggestions.slice(0, 4).map((item) => {
          let IconComp = Lightbulb;
          let iconColor = 'text-amber-500';
          if (item.category === 'code') {
            IconComp = Code;
            iconColor = 'text-indigo-500';
          } else if (item.category === 'creative') {
            IconComp = PenTool;
            iconColor = 'text-pink-500';
          } else if (item.category === 'analysis') {
            IconComp = Compass;
            iconColor = 'text-cyan-500';
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectPrompt(item.prompt)}
              className="group text-left p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xs border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-400/80 dark:hover:border-indigo-500/70 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <IconComp className={`w-3.5 h-3.5 ${iconColor}`} />
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {item.badge}
                    </span>
                    <span aria-hidden="true" className="opacity-40">·</span>
                    <span className="text-[11px] capitalize opacity-80">{item.category}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  {item.title}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Notice & Feature Badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Real-time SSE Streaming</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-indigo-500" />
          <span>Gemini Flash</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local Storage History</span>
        </div>
      </div>
    </div>
  );
}
