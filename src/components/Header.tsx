import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, Moon, Sun, ArrowUpDown, Menu } from 'lucide-react';
import type { SortField } from '../types';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { 
    activeFilter, 
    searchQuery, 
    setSearchQuery, 
    sortConfig, 
    setSortConfig, 
    themeMode, 
    toggleThemeMode, 
    setIsTaskModalOpen,
    setSelectedTask
  } = useApp();

  const [isSortOpen, setIsSortOpen] = useState(false);

  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'all': return 'Inbox Workspace';
      case 'today': return 'Due Today';
      case 'upcoming': return 'Upcoming Roadmap';
      case 'completed': return 'Completed Archive';
      default: return `${activeFilter} List`;
    }
  };

  const handleSortChange = (field: SortField) => {
    const nextOrder = sortConfig.field === field && sortConfig.order === 'desc' ? 'asc' : 'desc';
    setSortConfig({ field, order: nextOrder });
    setIsSortOpen(false);
  };

  const handleNewTask = () => {
    setSelectedTask(null); // Clear active selected edit task
    setIsTaskModalOpen(true);
  };

  return (
    <header className="h-16 border-b border-neutral-200/50 dark:border-neutral-800/50 glass-panel sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between transition-all">
      {/* Dynamic Title / Sidebar Toggler */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none md:hidden"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold tracking-tight text-neutral-800 dark:text-neutral-50 md:text-base font-sans">
          {getFilterTitle()}
        </h1>
      </div>

      {/* Global Search and Config Panel */}
      <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end max-w-2xl ml-4">
        {/* Modern Search Bar */}
        <div className="relative w-full max-w-[120px] xs:max-w-[180px] sm:max-w-xs transition-all duration-300">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search objectives..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/10 transition-all font-sans"
          />
        </div>

        {/* Sorting Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className={`p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-all focus:outline-none flex items-center gap-1.5 text-xs font-semibold ${
              isSortOpen ? 'border-primary-500/40 text-primary-500 bg-primary-500/5' : ''
            }`}
            aria-label="Sort configuration"
          >
            <ArrowUpDown className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Sort</span>
          </button>
          
          {isSortOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsSortOpen(false)} />
              <div className="absolute right-0 mt-2 w-44 rounded-xl glass-panel border border-neutral-200/60 dark:border-neutral-800 shadow-lg p-1.5 z-40 animate-fadeIn">
                <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest p-2">
                  Sort objectives by
                </div>
                {(['priority', 'dueDate', 'title', 'createdAt'] as SortField[]).map((field) => {
                  const active = sortConfig.field === field;
                  return (
                    <button
                      key={field}
                      onClick={() => handleSortChange(field)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors focus:outline-none flex items-center justify-between ${
                        active
                          ? 'bg-primary-500/10 dark:bg-primary-500/5 text-primary-500 font-bold'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900/60 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    >
                      <span className="capitalize">
                        {field === 'dueDate' ? 'Due Date' : field === 'createdAt' ? 'Date Created' : field}
                      </span>
                      {active && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.25 bg-primary-500 text-white rounded">
                          {sortConfig.order}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Light/Dark Toggle Button */}
        <button
          onClick={toggleThemeMode}
          className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-all focus:outline-none"
          aria-label="Toggle Theme Mode"
        >
          {themeMode === 'light' ? (
            <Moon className="w-4 h-4 text-neutral-500 fill-neutral-500/10" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400 fill-amber-400/10" />
          )}
        </button>

        {/* Create Task Button */}
        <button
          onClick={handleNewTask}
          className="px-3.5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold transition-all shadow-glow-primary border border-primary-600 flex items-center gap-1.5 focus:outline-none"
        >
          <Plus className="w-4.5 h-4.5 text-white stroke-[2.5]" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>
    </header>
  );
};
