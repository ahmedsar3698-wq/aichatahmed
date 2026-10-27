import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Sparkles,
  Copy,
  Check,
  RotateCw,
  Volume2,
  VolumeX,
  Edit2,
  Trash2,
  AlertCircle,
  ArrowDown,
  Clock,
} from 'lucide-react';
import { Message } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  onRegenerate: (messageId: string) => void;
  onEditAndResubmit: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function MessageList({
  messages,
  isStreaming,
  onRegenerate,
  onEditAndResubmit,
  onDeleteMessage,
  onShowToast,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Editing state for user messages
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Copied message ID tracker
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-scroll logic: scroll to bottom on new messages if user hasn't scrolled up
  useEffect(() => {
    if (!showScrollBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming, showScrollBottom]);

  // Handle scroll event to toggle "scroll to bottom" button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceFromBottom > 120);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  // Copy to clipboard
  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      onShowToast('Copied to clipboard', 'success');
    } catch {
      onShowToast('Failed to copy', 'error');
    }
  };

  // Text-to-speech toggle
  const handleToggleSpeech = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onShowToast('Text-to-speech is not supported in this browser', 'info');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean text from markdown formatting before speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[*_#`~]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startEditing = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const submitEdit = (msgId: string) => {
    if (!editContent.trim()) return;
    onEditAndResubmit(msgId, editContent.trim());
    setEditingMessageId(null);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-6 relative"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          const isLastMessage = index === messages.length - 1;
          const isMessageStreaming = isStreaming && isLastMessage && !isUser;
          const isEditing = editingMessageId === message.id;

          return (
            <div
              key={message.id}
              className={`group flex gap-3 sm:gap-4 transition-all duration-200 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div className="shrink-0 pt-0.5">
                {isUser ? (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 font-semibold text-xs ring-1 ring-white/10">
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Message Content Container */}
              <div
                className={`flex flex-col min-w-0 max-w-[88%] sm:max-w-[80%] ${
                  isUser ? 'items-end' : 'items-start'
                }`}
              >
                {/* Header info (Role & Timestamp) */}
                <div
                  className={`flex items-center gap-2 mb-1.5 px-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 select-none ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {isUser ? 'You' : 'Ahmed AI'}
                  </span>
                  <span className="flex items-center gap-1 opacity-70">
                    <Clock className="w-3 h-3" />
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {!isUser && message.model && (
                    <span className="px-1.5 py-0.2 rounded-sm bg-zinc-200/80 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400">
                      {message.model}
                    </span>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative rounded-2xl px-4 py-3.5 transition-all text-sm sm:text-base leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white rounded-tr-xs shadow-md shadow-indigo-500/15 border border-indigo-400/20'
                      : 'bg-white/95 dark:bg-zinc-900/80 backdrop-blur-xs border border-zinc-200/90 dark:border-zinc-800/90 text-zinc-900 dark:text-zinc-100 rounded-tl-xs shadow-md shadow-black/5'
                  }`}
                >
                  {isEditing ? (
                    <div className="w-full min-w-[260px] sm:min-w-[420px]">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-sans resize-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-3 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => submitEdit(message.id)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-white text-indigo-700 hover:bg-zinc-100 shadow-xs transition-colors"
                        >
                          Save & Resubmit
                        </button>
                      </div>
                    </div>
                  ) : isUser ? (
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  ) : (
                    <div>
                      <MarkdownRenderer
                        content={message.content}
                        isStreaming={isMessageStreaming}
                      />
                      {message.status === 'error' && (
                        <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold mb-0.5">Response Error</p>
                            <p className="leading-snug">{message.error || 'Something went wrong.'}</p>
                            <button
                              type="button"
                              onClick={() => onRegenerate(message.id)}
                              className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors cursor-pointer"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                              Retry Request
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Bar (hover actions) */}
                {!isEditing && (
                  <div
                    className={`flex items-center gap-1 mt-1.5 px-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity select-none ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Copy */}
                    <button
                      type="button"
                      onClick={() => handleCopy(message.content, message.id)}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Copy message"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Speech / Read Aloud (Assistant only) */}
                    {!isUser && !isMessageStreaming && (
                      <button
                        type="button"
                        onClick={() => handleToggleSpeech(message.id, message.content)}
                        className={`p-1 rounded-md transition-colors ${
                          speakingMsgId === message.id
                            ? 'text-indigo-500 bg-indigo-500/10'
                            : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                        title={speakingMsgId === message.id ? 'Stop reading' : 'Read aloud'}
                      >
                        {speakingMsgId === message.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    {/* Regenerate (Assistant only) */}
                    {!isUser && !isStreaming && (
                      <button
                        type="button"
                        onClick={() => onRegenerate(message.id)}
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Regenerate this response"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Edit (User only) */}
                    {isUser && !isStreaming && (
                      <button
                        type="button"
                        onClick={() => startEditing(message)}
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Edit and resubmit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete Message */}
                    {!isStreaming && (
                      <button
                        type="button"
                        onClick={() => onDeleteMessage(message.id)}
                        className="p-1 rounded-md text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Streaming Thinking Indicator */}
        {isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex gap-3 sm:gap-4 animate-in fade-in duration-200">
            <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-tl-xs shadow-xs flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Ahmed AI is thinking</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 sm:right-10 z-30 p-2.5 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all active:scale-95 flex items-center justify-center group"
          title="Jump to latest message"
        >
          <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}
