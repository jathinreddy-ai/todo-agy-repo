export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  tags: string[];
  subtasks: SubTask[];
  estimatedPomodoros: number;
  completedPomodoros: number;
  reminder?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FilterType = 'all' | 'today' | 'upcoming' | 'completed' | string; // string represents specific lists/categories

export type SortField = 'dueDate' | 'priority' | 'title' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export type AccentTheme = 'indigo' | 'emerald' | 'rose' | 'amber' | 'cyan';
export type ThemeMode = 'light' | 'dark';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}
