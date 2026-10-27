import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square, Sparkles } from 'lucide-react';

interface MessageComposerProps {
  onSendMessage: (content: string) => void;
  onStopGeneration: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

const QUICK_CHIPS = [
  { label: 'Summarize', prefix: 'Please summarize: ' },
  { label: 'Explain simply', prefix: 'Explain in simple terms: ' },
  { label: 'Step-by-step guide', prefix: 'Provide a step-by-step guide for: ' },
  { label: 'Code implementation', prefix: 'Write clean, production-ready code with tests for: ' },
];

export function MessageComposer({
  onSendMessage,
  onStopGeneration,
  isStreaming,
  disabled = false,
}: MessageComposerProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 160; // ~6 lines
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [content]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isStreaming || disabled) return;

    onSendMessage(content.trim());
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleApplyChip = (prefix: string) => {
    setContent((prev) => (prev ? `${prefix}${prev}` : prefix));
    textareaRef.current?.focus();
  };

  const charCount = content.length;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-4 sm:pb-6 select-none">
      {/* Quick Action Chips */}
      {!isStreaming && content.length === 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-1 text-xs">
          <span className="flex items-center gap-1 text-zinc-400 font-medium px-1 shrink-0">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Quick prompt:
          </span>
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyChip(chip.prefix)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 transition-colors text-xs font-medium cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Container */}
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl bg-white dark:bg-zinc-900 border-2 border-indigo-200/90 dark:border-zinc-700/80 focus-within:border-indigo-600 dark:focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-lg shadow-indigo-500/5 transition-all duration-200"
      >
        <div className="flex items-end p-2 sm:p-2.5 gap-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              isStreaming
                ? 'Ahmed AI is thinking and generating response...'
                : 'Ask Ahmed AI anything... (Press Enter to send)'
            }
            rows={1}
            className="flex-1 bg-transparent border-0 outline-none resize-none px-3 py-1.5 text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 font-sans leading-relaxed min-h-[42px] max-h-[160px] overflow-y-auto"
          />

          {/* Action button: Send or Stop */}
          <div className="shrink-0 pb-0.5">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer animate-pulse"
                title="Stop generating"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!content.trim() || disabled}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
                  content.trim() && !disabled
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/30 active:scale-95'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <span>Send</span>
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom micro bar */}
        <div className="flex items-center justify-between px-3 pb-2 text-[11px] text-zinc-400 dark:text-zinc-500 select-none">
          <div className="flex items-center gap-2">
            <span>Ahmed AI Chat • Gemini Flash</span>
          </div>
          <div className="flex items-center gap-3">
            {charCount > 0 && <span>{charCount} chars</span>}
            <span className="hidden sm:inline">Shift + Enter for new line</span>
          </div>
        </div>
      </form>
    </div>
  );
}
