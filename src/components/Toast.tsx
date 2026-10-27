import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { ToastItem } from '../types/chat';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-indigo-400 shrink-0" />;
        let borderClass = 'border-indigo-500/30';
        let bgClass = 'bg-zinc-900/95';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          borderClass = 'border-emerald-500/30';
        } else if (toast.type === 'error') {
          icon = <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />;
          borderClass = 'border-rose-500/30';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${borderClass} ${bgClass} text-zinc-100 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-0.5">
                  {toast.title}
                </div>
              )}
              <div className="text-xs sm:text-sm text-zinc-200 font-medium leading-snug">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-zinc-400 hover:text-zinc-200 p-0.5 rounded-md hover:bg-zinc-800 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
