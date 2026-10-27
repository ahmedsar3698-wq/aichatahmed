export type Role = 'user' | 'assistant';

export type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error';

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  status?: MessageStatus;
  error?: string;
  model?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  pinned?: boolean;
  systemPrompt?: string;
}

export type ThemeMode = 'dark' | 'light' | 'system';
export type ThemePreset = 'midnight' | 'emerald' | 'ocean' | 'amber' | 'light';

export interface StorageData {
  version: number;
  conversations: Conversation[];
  activeConversationId: string | null;
  theme: ThemeMode;
  themePreset?: ThemePreset;
  sidebarOpen: boolean;
  autoScroll: boolean;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

export interface PromptSuggestion {
  id: string;
  title: string;
  prompt: string;
  category: 'code' | 'creative' | 'writing' | 'analysis';
  badge: string;
}
