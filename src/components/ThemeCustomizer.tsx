import React from 'react';
import { useApp } from '../context/AppContext';
import type { AccentTheme } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Sparkles, Check } from 'lucide-react';

export const ThemeCustomizer: React.FC = () => {
  const { 
    accentTheme, 
    setAccentTheme, 
    themeMode, 
    toggleThemeMode, 
    isCustomizerOpen, 
    setIsCustomizerOpen 
  } = useApp();

  const themesList: { id: AccentTheme; name: string; color: string; desc: string }[] = [
    { id: 'indigo', name: 'Violet Indigo', color: 'bg-indigo-500', desc: 'Linear & Apple default productivity' },
    { id: 'emerald', name: 'Emerald Forest', color: 'bg-emerald-500', desc: 'Serene, natural execution focus' },
    { id: 'rose', name: 'Rose Velvet', color: 'bg-rose-500', desc: 'Vibrant, warm, high contrast' },
    { id: 'amber', name: 'Sunset Amber', color: 'bg-amber-500', desc: 'Cozy, energized golden tones' },
    { id: 'cyan', name: 'Cyber Cyan', color: 'bg-cyan-500', desc: 'Futuristic, electric neon glow' },
  ];

  return (
    <AnimatePresence>
      {isCustomizerOpen && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCustomizerOpen(false)}
            className="fixed inset-0 bg-black/30 z-[990] backdrop-blur-sm"
          />

          {/* Sliding Customizer Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm glass-panel border-l z-[991] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-500 animate-pulse" />
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                    Aesthetics Lab
                  </h3>
                </div>
                <button
                  onClick={() => setIsCustomizerOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-all focus:outline-none"
                  aria-label="Close theme customizer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Light/Dark Toggle Section */}
              <div className="py-6 border-b border-neutral-200 dark:border-neutral-800">
                <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                  Visual Mode
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => themeMode !== 'light' && toggleThemeMode()}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all focus:outline-none ${
                      themeMode === 'light'
                        ? 'bg-white text-neutral-800 border-primary-500 shadow-sm ring-1 ring-primary-500/20'
                        : 'bg-transparent text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:text-neutral-200'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Light Mode
                  </button>
                  <button
                    onClick={() => themeMode !== 'dark' && toggleThemeMode()}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all focus:outline-none ${
                      themeMode === 'dark'
                        ? 'bg-neutral-900 text-neutral-100 border-primary-500 shadow-sm ring-1 ring-primary-500/20'
                        : 'bg-transparent text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:text-neutral-800'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Dark Mode
                  </button>
                </div>
              </div>

              {/* Accent Color Presets Selector */}
              <div className="py-6">
                <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                  Colorway Presets
                </h4>
                <div className="flex flex-col gap-3">
                  {themesList.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setAccentTheme(theme.id)}
                      className={`flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all focus:outline-none ${
                        accentTheme === theme.id
                          ? 'border-primary-500/60 bg-primary-500/[0.04] dark:bg-primary-500/[0.02] shadow-sm'
                          : 'border-neutral-200 dark:border-neutral-800/80 bg-transparent hover:bg-neutral-100/50 dark:hover:bg-neutral-900/30'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full ${theme.color} shrink-0 shadow-sm flex items-center justify-center`}>
                        {accentTheme === theme.id && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                          {theme.name}
                        </div>
                        <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 leading-normal">
                          {theme.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Spec Cards */}
            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <h4 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
                Live Accent Preview
              </h4>
              <div className="rounded-xl p-4 bg-primary-500/[0.05] dark:bg-primary-500/[0.03] border border-primary-500/20 shadow-glow-primary">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
                  <span className="text-xs font-medium text-primary-500">SYSTEM STABLE</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                  Glass components and glowing accents automatically sync with the <span className="font-semibold text-primary-500">{accentTheme}</span> palette.
                </p>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium transition-all shadow-sm">
                    Action Button
                  </button>
                  <button className="px-3 py-1.5 rounded-lg border border-primary-500/20 text-primary-500 text-xs font-medium transition-all bg-transparent">
                    Outline
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
