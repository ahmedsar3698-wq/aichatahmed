import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, Message, ThemeMode, ThemePreset, ToastItem } from './types/chat';
import {
  loadStorageData,
  saveStorageData,
  createNewConversation,
  generateId,
} from './lib/storage';
import {
  streamChatResponse,
  requestTitleGeneration,
  checkServerStatus,
} from './lib/geminiClient';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MessageList } from './components/MessageList';
import { MessageComposer } from './components/MessageComposer';
import { ConfirmDialog, ExportDialog, ShortcutsDialog } from './components/Dialogs';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { ToastContainer } from './components/Toast';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [themePreset, setThemePreset] = useState<ThemePreset>('midnight');
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Dialog States
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Active generation controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // Toast dispatch
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    const id = generateId('toast');
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load from LocalStorage
  useEffect(() => {
    const stored = loadStorageData();
    setConversations(stored.conversations);
    setActiveId(stored.activeConversationId);
    setTheme(stored.theme);
    if (stored.themePreset) {
      setThemePreset(stored.themePreset);
    }
    setSidebarOpen(window.innerWidth >= 768 ? stored.sidebarOpen : false);

    // Check server status
    checkServerStatus().then((status) => {
      if (status) {
        setServerOnline(true);
        if (!status.hasApiKey) {
          showToast(
            'Gemini API Key is missing. Please set GEMINI_API_KEY in the Secrets panel.',
            'error',
            'Configuration'
          );
        }
      } else {
        setServerOnline(false);
      }
    });
  }, [showToast]);

  // Persist storage whenever conversations, activeId, theme, or sidebar state updates
  useEffect(() => {
    saveStorageData({
      version: 1,
      conversations,
      activeConversationId: activeId,
      theme,
      themePreset,
      sidebarOpen,
      autoScroll: true,
    });
  }, [conversations, activeId, theme, themePreset, sidebarOpen]);

  // Sync theme preset and dark class to document root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', themePreset);
    if (themePreset === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [themePreset]);

  // Keyboard shortcut listener (Cmd/Ctrl + K for new chat, Esc for close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      } else if (e.key === 'Escape') {
        if (isStreaming) {
          handleStopGeneration();
        }
        setDeleteConfirmId(null);
        setClearAllConfirm(false);
        setExportOpen(false);
        setShortcutsOpen(false);
        setThemeModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  // Toggle Theme between Light and Dark
  const handleToggleTheme = () => {
    if (themePreset === 'light') {
      setThemePreset('midnight');
      setTheme('dark');
      showToast('Switched to Midnight theme', 'info');
    } else {
      setThemePreset('light');
      setTheme('light');
      showToast('Switched to Modernist Light theme', 'info');
    }
  };

  const handleSelectThemePreset = (preset: ThemePreset) => {
    setThemePreset(preset);
    setTheme(preset === 'light' ? 'light' : 'dark');
    showToast(`Theme changed to ${preset.charAt(0).toUpperCase() + preset.slice(1)}`, 'success');
  };

  // Create New Chat
  const handleNewChat = () => {
    if (isStreaming) {
      handleStopGeneration();
    }
    const newConv = createNewConversation('New Chat');
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Select Conversation
  const handleSelectConversation = (id: string) => {
    if (isStreaming) {
      handleStopGeneration();
    }
    setActiveId(id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Rename Conversation Title
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
    showToast('Conversation renamed', 'success');
  };

  // Toggle Pin Conversation
  const handleTogglePinConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  // Delete Conversation Trigger
  const handleDeleteConversation = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteConversation = () => {
    if (!deleteConfirmId) return;

    if (isStreaming && activeId === deleteConfirmId) {
      handleStopGeneration();
    }

    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== deleteConfirmId);
      if (activeId === deleteConfirmId) {
        setActiveId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });

    setDeleteConfirmId(null);
    showToast('Conversation deleted', 'info');
  };

  // Clear All Conversations
  const handleClearAllConversations = () => {
    setClearAllConfirm(true);
  };

  const confirmClearAllConversations = () => {
    if (isStreaming) {
      handleStopGeneration();
    }
    setConversations([]);
    setActiveId(null);
    setClearAllConfirm(false);
    showToast('All chat history cleared', 'info');
  };

  // Delete Single Message
  const handleDeleteMessage = (messageId: string) => {
    if (!activeId) return;
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== activeId) return conv;
        return {
          ...conv,
          messages: conv.messages.filter((m) => m.id !== messageId),
          updatedAt: Date.now(),
        };
      })
    );
    showToast('Message deleted', 'info');
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    // Mark current streaming message complete
    if (activeId) {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== activeId) return conv;
          return {
            ...conv,
            messages: conv.messages.map((m) =>
              m.status === 'streaming' ? { ...m, status: 'complete' } : m
            ),
          };
        })
      );
    }

    showToast('Generation stopped', 'info');
  };

  // Execute AI Streaming
  const executeStreaming = (
    convId: string,
    historyMessages: Message[],
    assistantMessageId: string
  ) => {
    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const formattedHistory = historyMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let accumulatedText = '';

    streamChatResponse({
      messages: formattedHistory,
      signal: controller.signal,
      onChunk: (chunk) => {
        accumulatedText += chunk;
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== convId) return conv;
            return {
              ...conv,
              updatedAt: Date.now(),
              messages: conv.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: accumulatedText, status: 'streaming' }
                  : m
              ),
            };
          })
        );
      },
      onError: (errorMsg) => {
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== convId) return conv;
            return {
              ...conv,
              updatedAt: Date.now(),
              messages: conv.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, status: 'error', error: errorMsg }
                  : m
              ),
            };
          })
        );
        showToast(errorMsg, 'error', 'Generation Failed');
      },
      onComplete: () => {
        setIsStreaming(false);
        abortControllerRef.current = null;
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== convId) return conv;
            return {
              ...conv,
              updatedAt: Date.now(),
              messages: conv.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, status: m.status === 'error' ? 'error' : 'complete' }
                  : m
              ),
            };
          })
        );
      },
    });
  };

  // Send Message
  const handleSendMessage = async (text: string) => {
    let currentConvId = activeId;
    let isFirstMessage = false;

    // If no active conversation, create one
    if (!currentConvId) {
      const newConv = createNewConversation('New Chat');
      currentConvId = newConv.id;
      isFirstMessage = true;
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(currentConvId);
    } else {
      const target = conversations.find((c) => c.id === currentConvId);
      if (target && target.messages.length === 0) {
        isFirstMessage = true;
      }
    }

    const userMessage: Message = {
      id: generateId('msg_user'),
      role: 'user',
      content: text,
      createdAt: Date.now(),
      status: 'complete',
    };

    const assistantMessageId = generateId('msg_ai');
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      status: 'streaming',
      model: 'Gemini Flash',
    };

    let targetHistory: Message[] = [];

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== currentConvId) return conv;
        targetHistory = [...conv.messages, userMessage];
        return {
          ...conv,
          updatedAt: Date.now(),
          messages: [...conv.messages, userMessage, assistantMessage],
        };
      })
    );

    // Auto title generation if first message
    if (isFirstMessage) {
      requestTitleGeneration(text).then((generatedTitle) => {
        if (generatedTitle) {
          setConversations((prev) =>
            prev.map((c) => (c.id === currentConvId ? { ...c, title: generatedTitle } : c))
          );
        }
      });
    }

    // Launch streaming
    executeStreaming(currentConvId, targetHistory, assistantMessageId);
  };

  // Regenerate Response
  const handleRegenerate = (messageId: string) => {
    if (!activeId || isStreaming) return;
    const currentConv = conversations.find((c) => c.id === activeId);
    if (!currentConv) return;

    const msgIndex = currentConv.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // Prune this message and any subsequent messages
    const historyUpToTarget = currentConv.messages.slice(0, msgIndex);
    // Find last user message in this history
    if (historyUpToTarget.length === 0) return;

    const newAssistantMsgId = generateId('msg_ai');
    const newAssistantMsg: Message = {
      id: newAssistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      status: 'streaming',
      model: 'Gemini Flash',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c;
        return {
          ...c,
          updatedAt: Date.now(),
          messages: [...historyUpToTarget, newAssistantMsg],
        };
      })
    );

    executeStreaming(activeId, historyUpToTarget, newAssistantMsgId);
  };

  // Edit and Resubmit User Message
  const handleEditAndResubmit = (messageId: string, newContent: string) => {
    if (!activeId || isStreaming) return;
    const currentConv = conversations.find((c) => c.id === activeId);
    if (!currentConv) return;

    const msgIndex = currentConv.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    const updatedUserMsg: Message = {
      ...currentConv.messages[msgIndex],
      content: newContent,
      createdAt: Date.now(),
    };

    const historyUpToEdit = [
      ...currentConv.messages.slice(0, msgIndex),
      updatedUserMsg,
    ];

    const newAssistantMsgId = generateId('msg_ai');
    const newAssistantMsg: Message = {
      id: newAssistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      status: 'streaming',
      model: 'Gemini Flash',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c;
        return {
          ...c,
          updatedAt: Date.now(),
          messages: [...historyUpToEdit, newAssistantMsg],
        };
      })
    );

    executeStreaming(activeId, historyUpToEdit, newAssistantMsgId);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200 relative bg-transparent">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen((prev) => !prev)}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleRenameConversation}
        onTogglePinConversation={handleTogglePinConversation}
        onDeleteConversation={handleDeleteConversation}
        onClearAllConversations={handleClearAllConversations}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onOpenThemes={() => setThemeModalOpen(true)}
        serverOnline={serverOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-transparent">
        {/* Subtle Ambient Color Spotlights */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-20 right-10 w-[400px] h-[300px] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Chat Header */}
        <ChatHeader
          conversation={activeConversation}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onNewChat={handleNewChat}
          onRenameTitle={(title) => {
            if (activeId) handleRenameConversation(activeId, title);
          }}
          onOpenExport={() => setExportOpen(true)}
          onDeleteConversation={() => {
            if (activeId) handleDeleteConversation(activeId);
          }}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenThemes={() => setThemeModalOpen(true)}
        />

        {/* Chat Body Scrollable Area */}
        <div className="flex-1 overflow-y-auto min-h-0 relative flex flex-col">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <WelcomeScreen onSelectPrompt={handleSendMessage} />
          ) : (
            <MessageList
              messages={activeConversation.messages}
              isStreaming={isStreaming}
              onRegenerate={handleRegenerate}
              onEditAndResubmit={handleEditAndResubmit}
              onDeleteMessage={handleDeleteMessage}
              onShowToast={showToast}
            />
          )}
        </div>

        {/* Message Composer - Always Pinned at Bottom with Glassmorphism */}
        <div className="shrink-0 z-20 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl border-t border-indigo-500/15 dark:border-white/10 pt-2 sm:pt-3">
          <MessageComposer
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            isStreaming={isStreaming}
          />
        </div>
      </main>

      {/* Modals & Dialogs */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        title="Delete Conversation"
        description="Are you sure you want to delete this conversation? This action cannot be undone and will permanently remove this chat from your history."
        confirmLabel="Delete Conversation"
        onConfirm={confirmDeleteConversation}
        onCancel={() => setDeleteConfirmId(null)}
      />

      <ConfirmDialog
        isOpen={clearAllConfirm}
        title="Clear All Chat History"
        description="Are you sure you want to delete all saved conversations? All message history will be permanently erased from your local browser storage."
        confirmLabel="Clear All History"
        onConfirm={confirmClearAllConversations}
        onCancel={() => setClearAllConfirm(false)}
      />

      <ExportDialog
        isOpen={exportOpen}
        conversation={activeConversation}
        onClose={() => setExportOpen(false)}
        onShowToast={showToast}
      />

      <ShortcutsDialog
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      <ThemeSelectorModal
        isOpen={themeModalOpen}
        activePreset={themePreset}
        onSelectPreset={handleSelectThemePreset}
        onClose={() => setThemeModalOpen(false)}
      />

      {/* Floating Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
