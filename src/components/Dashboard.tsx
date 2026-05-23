import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, TrendingUp, AlertTriangle, ListTodo } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { tasks } = useApp();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Priority counts
  const highPriority = tasks.filter(t => !t.completed && t.priority === 'high').length;


  // Daily salutation based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // SVGRadial Progress Dimensions
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Greetings Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-neutral-200/60 dark:border-neutral-800/80 shadow-sm relative overflow-hidden bg-gradient-to-r from-primary-500/[0.03] to-transparent">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />

        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-1.5 text-primary-500 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-primary-500 fill-primary-500/10" />
            Productivity Suite
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-800 dark:text-neutral-50 font-sans">
            {getGreeting()}, Explorer.
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-lg">
            Focus on what truly matters. You have completed <span className="font-semibold text-primary-500">{completedTasks}</span> tasks out of <span className="font-semibold">{totalTasks}</span> total objectives.
          </p>
        </div>

        {/* Completion Gauge Widget */}
        <div className="flex items-center gap-4 shrink-0 bg-white/40 dark:bg-neutral-900/25 border border-neutral-200/50 dark:border-neutral-800/60 p-3.5 rounded-xl backdrop-blur-md z-10">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-neutral-200 dark:stroke-neutral-800 fill-none"
                strokeWidth="4.5"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-primary-500 fill-none transition-all duration-500 ease-out"
                strokeWidth="4.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-bold font-mono text-neutral-800 dark:text-neutral-100">
              {completionRate}%
            </span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Success Rate
            </div>
            <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mt-0.5">
              Focus is stable
            </div>
          </div>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Core Task Stats Card */}
        <div className="p-5 rounded-2xl glass-panel border border-neutral-200/60 dark:border-neutral-800/80 shadow-sm flex items-center gap-4 hover:border-primary-500/25 transition-all">
          <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              Active Focus
            </div>
            <div className="text-2xl font-black text-neutral-800 dark:text-neutral-100 mt-1">
              {pendingTasks} <span className="text-xs font-medium text-neutral-400">tasks left</span>
            </div>
          </div>
        </div>

        {/* Priority Radar Card */}
        <div className="p-5 rounded-2xl glass-panel border border-neutral-200/60 dark:border-neutral-800/80 shadow-sm flex items-center gap-4 hover:border-primary-500/25 transition-all">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              High Priority Load
            </div>
            <div className="text-2xl font-black text-neutral-800 dark:text-neutral-100 mt-1">
              {highPriority} <span className="text-xs font-medium text-neutral-400">active urgent</span>
            </div>
          </div>
        </div>

        {/* Productivity Index Card */}
        <div className="p-5 rounded-2xl glass-panel border border-neutral-200/60 dark:border-neutral-800/80 shadow-sm flex items-center gap-4 hover:border-primary-500/25 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              Completed Tasks
            </div>
            <div className="text-2xl font-black text-neutral-800 dark:text-neutral-100 mt-1">
              {completedTasks} <span className="text-xs font-medium text-neutral-400">resolved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
