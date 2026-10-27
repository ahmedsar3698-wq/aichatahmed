import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Format and normalize history for the Gemini API
function formatGeminiContents(messages: IncomingMessage[]) {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of messages) {
    if (!msg.content || !msg.content.trim()) continue;
    const role: 'user' | 'model' = msg.role === 'assistant' ? 'model' : 'user';

    // Merge consecutive messages with the same role
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += `\n\n${msg.content.trim()}`;
    } else {
      contents.push({
        role,
        parts: [{ text: msg.content.trim() }],
      });
    }
  }

  // Gemini API requires the first turn to be 'user'
  if (contents.length > 0 && contents[0].role === 'model') {
    contents.unshift({
      role: 'user',
      parts: [{ text: 'Hello' }],
    });
  }

  return contents;
}

// API: Health / Status
app.get('/api/status', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    model: 'gemini-3.1-flash-lite',
    timestamp: Date.now(),
  });
});

// API: Generate Conversation Title
app.post('/api/chat/title', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is not configured.' });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const result = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Generate a concise 3 to 5 word title summarizing the user message below. Output ONLY the title text, with no quotation marks, no markdown symbols, and no trailing punctuation:\n\n"${prompt.slice(0, 500)}"`,
      config: { temperature: 0.3 },
    });

    const cleanTitle = (result.text || 'New Chat')
      .replace(/^["'`\s]+|["'`\s]+$/g, '')
      .replace(/[#*_~`]/g, '')
      .slice(0, 50)
      .trim();

    return res.json({ title: cleanTitle || 'New Conversation' });
  } catch (error: any) {
    console.error('Error generating title:', error);
    return res.json({ title: prompt.slice(0, 32).trim() + (prompt.length > 32 ? '...' : '') });
  }
});

// API: Streaming Chat
app.post('/api/chat/stream', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured in the server environment. Please configure your Gemini API Key in the Settings > Secrets panel.',
    });
  }

  const { messages, systemInstruction, temperature } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required and must not be empty.' });
  }

  const formattedContents = formatGeminiContents(messages);
  if (formattedContents.length === 0) {
    return res.status(400).json({ error: 'No valid message content provided.' });
  }

  // Set up Server-Sent Events headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  let clientAborted = false;
  res.on('close', () => {
    if (!res.writableEnded) {
      clientAborted = true;
    }
  });

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const defaultSystem = 'You are Ahmed AI, an intelligent, helpful, articulate, and friendly AI assistant. You provide clear, well-structured, and accurate responses. When explaining technical topics or sharing code, write clean code blocks with language identifiers and comprehensive comments where helpful. Use markdown formatting gracefully to improve readability.';

    const selectedModel = req.body.model || 'gemini-3.1-flash-lite';

    const responseStream = await ai.models.generateContentStream({
      model: selectedModel,
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction || defaultSystem,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      },
    });

    for await (const chunk of responseStream) {
      if (clientAborted || res.writableEnded || res.destroyed) {
        break;
      }
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    if (!res.writableEnded && !res.destroyed) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (error: any) {
    console.error('Gemini Stream Error:', error);
    let errorMessage = 'An error occurred while communicating with Gemini.';

    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      errorMessage = 'You have exceeded the current Gemini API rate limit or quota. Please wait a few moments before trying again.';
    } else if (error?.status === 400 || error?.message?.includes('API_KEY_INVALID') || error?.message?.includes('INVALID_ARGUMENT')) {
      errorMessage = 'Invalid Gemini API key or request payload. Please verify your GEMINI_API_KEY.';
    } else if (error?.message) {
      errorMessage = error.message;
    }

    if (!res.writableEnded && !res.destroyed) {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  }
});

// Vite Middleware for Dev / Static Files for Prod
async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nova AI Chatbot server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
