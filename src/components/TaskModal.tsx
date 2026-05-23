import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Priority, SubTask, ReminderConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Plus, Trash2, Calendar, Tags, CheckSquare, Clock, Bell } from 'lucide-react';
import { PRESET_TAGS } from '../utils/dummyData';

export const TaskModal: React.FC = () => {
  const { 
    selectedTask, 
    isTaskModalOpen, 
    setIsTaskModalOpen, 
    addTask, 
    editTask 
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [dueTime, setDueTime] = useState('');
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>({ type: 'none' });

  // Sync state if editing an existing task
  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title);
      setDescription(selectedTask.description || '');
      setPriority(selectedTask.priority);
      setDueDate(selectedTask.dueDate || '');
      setDueTime(selectedTask.dueTime || '');
      setTags(selectedTask.tags);
      setSubtasks(selectedTask.subtasks);
      setEstimatedPomodoros(selectedTask.estimatedPomodoros);
      setReminderConfig(selectedTask.reminderConfig || { type: 'none' });
    } else {
      // Clear forms for new tasks
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setDueTime('');
      setTags([]);
      setCustomTag('');
      setSubtasks([]);
      setNewSubtaskTitle('');
      setEstimatedPomodoros(1);
      setReminderConfig({ type: 'none' });
    }
  }, [selectedTask, isTaskModalOpen]);

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    
    const newSub: SubTask = {
      id: `sub-${Math.random().toString(36).substring(2, 9)}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };
    
    setSubtasks(prev => [...prev, newSub]);
    setNewSubtaskTitle('');
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(sub => sub.id !== id));
  };

  const handleTagToggle = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(prev => prev.filter(t => t !== tag));
    } else {
      setTags(prev => [...prev, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault();
      const formattedTag = customTag.trim();
      if (!tags.includes(formattedTag)) {
        setTags(prev => [...prev, formattedTag]);
      }
      setCustomTag('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Calculate target UTC timestamp for the reminder
    let targetTimeUtc: string | undefined;
    if (reminderConfig.type !== 'none') {
      if (reminderConfig.type === 'custom' && reminderConfig.customTime) {
        targetTimeUtc = new Date(reminderConfig.customTime).toISOString();
      } else if (dueDate && dueTime) {
        // Parse as local time in the user's browser
        const exactTime = new Date(`${dueDate}T${dueTime}`);
        if (reminderConfig.type === 'exact') targetTimeUtc = exactTime.toISOString();
        else if (reminderConfig.type === '10m_before') targetTimeUtc = new Date(exactTime.getTime() - 10*60000).toISOString();
        else if (reminderConfig.type === '1h_before') targetTimeUtc = new Date(exactTime.getTime() - 60*60000).toISOString();
        else if (reminderConfig.type === '1d_before') targetTimeUtc = new Date(exactTime.getTime() - 24*60*60000).toISOString();
      }
    }

    const taskPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      completed: selectedTask ? selectedTask.completed : false,
      priority,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      tags,
      subtasks,
      estimatedPomodoros,
      completedPomodoros: selectedTask ? selectedTask.completedPomodoros : 0,
      reminderConfig: {
        ...reminderConfig,
        targetTimeUtc
      }
    };

    if (selectedTask) {
      editTask(selectedTask.id, taskPayload);
    } else {
      addTask(taskPayload);
    }

    setIsTaskModalOpen(false);
  };

  return (
    <AnimatePresence>
      {isTaskModalOpen && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsTaskModalOpen(false)}
            className="fixed inset-0 bg-black/40 z-[990] backdrop-blur-sm"
          />

          {/* Modal content box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 m-auto h-fit w-full max-w-lg glass-panel z-[991] shadow-2xl p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between overflow-y-auto max-h-[90vh] focus:outline-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200/50 dark:border-neutral-800/50">
              <h3 className="text-base font-extrabold text-neutral-800 dark:text-neutral-50 font-sans tracking-tight">
                {selectedTask ? 'Edit Objective Details' : 'Initialize New Objective'}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
                aria-label="Close task form"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 flex-1">
              {/* Title input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Objective Name *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Code glassmorphic stats cards..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              {/* Description field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Detailed Specifications</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Incorporate design tokens, custom SVG paths, and frame motion delays..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                />
              </div>

              {/* Priority Load */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Priority Load</label>
                <div className="flex bg-neutral-100 dark:bg-neutral-900/60 p-1 rounded-xl border border-neutral-200/50 dark:border-neutral-800/40">
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                    const active = priority === p;
                    const activeColor = 
                      p === 'high' ? 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/5 border-rose-500/20' : 
                      p === 'medium' ? 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/5 border-amber-500/20' : 
                      'text-primary-500 bg-primary-500/10 dark:bg-primary-500/5 border-primary-500/20';
                    
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all focus:outline-none ${
                          active
                            ? `${activeColor} border shadow-sm`
                            : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dates & Reminders */}
              <div className="grid grid-cols-2 gap-4">
                {/* Due Date picker */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                {/* Due Time picker */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Time
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>

              {/* Reminder Config */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5" /> Notification Reminder
                </label>
                <div className="flex gap-2">
                  <select
                    value={reminderConfig.type}
                    onChange={(e) => setReminderConfig({ ...reminderConfig, type: e.target.value as any })}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary-500 transition-colors"
                  >
                    <option value="none">No reminder</option>
                    <option value="exact">At time of event</option>
                    <option value="10m_before">10 minutes before</option>
                    <option value="1h_before">1 hour before</option>
                    <option value="1d_before">1 day before</option>
                    <option value="custom">Custom time...</option>
                  </select>
                  
                  {reminderConfig.type === 'custom' && (
                    <input
                      type="datetime-local"
                      value={reminderConfig.customTime || ''}
                      onChange={(e) => setReminderConfig({ ...reminderConfig, customTime: e.target.value })}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  )}
                </div>
                {reminderConfig.type !== 'none' && (
                  <div className="flex items-center gap-4 mt-2 px-1">
                    <label className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={reminderConfig.push !== false} // Default true
                        onChange={(e) => setReminderConfig({ ...reminderConfig, push: e.target.checked })}
                        className="rounded border-neutral-300 dark:border-neutral-700 text-primary-500 focus:ring-primary-500 bg-white/50 dark:bg-neutral-900/50"
                      />
                      Desktop Push
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={reminderConfig.email === true} 
                        onChange={(e) => setReminderConfig({ ...reminderConfig, email: e.target.checked })}
                        className="rounded border-neutral-300 dark:border-neutral-700 text-primary-500 focus:ring-primary-500 bg-white/50 dark:bg-neutral-900/50"
                      />
                      Email Notification
                    </label>
                  </div>
                )}
              </div>

              {/* Tags panel */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                  <Tags className="w-3.5 h-3.5" /> Categorization Tags
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {PRESET_TAGS.map((tag) => {
                    const active = tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all border ${
                          active
                            ? 'bg-primary-500 text-white border-primary-600 shadow-glow-primary'
                            : 'bg-neutral-100/60 dark:bg-neutral-900/60 text-neutral-400 dark:text-neutral-400 border-neutral-200/20 dark:border-neutral-800/20 hover:text-neutral-600 dark:hover:text-neutral-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
                {/* Custom tag addition */}
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                  placeholder="Type tag and press Enter for custom tag..."
                  className="w-full mt-1.5 px-3 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/30 dark:bg-neutral-900/30 text-[10px] text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              {/* Subtasks listing */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5" /> Component Checklist
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add checklist milestone..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-3 py-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
                
                {/* Subtask list */}
                {subtasks.length > 0 && (
                  <div className="max-h-28 overflow-y-auto mt-2 border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/35 p-2 space-y-1">
                    {subtasks.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-200/30 dark:hover:border-neutral-800/40">
                        <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 truncate">
                          {sub.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubtask(sub.id)}
                          className="p-1 text-neutral-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pomodoros Estimator slider */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-200/30 dark:border-neutral-800/30 flex items-center justify-between">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-primary-500 fill-primary-500/10 animate-pulse" /> Focus Pomodoros
                  </label>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Budgeted duration units</span>
                </div>
                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900/60 p-2 rounded-xl border border-neutral-200/50 dark:border-neutral-800/40">
                  <button
                    type="button"
                    onClick={() => setEstimatedPomodoros(prev => Math.max(1, prev - 1))}
                    className="w-6 h-6 flex items-center justify-center font-bold text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 focus:outline-none"
                  >
                    -
                  </button>
                  <span className="text-xs font-black font-mono w-4 text-center text-primary-500">
                    {estimatedPomodoros}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEstimatedPomodoros(prev => Math.min(10, prev + 1))}
                    className="w-6 h-6 flex items-center justify-center font-bold text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 focus:outline-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Footer action buttons */}
              <div className="flex gap-3 pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 font-semibold text-xs transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs transition-all shadow-glow-primary border border-primary-600 focus:outline-none"
                >
                  {selectedTask ? 'Save Changes' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
