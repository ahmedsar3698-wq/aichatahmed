import React from 'react';
import { Palette, Check, X, Sparkles, Moon, Sun } from 'lucide-react';
import { ThemePreset } from '../types/chat';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  activePreset: ThemePreset;
  onSelectPreset: (preset: ThemePreset) => void;
  onClose: () => void;
}

interface ThemeOption {
  id: ThemePreset;
  name: string;
  tagline: string;
  accentColor: string;
  bgColor: string;
  surfaceColor: string;
  borderClass: string;
  isDark: boolean;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'midnight',
    name: 'Cosmic Galaxy',
    tagline: 'Deep space cosmic navy with electric violet & indigo mesh',
    accentColor: '#6366f1',
    bgColor: '#0b0f1e',
    surfaceColor: '#121830',
    borderClass: 'border-indigo-500/50',
    isDark: true,
  },
  {
    id: 'emerald',
    name: 'Cyber Emerald',
    tagline: 'Deep forest jade with luminous mint & neon mesh',
    accentColor: '#10b981',
    bgColor: '#03140d',
    surfaceColor: '#082619',
    borderClass: 'border-emerald-500/50',
    isDark: true,
  },
  {
    id: 'ocean',
    name: 'Sapphire Ocean',
    tagline: 'Deep marine navy with radiant cyan & sky blue glow',
    accentColor: '#06b6d4',
    bgColor: '#051326',
    surfaceColor: '#0c264a',
    borderClass: 'border-cyan-500/50',
    isDark: true,
  },
  {
    id: 'amber',
    name: 'Sunset Velvet',
    tagline: 'Deep warm plum with glowing rose & golden amber',
    accentColor: '#f43f5e',
    bgColor: '#180b14',
    surfaceColor: '#301628',
    borderClass: 'border-rose-500/50',
    isDark: true,
  },
  {
    id: 'light',
    name: 'Frost Light',
    tagline: 'Crisp ice-white canvas with gentle lavender & indigo ambient',
    accentColor: '#4f46e5',
    bgColor: '#f8fafc',
    surfaceColor: '#ffffff',
    borderClass: 'border-indigo-500/40',
    isDark: false,
  },
];

export function ThemeSelectorModal({
  isOpen,
  activePreset,
  onSelectPreset,
  onClose,
}: ThemeSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-100 p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-100">
                Aesthetic Themes
              </h3>
              <p className="text-xs text-zinc-400">
                Choose your favorite color palette & vibe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme List */}
        <div className="space-y-2.5">
          {THEME_OPTIONS.map((theme) => {
            const isSelected = activePreset === theme.id;

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  onSelectPreset(theme.id);
                }}
                className={`w-full group p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                  isSelected
                    ? `${theme.borderClass} bg-zinc-800/90 ring-1 ring-white/10 shadow-lg`
                    : 'border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-800/50 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Color Swatch Circle */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden shrink-0 border border-white/10"
                    style={{ backgroundColor: theme.bgColor }}
                  >
                    <div
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-100">
                        {theme.name}
                      </span>
                      {theme.isDark ? (
                        <Moon className="w-3 h-3 text-zinc-500" />
                      ) : (
                        <Sun className="w-3 h-3 text-amber-400" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {theme.tagline}
                    </p>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-zinc-700/80 group-hover:border-zinc-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-zinc-900 hover:bg-zinc-100 shadow-sm transition-colors cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
