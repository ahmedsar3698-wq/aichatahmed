import React, { useState } from 'react';
import { Trash2, AlertTriangle, Download, Copy, Check, X, Keyboard, FileText, Code2, AlignLeft } from 'lucide-react';
import { Conversation } from '../types/chat';
import { exportConversationData } from '../lib/storage';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Delete',
  isDestructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
          {description}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-all shadow-sm ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500/30'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/30'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ExportDialogProps {
  isOpen: boolean;
  conversation: Conversation | null;
  onClose: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function ExportDialog({
  isOpen,
  conversation,
  onClose,
  onShowToast,
}: ExportDialogProps) {
  const [format, setFormat] = useState<'markdown' | 'json' | 'text'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !conversation) return null;

  const data = exportConversationData(conversation, format);

  const handleDownload = () => {
    const blob = new Blob([data.content], { type: data.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast(`Exported as ${data.filename}`, 'success');
    onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShowToast('Copied exported text to clipboard!', 'success');
    } catch {
      onShowToast('Failed to copy to clipboard', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-5">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Export Conversation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            Select Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFormat('markdown')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                format === 'markdown'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Markdown (.md)
            </button>
            <button
              type="button"
              onClick={() => setFormat('json')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                format === 'json'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Code2 className="w-4 h-4" />
              JSON (.json)
            </button>
            <button
              type="button"
              onClick={() => setFormat('text')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                format === 'text'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <AlignLeft className="w-4 h-4" />
              Plain Text (.txt)
            </button>
          </div>
        </div>

        {/* Preview box */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
            Preview
          </label>
          <div className="h-44 overflow-y-auto rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 font-mono text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap select-all">
            {data.content.slice(0, 800)}
            {data.content.length > 800 ? '\n\n... (preview truncated)' : ''}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Content'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Download {data.filename}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsDialog({ isOpen, onClose }: ShortcutsDialogProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Enter', desc: 'Send message' },
    { key: 'Shift + Enter', desc: 'Add new line in composer' },
    { key: 'Ctrl / Cmd + K', desc: 'Start a new chat' },
    { key: 'Escape', desc: 'Close dialogs or cancel active generation' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-4">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {sc.desc}
              </span>
              <kbd className="px-2 py-1 text-xs font-mono font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
