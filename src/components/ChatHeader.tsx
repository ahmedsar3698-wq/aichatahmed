import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  Edit2,
  Check,
  X,
  Share2,
  Trash2,
  Plus,
  Sun,
  Moon,
  Zap,
  Palette,
} from 'lucide-react';
import { Conversation, ThemeMode } from '../types/chat';

interface ChatHeaderProps {
  conversation: Conversation | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onRenameTitle: (newTitle: string) => void;
  onOpenExport: () => void;
  onDeleteConversation: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenThemes?: () => void;
}

export function ChatHeader({
  conversation,
  sidebarOpen,
  onToggleSidebar,
  onNewChat,
  onRenameTitle,
  onOpenExport,
  onDeleteConversation,
  theme,
  onToggleTheme,
  onOpenThemes,
}: ChatHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  const startEditing = () => {
    if (!conversation) return;
    setTitleInput(conversation.title);
    setIsEditingTitle(true);
  };

  const saveTitle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (titleInput.trim()) {
      onRenameTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const cancelTitle = () => {
    setIsEditingTitle(false);
  };

  return (
    <header className="h-14 border-b border-indigo-500/15 dark:border-white/10 bg-white/75 dark:bg-slate-950/70 backdrop-blur-xl flex items-center justify-between px-3 sm:px-6 shrink-0 z-20 select-none">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Toggle sidebar button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors cursor-pointer"
          title={sidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Conversation Title */}
        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <form onSubmit={saveTitle} className="flex items-center gap-1.5">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Escape' && cancelTitle()}
                className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-indigo-500 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none w-48 sm:w-64"
              />
              <button
                type="submit"
                className="p-1 text-emerald-500 hover:text-emerald-600"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={cancelTitle}
                className="p-1 text-zinc-400 hover:text-rose-500"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={startEditing}
              className="group flex items-center gap-1.5 text-left truncate cursor-pointer rounded-lg px-1.5 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors"
              title="Click to rename"
            >
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[160px] sm:max-w-xs md:max-w-md">
                {conversation ? conversation.title : 'New Chat'}
              </span>
              {conversation && (
                <Edit2 className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              )}
            </button>
          )}

          {/* Model badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Zap className="w-3 h-3 text-indigo-500" />
            <span>Gemini Flash</span>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Quick New Chat */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
          title="Start a new chat"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden md:inline">New Chat</span>
        </button>

        {/* Export Conversation */}
        {conversation && conversation.messages.length > 0 && (
          <button
            onClick={onOpenExport}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors"
            title="Export conversation"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}

        {/* Delete Conversation */}
        {conversation && (
          <button
            onClick={onDeleteConversation}
            className="p-2 rounded-xl text-zinc-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Delete this chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Theme Palette Customizer */}
        {onOpenThemes && (
          <button
            onClick={onOpenThemes}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Choose Aesthetic Theme"
          >
            <Palette className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">Theme</span>
          </button>
        )}

        {/* Theme mode toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors"
          title="Toggle Dark / Light theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
