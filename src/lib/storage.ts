import { Conversation, Message, StorageData, ThemeMode } from '../types/chat';

const STORAGE_KEY = 'nova_chat_storage_v1';

export const DEFAULT_STORAGE: StorageData = {
  version: 1,
  conversations: [],
  activeConversationId: null,
  theme: 'dark',
  themePreset: 'midnight',
  sidebarOpen: true,
  autoScroll: true,
};

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Safely read data from browser LocalStorage
 */
export function loadStorageData(): StorageData {
  if (typeof window === 'undefined') {
    return DEFAULT_STORAGE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STORAGE;
    }

    const parsed = JSON.parse(raw) as Partial<StorageData>;

    // Basic structure validation and migration safety
    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_STORAGE;
    }

    return {
      version: parsed.version || 1,
      conversations: Array.isArray(parsed.conversations)
        ? parsed.conversations.map((conv) => ({
            id: conv.id || generateId('conv'),
            title: conv.title || 'Untitled Conversation',
            createdAt: conv.createdAt || Date.now(),
            updatedAt: conv.updatedAt || Date.now(),
            messages: Array.isArray(conv.messages)
              ? conv.messages.map((m) => ({
                  id: m.id || generateId('msg'),
                  role: m.role === 'assistant' ? 'assistant' : 'user',
                  content: m.content || '',
                  createdAt: m.createdAt || Date.now(),
                  status: m.status || 'complete',
                  error: m.error,
                  model: m.model,
                }))
              : [],
            pinned: Boolean(conv.pinned),
            systemPrompt: conv.systemPrompt,
          }))
        : [],
      activeConversationId: parsed.activeConversationId || null,
      theme: (parsed.theme as ThemeMode) || 'dark',
      themePreset: (parsed.themePreset as any) || 'midnight',
      sidebarOpen: parsed.sidebarOpen !== undefined ? parsed.sidebarOpen : true,
      autoScroll: parsed.autoScroll !== undefined ? parsed.autoScroll : true,
    };
  } catch (error) {
    console.warn('Failed to load storage data from localStorage:', error);
    return DEFAULT_STORAGE;
  }
}

/**
 * Safely persist data to browser LocalStorage with quota handling
 */
export function saveStorageData(data: StorageData): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('LocalStorage quota exceeded or save error:', error);
    // If quota exceeded, attempt to prune old incomplete states
    try {
      const sanitized = {
        ...data,
        conversations: data.conversations.slice(0, 50).map((c) => ({
          ...c,
          messages: c.messages.slice(-50),
        })),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Helper to create a new conversation
 */
export function createNewConversation(title = 'New Chat'): Conversation {
  return {
    id: generateId('conv'),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    pinned: false,
  };
}

/**
 * Export a conversation to Markdown, JSON, or Plain text
 */
export function exportConversationData(
  conversation: Conversation,
  format: 'markdown' | 'json' | 'text'
): { content: string; filename: string; mimeType: string } {
  const sanitizedTitle = conversation.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

  if (format === 'json') {
    return {
      content: JSON.stringify(conversation, null, 2),
      filename: `${sanitizedTitle}.json`,
      mimeType: 'application/json',
    };
  }

  if (format === 'markdown') {
    let md = `# ${conversation.title}\n`;
    md += `*Date: ${new Date(conversation.createdAt).toLocaleString()}*\n\n---\n\n`;

    conversation.messages.forEach((msg) => {
      const roleName = msg.role === 'user' ? '👤 User' : '🤖 Ahmed AI';
      const time = new Date(msg.createdAt).toLocaleTimeString();
      md += `### ${roleName} (${time})\n\n${msg.content}\n\n---\n\n`;
    });

    return {
      content: md,
      filename: `${sanitizedTitle}.md`,
      mimeType: 'text/markdown',
    };
  }

  // Plain Text
  let txt = `CONVERSATION: ${conversation.title}\n`;
  txt += `Date: ${new Date(conversation.createdAt).toLocaleString()}\n`;
  txt += `========================================\n\n`;

  conversation.messages.forEach((msg) => {
    const roleName = msg.role === 'user' ? 'USER' : 'AHMED AI';
    txt += `[${roleName}] (${new Date(msg.createdAt).toLocaleTimeString()}):\n`;
    txt += `${msg.content}\n\n----------------------------------------\n\n`;
  });

  return {
    content: txt,
    filename: `${sanitizedTitle}.txt`,
    mimeType: 'text/plain',
  };
}
