import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Sparkles, Plus, SearchCheck, CheckSquare } from 'lucide-react';

export const EmptyState: React.FC = () => {
  const { searchQuery, activeFilter, setIsTaskModalOpen, setSelectedTask } = useApp();

  const handleCreateNew = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const getDetails = () => {
    if (searchQuery) {
      return {
        icon: <SearchCheck className="w-10 h-10 text-neutral-400 dark:text-neutral-500 stroke-[1.5]" />,
        title: 'No matches found',
        desc: `We couldn't find anything matching "${searchQuery}". Double-check your spelling or adjust filters.`
      };
    }
    
    switch (activeFilter) {
      case 'today':
        return {
          icon: <CheckSquare className="w-10 h-10 text-primary-500/80 stroke-[1.5] animate-pulse" />,
          title: 'Schedule clear for today',
          desc: 'Enjoy the peace of mind! No objectives are due today. Take a break or add tomorrow\'s ahead of time.'
        };
      case 'completed':
        return {
          icon: <CheckSquare className="w-10 h-10 text-emerald-500/80 stroke-[1.5]" />,
          title: 'No completed tasks yet',
          desc: 'Every journey starts with a single step. Mark off tasks in your workspace to archive them here!'
        };
      default:
        return {
          icon: <Sparkles className="w-10 h-10 text-primary-500/80 stroke-[1.5] animate-bounce" />,
          title: 'Your workspace is empty',
          desc: 'Create clear, structured objectives. Keep track of estimated pomodoros, checklists, and priorities.'
        };
    }
  };

  const { icon, title, desc } = getDetails();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center p-8 text-center rounded-2xl glass-panel border border-neutral-200/50 dark:border-neutral-800/60 shadow-sm max-w-lg mx-auto py-16"
    >
      {/* Icon block */}
      <div className="w-20 h-20 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/60 border border-neutral-200/40 dark:border-neutral-800/40 flex items-center justify-center mb-6 shadow-sm">
        {icon}
      </div>

      {/* Message */}
      <h3 className="text-base font-extrabold text-neutral-800 dark:text-neutral-100 font-sans tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed max-w-sm">
        {desc}
      </p>

      {/* Call to action (Only if not a query filter empty state) */}
      {!searchQuery && (
        <button
          onClick={handleCreateNew}
          className="mt-6 px-4.5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold transition-all shadow-glow-primary border border-primary-600 flex items-center gap-1.5 focus:outline-none"
        >
          <Plus className="w-4 h-4 text-white stroke-[2.5]" />
          Create Task
        </button>
      )}
    </motion.div>
  );
};
