import type { Task } from '../types';

const today = new Date().toISOString().split('T')[0];

const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const tomorrow = tomorrowDate.toISOString().split('T')[0];

const nextWeekDate = new Date();
nextWeekDate.setDate(nextWeekDate.getDate() + 5);
const nextWeek = nextWeekDate.toISOString().split('T')[0];

export const DUMMY_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Design Linear-style dashboard UI',
    description: 'Implement glassmorphic navigation layouts, glowing border accents, and high-fidelity stat charts.',
    completed: false,
    priority: 'high',
    dueDate: today,
    tags: ['Work', 'Design'],
    subtasks: [
      { id: 'subtask-1-1', title: 'Draft layouts in Figma', completed: true },
      { id: 'subtask-1-2', title: 'Export SVGs and custom SVG blobs', completed: true },
      { id: 'subtask-1-3', title: 'Setup glassmorphism Tailwind utilities', completed: false }
    ],
    estimatedPomodoros: 4,
    completedPomodoros: 2,
    reminder: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: 'Prepare product launch roadmap',
    description: 'Draft the product roadmap slides for next quarters objectives and align timelines with stakeholders.',
    completed: false,
    priority: 'medium',
    dueDate: tomorrow,
    tags: ['Work', 'Planning'],
    subtasks: [
      { id: 'subtask-2-1', title: 'Gather feedback from marketing', completed: false },
      { id: 'subtask-2-2', title: 'Align with engineering leads on milestones', completed: false }
    ],
    estimatedPomodoros: 3,
    completedPomodoros: 0,
    reminder: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task-3',
    title: 'Configure Tailwind HSL color themes',
    description: 'Bind CSS variables to tailwind.config.js to allow live user-selected color-way swapping.',
    completed: true,
    priority: 'high',
    dueDate: today,
    tags: ['Ideas', 'Development'],
    subtasks: [
      { id: 'subtask-3-1', title: 'Define HSL palettes in index.css', completed: true },
      { id: 'subtask-3-2', title: 'Configure tailwind.config extended colors', completed: true }
    ],
    estimatedPomodoros: 2,
    completedPomodoros: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task-4',
    title: 'Revamp cardio & flexibility routine',
    description: 'Schedule a 30-minute full body dynamic stretching routine and active cardio sequence.',
    completed: false,
    priority: 'low',
    dueDate: nextWeek,
    tags: ['Health', 'Fitness'],
    subtasks: [
      { id: 'subtask-4-1', title: 'Select core mobility stretches', completed: true },
      { id: 'subtask-4-2', title: 'Update gym Spotify playlist', completed: false }
    ],
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task-5',
    title: 'Refactor state management core',
    description: 'Verify offline local persistence, debounce auto-saves, and manage responsive viewport layouts.',
    completed: true,
    priority: 'medium',
    dueDate: today,
    tags: ['Development'],
    subtasks: [
      { id: 'subtask-5-1', title: 'Implement local storage sync', completed: true }
    ],
    estimatedPomodoros: 2,
    completedPomodoros: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const PRESET_TAGS = ['Work', 'Personal', 'Health', 'Finance', 'Ideas', 'Development', 'Design', 'Fitness', 'Planning'];

export const TAG_COLORS: Record<string, { bg: string, text: string, border: string, dot: string }> = {
  Work: { bg: 'bg-blue-500/10', text: 'text-blue-500 dark:text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-500' },
  Personal: { bg: 'bg-purple-500/10', text: 'text-purple-500 dark:text-purple-400', border: 'border-purple-500/20', dot: 'bg-purple-500' },
  Health: { bg: 'bg-emerald-500/10', text: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
  Finance: { bg: 'bg-amber-500/10', text: 'text-amber-500 dark:text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-500' },
  Ideas: { bg: 'bg-rose-500/10', text: 'text-rose-500 dark:text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-500' },
  Development: { bg: 'bg-cyan-500/10', text: 'text-cyan-500 dark:text-cyan-400', border: 'border-cyan-500/20', dot: 'bg-cyan-500' },
  Design: { bg: 'bg-pink-500/10', text: 'text-pink-500 dark:text-pink-400', border: 'border-pink-500/20', dot: 'bg-pink-500' },
  Fitness: { bg: 'bg-teal-500/10', text: 'text-teal-500 dark:text-teal-400', border: 'border-teal-500/20', dot: 'bg-teal-500' },
  Planning: { bg: 'bg-indigo-500/10', text: 'text-indigo-500 dark:text-indigo-400', border: 'border-indigo-500/20', dot: 'bg-indigo-500' },
};
