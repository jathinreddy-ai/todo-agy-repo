export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ReminderConfig {
  type: 'none' | 'exact' | '10m_before' | '1h_before' | '1d_before' | 'custom';
  customTime?: string; // ISO string
  email?: boolean;
  push?: boolean;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  tags: string[];
  subtasks: SubTask[];
  estimatedPomodoros: number;
  completedPomodoros: number;
  reminderConfig?: ReminderConfig;
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
