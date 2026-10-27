import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Sun,
  Moon,
  Keyboard,
  ChevronLeft,
  ChevronRight,
  Archive,
  Layers,
  Palette,
} from 'lucide-react';
import { Conversation, ThemeMode } from '../types/chat';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePinConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onClearAllConversations: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenShortcuts: () => void;
  onOpenThemes?: () => void;
  serverOnline?: boolean;
}

// Helper to group conversations by date
function groupConversations(conversations: Conversation[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOf7Days = startOfToday - 7 * 24 * 60 * 60 * 1000;

  const pinned: Conversation[] = [];
  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const last7Days: Conversation[] = [];
  const older: Conversation[] = [];

  // Sort by updatedAt descending
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  for (const conv of sorted) {
    if (conv.pinned) {
      pinned.push(conv);
      continue;
    }

    if (conv.updatedAt >= startOfToday) {
      today.push(conv);
    } else if (conv.updatedAt >= startOfYesterday) {
      yesterday.push(conv);
    } else if (conv.updatedAt >= startOf7Days) {
      last7Days.push(conv);
    } else {
      older.push(conv);
    }
  }

  return { pinned, today, yesterday, last7Days, older };
}

export function Sidebar({
  conversations,
  activeId,
  isOpen,
  onToggleOpen,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onTogglePinConversation,
  onDeleteConversation,
  onClearAllConversations,
  theme,
  onToggleTheme,
  onOpenShortcuts,
  onOpenThemes,
  serverOnline = true,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Filter conversations by title or message contents
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (conv) =>
        conv.title.toLowerCase().includes(query) ||
        conv.messages.some((m) => m.content.toLowerCase().includes(query))
    );
  }, [conversations, searchQuery]);

  const groups = useMemo(
    () => groupConversations(filteredConversations),
    [filteredConversations]
  );

  const startRenaming = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const saveRenaming = (convId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingTitle.trim()) {
      onRenameConversation(convId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRenaming = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(null);
  };

  const renderGroup = (title: string, list: Conversation[], isPinnedGroup = false) => {
    if (list.length === 0) return null;

    return (
      <div key={title} className="mb-4">
        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
          {isPinnedGroup && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
          <span>{title}</span>
          <span className="text-[10px] text-zinc-400">({list.length})</span>
        </div>

        <div className="space-y-1 mt-1">
          {list.map((conv) => {
            const isActive = conv.id === activeId;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'
                    }`}
                  />

                  {isEditing ? (
                    <form
                      onSubmit={(e) => saveRenaming(conv.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 flex-1 min-w-0"
                    >
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') cancelRenaming();
                        }}
                      />
                      <button
                        type="submit"
                        className="p-1 hover:text-emerald-500 text-zinc-400"
                        title="Save title"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelRenaming}
                        className="p-1 hover:text-rose-500 text-zinc-400"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <span className="truncate text-xs sm:text-sm" title={conv.title}>
                      {conv.title}
                    </span>
                  )}
                </div>

                {/* Hover actions */}
                {!isEditing && (
                  <div className="hidden group-hover:flex items-center gap-1 shrink-0 bg-transparent">
                    {/* Pin toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePinConversation(conv.id);
                      }}
                      className={`p-1 rounded-md transition-colors ${
                        conv.pinned
                          ? 'text-amber-500 hover:text-amber-600'
                          : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                      }`}
                      title={conv.pinned ? 'Unpin chat' : 'Pin chat to top'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    {/* Rename */}
                    <button
                      type="button"
                      onClick={(e) => startRenaming(conv, e)}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                      title="Rename conversation"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      className="p-1 rounded-md text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Main Sidebar Drawer */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 sm:w-80 bg-white/85 dark:bg-slate-950/80 backdrop-blur-xl border-r border-indigo-500/15 dark:border-white/10 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 md:overflow-hidden'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 border-b border-indigo-500/15 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">
                  Ahmed AI
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] tracking-wide uppercase">
                  Chat
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Personal AI Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop collapse button */}
            <button
              onClick={onToggleOpen}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
              title="Close sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New Chat Primary Button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Chat</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-indigo-500/40 text-[10px] font-mono text-indigo-100">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Search bar */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin">
          {filteredConversations.length === 0 ? (
            <div className="py-12 px-4 text-center select-none">
              <Archive className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {searchQuery ? 'No matching conversations' : 'No conversation history'}
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                {searchQuery ? 'Try a different keyword' : 'Start chatting to create one'}
              </p>
            </div>
          ) : (
            <>
              {renderGroup('Pinned', groups.pinned, true)}
              {renderGroup('Today', groups.today)}
              {renderGroup('Yesterday', groups.yesterday)}
              {renderGroup('Previous 7 Days', groups.last7Days)}
              {renderGroup('Older', groups.older)}
            </>
          )}
        </div>

        {/* Bottom Panel */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-1 text-xs">
          {/* Status Indicator */}
          <div className="flex items-center justify-between px-2 py-1.5 text-zinc-500 dark:text-zinc-400 select-none">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  serverOnline ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50' : 'bg-amber-500'
                }`}
              />
              <span className="text-[11px]">
                {serverOnline ? 'Gemini Connected' : 'Checking connection...'}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400">
              {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
            </span>
          </div>

          <div className="flex items-center gap-1 pt-1">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Toggle Dark / Light Theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span className="capitalize text-[11px] font-medium">{theme} Mode</span>
            </button>

            {/* Theme Palette Customizer */}
            {onOpenThemes && (
              <button
                onClick={onOpenThemes}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                title="Aesthetic themes"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Keyboard Shortcuts */}
            <button
              onClick={onOpenShortcuts}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
              title="Keyboard shortcuts"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>

            {/* Clear All Chats */}
            {conversations.length > 0 && (
              <button
                onClick={onClearAllConversations}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Clear all chat history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
