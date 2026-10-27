import React, { useState } from 'react';
import { Check, Copy, Terminal, ExternalLink } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

// Tokenizer & syntax highlighter for code blocks
function highlightCode(code: string, language: string): React.ReactNode {
  const lines = code.split('\n');

  return lines.map((line, lineIndex) => {
    // Regex for basic syntax tokens
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let keyIdx = 0;

    // Fast tokenizer matching comments, strings, keywords, numbers
    const tokenRegex = /(\/\/.*$|#.*$|\/\*.*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:const|let|var|function|return|import|export|from|default|class|extends|new|this|async|await|if|else|switch|case|break|for|while|try|catch|finally|throw|typeof|instanceof|interface|type|enum|public|private|protected|readonly|as|static|yield)\b|\b(?:true|false|null|undefined|NaN)\b|\b\d+(?:\.\d+)?\b|\b(?:console|window|document|process|Math|Array|Object|String|Number|Boolean|Promise|JSON|React)\b)/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(line)) !== null) {
      // Text before match
      if (match.index > lastIndex) {
        tokens.push(
          <span key={`txt_${lineIndex}_${keyIdx++}`} className="text-zinc-300 dark:text-zinc-300">
            {line.substring(lastIndex, match.index)}
          </span>
        );
      }

      const matchText = match[0];

      if (matchText.startsWith('//') || matchText.startsWith('#') || matchText.startsWith('/*')) {
        // Comment
        tokens.push(
          <span key={`comm_${lineIndex}_${keyIdx++}`} className="text-emerald-500/80 dark:text-emerald-400/80 italic">
            {matchText}
          </span>
        );
      } else if (matchText.startsWith('"') || matchText.startsWith("'") || matchText.startsWith('`')) {
        // String
        tokens.push(
          <span key={`str_${lineIndex}_${keyIdx++}`} className="text-amber-300 dark:text-amber-300">
            {matchText}
          </span>
        );
      } else if (['true', 'false', 'null', 'undefined', 'NaN'].includes(matchText)) {
        // Boolean / Null
        tokens.push(
          <span key={`bool_${lineIndex}_${keyIdx++}`} className="text-purple-400 dark:text-purple-400 font-semibold">
            {matchText}
          </span>
        );
      } else if (/^\d+/.test(matchText)) {
        // Number
        tokens.push(
          <span key={`num_${lineIndex}_${keyIdx++}`} className="text-orange-400 dark:text-orange-300">
            {matchText}
          </span>
        );
      } else if (['console', 'window', 'document', 'process', 'Math', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Promise', 'JSON', 'React'].includes(matchText)) {
        // Built-in globals
        tokens.push(
          <span key={`glob_${lineIndex}_${keyIdx++}`} className="text-cyan-400 dark:text-cyan-300 font-medium">
            {matchText}
          </span>
        );
      } else {
        // Keyword
        tokens.push(
          <span key={`kw_${lineIndex}_${keyIdx++}`} className="text-pink-400 dark:text-pink-400 font-medium">
            {matchText}
          </span>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      tokens.push(
        <span key={`tail_${lineIndex}_${keyIdx++}`} className="text-zinc-300 dark:text-zinc-300">
          {line.substring(lastIndex)}
        </span>
      );
    }

    return (
      <div key={`line_${lineIndex}`} className="table-row leading-6">
        <span className="table-cell select-none pr-4 text-right text-xs text-zinc-500/70 font-mono w-8">
          {lineIndex + 1}
        </span>
        <span className="table-cell font-mono text-xs sm:text-sm whitespace-pre">
          {tokens.length > 0 ? tokens : <span>&nbsp;</span>}
        </span>
      </div>
    );
  });
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  const lineCount = code.split('\n').length;
  const displayLang = language || 'code';

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800/90 bg-zinc-950 text-zinc-100 shadow-xl transition-all">
      {/* Code Header Bar with macOS Window Dots */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 backdrop-blur-xs select-none">
        <div className="flex items-center gap-2.5">
          {/* macOS window dots */}
          <div className="flex items-center gap-1.5 opacity-80">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-3 w-[1px] bg-zinc-700/60 mx-0.5" />
          <span className="text-xs font-mono font-medium text-zinc-300 uppercase tracking-wider">
            {displayLang}
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 transition-colors cursor-pointer active:scale-95"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-3 sm:p-4 overflow-x-auto text-left font-mono text-xs sm:text-sm">
        <div className="table w-full">
          {highlightCode(code, displayLang)}
        </div>
      </div>
    </div>
  );
}

// Parses inline markdown: bold, italic, code, links, strikethrough
function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  // Regex for inline elements: `code`, **bold**, *italic*, ~~strikethrough~~, [label](url)
  const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|~~[^~]+~~|\[[^\]]+\]\([^)]+\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const m = match[0];

    if (m.startsWith('`') && m.endsWith('`')) {
      // Inline code
      const code = m.slice(1, -1);
      parts.push(
        <code
          key={`inline_code_${keyIndex++}`}
          className="px-1.5 py-0.5 rounded-md text-xs sm:text-sm font-mono bg-zinc-100 dark:bg-zinc-800/90 text-indigo-600 dark:text-indigo-400 border border-zinc-200/80 dark:border-zinc-700/60"
        >
          {code}
        </code>
      );
    } else if ((m.startsWith('**') && m.endsWith('**')) || (m.startsWith('__') && m.endsWith('__'))) {
      // Bold
      parts.push(
        <strong key={`bold_${keyIndex++}`} className="font-semibold text-zinc-900 dark:text-zinc-100">
          {m.slice(2, -2)}
        </strong>
      );
    } else if ((m.startsWith('*') && m.endsWith('*')) || (m.startsWith('_') && m.endsWith('_'))) {
      // Italic
      parts.push(
        <em key={`italic_${keyIndex++}`} className="italic text-zinc-800 dark:text-zinc-200">
          {m.slice(1, -1)}
        </em>
      );
    } else if (m.startsWith('~~') && m.endsWith('~~')) {
      // Strikethrough
      parts.push(
        <del key={`strike_${keyIndex++}`} className="line-through text-zinc-400">
          {m.slice(2, -2)}
        </del>
      );
    } else if (m.startsWith('[') && m.includes('](')) {
      // Link
      const labelMatch = m.match(/\[([^\]]+)\]/);
      const urlMatch = m.match(/\(([^)]+)\)/);
      if (labelMatch && urlMatch) {
        parts.push(
          <a
            key={`link_${keyIndex++}`}
            href={urlMatch[1]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline underline-offset-2 transition-colors font-medium"
          >
            {labelMatch[1]}
            <ExternalLink className="w-3 h-3 inline-block ml-0.5 opacity-70" />
          </a>
        );
      } else {
        parts.push(m);
      }
    } else {
      parts.push(m);
    }

    lastIndex = inlineRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export function MarkdownRenderer({ content, isStreaming }: MarkdownRendererProps) {
  if (!content) {
    return isStreaming ? (
      <span className="inline-block w-2.5 h-4 bg-indigo-500 animate-pulse rounded-xs ml-0.5 align-middle" />
    ) : null;
  }

  // Split content into blocks: code blocks vs regular markdown
  const blocks: React.ReactNode[] = [];
  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeBuffer: string[] = [];
  let blockKey = 0;

  let paragraphBuffer: string[] = [];
  let tableBuffer: string[] = [];
  let inTable = false;

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const text = paragraphBuffer.join('\n');
    paragraphBuffer = [];

    // Parse sub-elements in paragraph
    const pLines = text.split('\n');
    let listBuffer: { type: 'ul' | 'ol'; items: string[] } | null = null;

    const flushList = () => {
      if (!listBuffer) return;
      if (listBuffer.type === 'ul') {
        blocks.push(
          <ul key={`ul_${blockKey++}`} className="list-disc list-outside ml-5 my-2 space-y-1 text-zinc-700 dark:text-zinc-300">
            {listBuffer.items.map((it, idx) => (
              <li key={`uli_${idx}`} className="leading-relaxed">
                {renderInlineFormatting(it)}
              </li>
            ))}
          </ul>
        );
      } else {
        blocks.push(
          <ol key={`ol_${blockKey++}`} className="list-decimal list-outside ml-5 my-2 space-y-1 text-zinc-700 dark:text-zinc-300">
            {listBuffer.items.map((it, idx) => (
              <li key={`oli_${idx}`} className="leading-relaxed">
                {renderInlineFormatting(it)}
              </li>
            ))}
          </ol>
        );
      }
      listBuffer = null;
    };

    for (let i = 0; i < pLines.length; i++) {
      const line = pLines[i];
      const trimmed = line.trim();

      // Heading 1
      if (trimmed.startsWith('# ')) {
        flushList();
        blocks.push(
          <h1 key={`h1_${blockKey++}`} className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-5 mb-2 pb-1 border-b border-zinc-200 dark:border-zinc-800">
            {renderInlineFormatting(trimmed.substring(2))}
          </h1>
        );
        continue;
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        flushList();
        blocks.push(
          <h2 key={`h2_${blockKey++}`} className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-4 mb-2">
            {renderInlineFormatting(trimmed.substring(3))}
          </h2>
        );
        continue;
      }

      // Heading 3
      if (trimmed.startsWith('### ')) {
        flushList();
        blocks.push(
          <h3 key={`h3_${blockKey++}`} className="text-base sm:text-lg font-medium text-zinc-900 dark:text-zinc-200 mt-3 mb-1">
            {renderInlineFormatting(trimmed.substring(4))}
          </h3>
        );
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        flushList();
        blocks.push(
          <blockquote key={`bq_${blockKey++}`} className="border-l-4 border-indigo-500 bg-indigo-500/5 dark:bg-indigo-950/20 px-3.5 py-2 my-2.5 rounded-r-lg text-zinc-700 dark:text-zinc-300 italic">
            {renderInlineFormatting(trimmed.substring(2))}
          </blockquote>
        );
        continue;
      }

      // Horizontal rule
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        flushList();
        blocks.push(
          <hr key={`hr_${blockKey++}`} className="my-4 border-t border-zinc-200 dark:border-zinc-800" />
        );
        continue;
      }

      // Unordered list item (- or *)
      const ulMatch = line.match(/^(\s*)([-*])\s+(.+)$/);
      if (ulMatch) {
        if (!listBuffer || listBuffer.type !== 'ul') {
          flushList();
          listBuffer = { type: 'ul', items: [] };
        }
        listBuffer.items.push(ulMatch[3]);
        continue;
      }

      // Ordered list item (1. )
      const olMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
      if (olMatch) {
        if (!listBuffer || listBuffer.type !== 'ol') {
          flushList();
          listBuffer = { type: 'ol', items: [] };
        }
        listBuffer.items.push(olMatch[3]);
        continue;
      }

      // Normal paragraph line
      flushList();
      if (trimmed) {
        blocks.push(
          <p key={`p_${blockKey++}`} className="my-2 leading-relaxed text-zinc-800 dark:text-zinc-200">
            {renderInlineFormatting(line)}
          </p>
        );
      }
    }

    flushList();
  };

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    const rawRows = tableBuffer.filter((r) => r.trim().startsWith('|'));
    tableBuffer = [];
    inTable = false;

    if (rawRows.length < 2) return;

    // First row is header
    const headers = rawRows[0]
      .split('|')
      .map((c) => c.trim())
      .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);

    // Skip separator row (idx 1)
    const bodyRows = rawRows.slice(2).map((r) =>
      r
        .split('|')
        .map((c) => c.trim())
        .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1)
    );

    blocks.push(
      <div key={`table_${blockKey++}`} className="my-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-semibold text-[11px]">
            <tr>
              {headers.map((h, i) => (
                <th key={`th_${i}`} className="px-3.5 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
                  {renderInlineFormatting(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {bodyRows.map((row, rIdx) => (
              <tr
                key={`tr_${rIdx}`}
                className={rIdx % 2 === 0 ? 'bg-white dark:bg-zinc-900/40' : 'bg-zinc-50/50 dark:bg-zinc-900/80'}
              >
                {row.map((cell, cIdx) => (
                  <td key={`td_${rIdx}_${cIdx}`} className="px-3.5 py-2.5 text-zinc-700 dark:text-zinc-300">
                    {renderInlineFormatting(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        blocks.push(
          <CodeBlock
            key={`code_${blockKey++}`}
            code={codeBuffer.join('\n')}
            language={codeLanguage}
          />
        );
        codeBuffer = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        // Start code block
        flushParagraph();
        flushTable();
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Check for markdown table line
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        flushParagraph();
        inTable = true;
      }
      tableBuffer.push(line);
      continue;
    } else if (inTable) {
      flushTable();
    }

    paragraphBuffer.push(line);
  }

  // Flush remaining buffers
  if (inCodeBlock) {
    blocks.push(
      <CodeBlock
        key={`code_${blockKey++}`}
        code={codeBuffer.join('\n')}
        language={codeLanguage}
      />
    );
  }
  flushTable();
  flushParagraph();

  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none text-sm sm:text-base break-words selection:bg-indigo-500/20 selection:text-indigo-400">
      {blocks}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-indigo-500 animate-pulse rounded-xs ml-1 align-baseline shadow-xs shadow-indigo-500/50" />
      )}
    </div>
  );
}
