import React from 'react';
import { useApp } from '../context/AppContext';
import { PomodoroTimer } from './PomodoroTimer';
import { PRESET_TAGS, TAG_COLORS } from '../utils/dummyData';
import { 
  Inbox, 
  Calendar, 
  Clock, 
  CheckSquare, 
  Sliders, 
  ChevronLeft, 
  ChevronRight, 
  Command,
  Sparkles,
  Cloud,
  User,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOpenCloud: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, onOpenCloud }) => {
  const { 
    tasks, 
    activeFilter, 
    setActiveFilter, 
    setIsCustomizerOpen,
    setIsAuthModalOpen,
    dbConnectionStatus,
    currentUser,
    logOut
  } = useApp();

  const getTaskCount = (filter: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    switch (filter) {
      case 'all':
        return tasks.filter(t => !t.completed).length;
      case 'today':
        return tasks.filter(t => !t.completed && t.dueDate === todayStr).length;
      case 'upcoming':
        return tasks.filter(t => !t.completed && t.dueDate && t.dueDate > todayStr).length;
      case 'completed':
        return tasks.filter(t => t.completed).length;
      default:
        // Filter by tags / custom category
        return tasks.filter(t => !t.completed && t.tags.includes(filter)).length;
    }
  };

  const navItems = [
    { id: 'all', label: 'Inbox', icon: <Inbox className="w-4.5 h-4.5" /> },
    { id: 'today', label: 'Today', icon: <Calendar className="w-4.5 h-4.5" /> },
    { id: 'upcoming', label: 'Upcoming', icon: <Clock className="w-4.5 h-4.5" /> },
    { id: 'completed', label: 'Completed', icon: <CheckSquare className="w-4.5 h-4.5" /> },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-40 glass-panel border-r border-neutral-200/60 dark:border-neutral-800/80 shadow-sm flex flex-col transition-all duration-300 ${
        isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'
      }`}
    >
      {/* Brand & Collapse Header */}
      <div className="flex items-center justify-between p-5 border-b border-neutral-200/50 dark:border-neutral-800/50 h-16 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-glow-primary shrink-0">
              <Sparkles className="w-4 h-4 text-white fill-white/10" />
            </div>
            {isOpen && (
              <span className="text-base font-extrabold tracking-tight text-neutral-800 dark:text-neutral-50 font-sans">
                Aether
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? <ChevronLeft className="w-4.5 h-4.5" /> : <ChevronRight className="w-4.5 h-4.5" />}
          </button>
      </div>

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto flex flex-col justify-between">
        {/* Primary Navigation Sections */}
        <div className="p-4 space-y-6">
          {/* Nav List */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = activeFilter === item.id;
              const count = getTaskCount(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveFilter(item.id)}
                  title={item.label}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all focus:outline-none ${
                    active
                      ? 'bg-primary-500 text-white shadow-glow-primary border border-primary-600'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {isOpen && <span>{item.label}</span>}
                  </div>
                  {isOpen && (
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Project Lists / Tags */}
          {isOpen && (
            <div className="space-y-2 animate-fadeIn">
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2.5">
                Categories
              </div>
              <div className="space-y-0.5 max-h-40 overflow-y-auto pr-1">
                {PRESET_TAGS.slice(0, 6).map((tag) => {
                  const active = activeFilter === tag;
                  const count = getTaskCount(tag);
                  const colors = TAG_COLORS[tag] || { dot: 'bg-primary-500' };
                  return (
                    <button
                      key={tag}
                      onClick={() => setActiveFilter(tag)}
                      title={tag}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-all focus:outline-none ${
                        active
                          ? 'bg-primary-500/10 dark:bg-primary-500/5 text-primary-500 font-bold border-l-2 border-primary-500 pl-1.5'
                          : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        <span>{tag}</span>
                      </div>
                      <span className="text-[9px] font-bold font-mono text-neutral-400 dark:text-neutral-500 bg-neutral-100/60 dark:bg-neutral-900/60 px-1.5 py-0.5 rounded-full border border-neutral-200/20 dark:border-neutral-800/20">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      {/* Embedded Pomodoro & Footer */}
      <div className="p-4 space-y-4 shrink-0">
        {isOpen && (
          <div className="animate-fadeIn">
            <PomodoroTimer />
          </div>
        )}

        {/* Customizer trigger & Shortcuts Footer */}
        <div className="space-y-1">
          {/*
          <button
            onClick={onOpenCloud}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900/40 border border-transparent focus:outline-none`}
          >
            <div className="flex items-center gap-3">
              <Cloud className="w-4.5 h-4.5" />
              {isOpen && <span>Cloud Sync Lab</span>}
            </div>
            {isOpen && (
              <span className={`w-2 h-2 rounded-full ${
                dbConnectionStatus === 'connected' ? 'bg-emerald-500 shadow-glow-emerald animate-pulse' :
                dbConnectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' :
                dbConnectionStatus === 'error' ? 'bg-rose-500 animate-pulse' :
                'bg-neutral-400'
              }`} />
            )}
          </button>
          */}
          
          {currentUser ? (
            <div className="flex flex-col gap-1 w-full bg-neutral-100/50 dark:bg-neutral-900/30 p-2 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="relative">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 flex items-center justify-center text-white shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-neutral-900 rounded-full"></span>
                  </div>
                  {isOpen && <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 truncate">{currentUser.email}</span>}
                </div>
                {isOpen && (
                  <button onClick={logOut} className="p-1 rounded-md text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors" title="Sign Out">
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              title="Sign In / Account"
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 shadow-glow-primary transition-colors focus:outline-none`}
            >
              <User className="w-4.5 h-4.5" />
              {isOpen && <span>Sign In / Sign Up</span>}
            </button>
          )}
          <button
            onClick={() => setIsCustomizerOpen(true)}
            title="Aesthetics Lab"
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900/40 border border-transparent focus:outline-none`}
          >
            <Sliders className="w-4.5 h-4.5" />
            {isOpen && <span>Aesthetics Lab</span>}
          </button>
          {isOpen && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
              <Command className="w-3.5 h-3.5" />
              <span>Press <kbd className="font-mono bg-neutral-100 dark:bg-neutral-800 border dark:border-neutral-700/60 px-1.5 py-0.5 rounded text-[8px]">Esc</kbd> to exit panels</span>
            </div>
          )}
        </div>
      </div>
      </div>
    </aside>
  );
};
