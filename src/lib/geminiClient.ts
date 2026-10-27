import { Message } from '../types/chat';

export interface StreamChatOptions {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemInstruction?: string;
  temperature?: number;
  onChunk: (textChunk: string) => void;
  onError: (errorMessage: string) => void;
  onComplete: () => void;
  signal?: AbortSignal;
}

/**
 * Connect to the server-side streaming chat endpoint using SSE
 */
export async function streamChatResponse({
  messages,
  systemInstruction,
  temperature,
  onChunk,
  onError,
  onComplete,
  signal,
}: StreamChatOptions): Promise<void> {
  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        systemInstruction,
        temperature,
      }),
      signal,
    });

    if (!response.ok) {
      let errText = `Server responded with status ${response.status}`;
      try {
        const raw = await response.text();
        try {
          const errJson = JSON.parse(raw);
          errText = errJson.error || errJson.message || raw;
        } catch {
          // If not JSON, use the raw text
          if (raw) errText = raw;
        }
      } catch (e) {
        console.error('Failed to read error response:', e);
      }
      onError(errText);
      onComplete();
      return;
    }

    if (!response.body) {
      onError('Response stream is empty.');
      onComplete();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;

        const dataContent = trimmed.replace(/^data:\s*/, '');
        if (dataContent === '[DONE]') {
          onComplete();
          return;
        }

        try {
          const parsed = JSON.parse(dataContent);
          if (parsed.error) {
            onError(parsed.error);
            onComplete();
            return;
          }
          if (parsed.text) {
            onChunk(parsed.text);
          }
        } catch {
          // Non-JSON SSE line or partial chunk, continue
        }
      }
    }

    // Flush any remaining line
    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (trimmed.startsWith('data:')) {
        const dataContent = trimmed.replace(/^data:\s*/, '');
        if (dataContent === '[DONE]') {
          onComplete();
          return;
        }
        try {
          const parsed = JSON.parse(dataContent);
          if (parsed.text) onChunk(parsed.text);
          if (parsed.error) onError(parsed.error);
        } catch {}
      }
    }

    onComplete();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      // Intentional user cancellation
      onComplete();
      return;
    }
    console.error('Stream request error:', err);
    onError(err.message || 'Failed to stream AI response. Please check your network connection.');
    onComplete();
  }
}

/**
 * Generate a short concise title from the user's initial prompt
 */
export async function requestTitleGeneration(prompt: string): Promise<string | null> {
  try {
    const res = await fetch('/api/chat/title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.title || null;
  } catch (e) {
    console.warn('Title generation error:', e);
    return null;
  }
}

/**
 * Check server configuration and health
 */
export async function checkServerStatus(): Promise<{
  status: string;
  hasApiKey: boolean;
  model: string;
} | null> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
