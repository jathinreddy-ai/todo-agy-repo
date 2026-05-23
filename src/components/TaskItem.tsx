import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Task } from '../types';
import { TAG_COLORS } from '../utils/dummyData';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  CheckSquare, 
  Square 
} from 'lucide-react';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { 
    toggleTaskCompleted, 
    deleteTask, 
    toggleSubTaskCompleted, 
    setSelectedTask, 
    setIsTaskModalOpen 
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColors = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-rose-500 shadow-rose-500/5 dark:shadow-rose-500/2';
      case 'medium':
        return 'border-l-amber-500 shadow-amber-500/5 dark:shadow-amber-500/2';
      default:
        return 'border-l-primary-500 shadow-primary-500/5 dark:shadow-primary-500/2';
    }
  };

  const getDueDateLabel = (dueDateStr?: string) => {
    if (!dueDateStr) return null;
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0];
    
    if (dueDateStr === todayStr) {
      return <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Today</span>;
    }
    if (dueDateStr === tomorrowStr) {
      return <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Tomorrow</span>;
    }
    
    // Check if overdue
    const isOverdue = dueDateStr < todayStr && !task.completed;
    if (isOverdue) {
      return <span className="text-[10px] font-bold text-rose-600 bg-rose-600/15 animate-pulse px-2 py-0.5 rounded-full uppercase tracking-wider">Overdue</span>;
    }

    // Format standard date
    const date = new Date(dueDateStr);
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return (
      <span className="flex items-center gap-1 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
        <Calendar className="w-3 h-3" />
        {formatted}
      </span>
    );
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering expand
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
  };

  // Progress metrics calculation
  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const hasSubtasks = totalSubtasks > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={() => setIsExpanded(!isExpanded)}
      className={`glass-panel border border-l-4 rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer select-none transition-all duration-300 ${
        task.completed ? 'opacity-60 dark:opacity-40 border-l-neutral-300 dark:border-l-neutral-800' : getPriorityColors(task.priority)
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Checkbox & Header title info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskCompleted(task.id);
            }}
            className="mt-0.5 focus:outline-none shrink-0"
            aria-label={task.completed ? "Mark task incomplete" : "Mark task complete"}
          >
            {task.completed ? (
              <CheckSquare className="w-5 h-5 text-primary-500" />
            ) : (
              <Square className="w-5 h-5 text-neutral-300 dark:text-neutral-700 hover:text-primary-500 dark:hover:text-primary-500 transition-colors" />
            )}
          </button>

          <div className="space-y-1 min-w-0">
            <h4 className={`text-sm font-semibold tracking-tight leading-snug break-words ${
              task.completed ? 'line-through text-neutral-400 dark:text-neutral-600' : 'text-neutral-800 dark:text-neutral-100'
            }`}>
              {task.title}
            </h4>
            
            {/* Tags & Meta Row */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {/* Due Date Indicator */}
              {getDueDateLabel(task.dueDate)}

              {/* Tag Badges */}
              {task.tags.map((tag) => {
                const colors = TAG_COLORS[tag] || { bg: 'bg-primary-500/10', text: 'text-primary-500 dark:text-primary-400', border: 'border-primary-500/20' };
                return (
                  <span
                    key={tag}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    {tag}
                  </span>
                );
              })}

              {/* Subtask completion ratio */}
              {hasSubtasks && (
                <span className="text-[9px] font-extrabold font-mono text-neutral-400 dark:text-neutral-500 bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200/10 dark:border-neutral-800/40 px-1.5 py-0.25 rounded-full">
                  {completedSubtasks}/{totalSubtasks} SUB
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Focus count & Expander controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Estimated Pomodoro Flame list */}
          {task.estimatedPomodoros > 0 && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: task.estimatedPomodoros }).map((_, idx) => {
                const active = idx < task.completedPomodoros;
                return (
                  <Flame
                    key={idx}
                    className={`w-3.5 h-3.5 shrink-0 ${
                      active 
                        ? 'text-primary-500 fill-primary-500/20 animate-pulse' 
                        : 'text-neutral-200 dark:text-neutral-800'
                    }`}
                  />
                );
              })}
            </div>
          )}

          <div className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded specifications & Subtasks */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-3 border-t border-neutral-200/50 dark:border-neutral-800/50 space-y-3.5">
              {/* Description */}
              {task.description && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Details</span>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Subtask Checklists */}
              {hasSubtasks && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Milestones</span>
                  <div className="space-y-1 bg-neutral-50/50 dark:bg-neutral-900/35 border border-neutral-200/20 dark:border-neutral-800/40 p-2.5 rounded-xl">
                    {task.subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSubTaskCompleted(task.id, sub.id);
                        }}
                        className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-white dark:hover:bg-neutral-900/80 cursor-pointer transition-colors"
                      >
                        <button type="button" className="shrink-0 focus:outline-none">
                          {sub.completed ? (
                            <CheckSquare className="w-4 h-4 text-primary-500" />
                          ) : (
                            <Square className="w-4 h-4 text-neutral-300 dark:text-neutral-700" />
                          )}
                        </button>
                        <span className={`text-xs font-medium leading-none truncate ${
                          sub.completed ? 'line-through text-neutral-400 dark:text-neutral-600' : 'text-neutral-700 dark:text-neutral-300'
                        }`}>
                          {sub.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions row */}
              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200/30 dark:border-neutral-800/30">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit details
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/10 text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-500/5 transition-colors focus:outline-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete objective
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
