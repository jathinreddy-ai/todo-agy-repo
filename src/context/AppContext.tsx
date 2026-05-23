import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Task, AccentTheme, ThemeMode, SortConfig, ToastMessage, SubTask } from '../types';
import { DUMMY_TASKS } from '../utils/dummyData';
import { getStoredDbConfig, createDbService } from '../services/db';
import type { IDbService, DbConfig } from '../services/db';
import { getAuth, signInWithEmailAndPassword as fbSignIn, createUserWithEmailAndPassword as fbCreateUser, signOut as fbSignOut, onAuthStateChanged as fbOnAuthChange } from 'firebase/auth';
import { SupabaseClient } from '@supabase/supabase-js';

interface AppContextProps {
  tasks: Task[];
  activeFilter: string;
  searchQuery: string;
  sortConfig: SortConfig;
  accentTheme: AccentTheme;
  themeMode: ThemeMode;
  toasts: ToastMessage[];
  selectedTask: Task | null;
  isTaskModalOpen: boolean;
  isCustomizerOpen: boolean;
  isAuthModalOpen: boolean;
  
  // Database & Auth States
  dbConfig: DbConfig;
  dbConnectionStatus: 'local' | 'connecting' | 'connected' | 'error';
  currentUser: { uid: string; email: string } | null;
  isLoadingUser: boolean;
  isLoadingTasks: boolean;
  
  // Database & Auth Actions
  updateDbConfig: (config: DbConfig) => void;
  signUp: (email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  migrateLocalTasks: () => Promise<void>;

  // Tasks actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editTask: (id: string, updatedTask: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;
  reorderTasks: (newTasks: Task[]) => void;
  
  // Subtasks actions
  toggleSubTaskCompleted: (taskId: string, subtaskId: string) => void;
  addSubTask: (taskId: string, title: string) => void;
  deleteSubTask: (taskId: string, subtaskId: string) => void;
  
  // Filters & UI Actions
  setActiveFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  setSortConfig: (config: SortConfig) => void;
  setAccentTheme: (theme: AccentTheme) => void;
  toggleThemeMode: () => void;
  setSelectedTask: (task: Task | null) => void;
  setIsTaskModalOpen: (isOpen: boolean) => void;
  setIsCustomizerOpen: (isOpen: boolean) => void;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  
  // Toasts Actions
  addToast: (message: string, type: ToastMessage['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Database states
  const [dbConfig, setDbConfig] = useState<DbConfig>(() => getStoredDbConfig());
  const [dbService, setDbService] = useState<IDbService>(() => createDbService(dbConfig));
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'local' | 'connecting' | 'connected' | 'error'>('local');
  
  // Auth states
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  
  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);

  // UI States
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'priority', order: 'desc' });
  
  // Load theme configurations
  const [accentTheme, setAccentThemeState] = useState<AccentTheme>(() => {
    return (localStorage.getItem('todo_app_accent') as AccentTheme) || 'indigo';
  });
  
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('todo_app_mode') as ThemeMode;
    if (saved) return saved;
    return 'dark'; // default premium dark theme
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync themes to local storage and modify root class list
  useEffect(() => {
    localStorage.setItem('todo_app_accent', accentTheme);
    localStorage.setItem('todo_app_mode', themeMode);
    
    const root = window.document.documentElement;
    
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    const themes: AccentTheme[] = ['indigo', 'emerald', 'rose', 'amber', 'cyan'];
    themes.forEach(t => root.classList.remove(`theme-${t}`));
    root.classList.add(`theme-${accentTheme}`);
  }, [accentTheme, themeMode]);

  // Handle database dynamic instantiation and authentication subscriptions
  useEffect(() => {
    const service = createDbService(dbConfig);
    setDbService(service);
    setDbConnectionStatus('connecting');
    setCurrentUser(null);
    setIsLoadingUser(true);
    
    let unsubscribeAuth: (() => void) | undefined;
    
    if (service.name === 'supabase') {
      const client = (service as any).getClient() as SupabaseClient;
      
      // Check current session
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setCurrentUser({
            uid: session.user.id,
            email: session.user.email || '',
          });
        } else {
          setCurrentUser(null);
        }
        setDbConnectionStatus('connected');
        setIsLoadingUser(false);
      }).catch(err => {
        console.error('Supabase session fetch error:', err);
        setDbConnectionStatus('error');
        setIsLoadingUser(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setCurrentUser({
            uid: session.user.id,
            email: session.user.email || '',
          });
        } else {
          setCurrentUser(null);
        }
        setIsLoadingUser(false);
      });

      unsubscribeAuth = () => subscription.unsubscribe();
    } else if (service.name === 'firebase') {
      try {
        const auth = getAuth();
        unsubscribeAuth = fbOnAuthChange(auth, (user) => {
          if (user) {
            setCurrentUser({
              uid: user.uid,
              email: user.email || '',
            });
          } else {
            setCurrentUser(null);
          }
          setDbConnectionStatus('connected');
          setIsLoadingUser(false);
        }, (err) => {
          console.error('Firebase auth status error:', err);
          setDbConnectionStatus('error');
          setIsLoadingUser(false);
        });
      } catch (e) {
        console.error('Firebase Auth initialization error:', e);
        setDbConnectionStatus('error');
        setIsLoadingUser(false);
      }
    } else {
      // Local Mode
      setDbConnectionStatus('local');
      setIsLoadingUser(false);
    }

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, [dbConfig]);

  // Fetch tasks when database service or user changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    setIsLoadingTasks(true);

    if (dbService.name === 'local') {
      unsubscribe = dbService.subscribeToTasks(undefined, (localTasks) => {
        setTasks(localTasks.length > 0 ? localTasks : DUMMY_TASKS);
        setIsLoadingTasks(false);
      });
    } else {
      if (currentUser) {
        unsubscribe = dbService.subscribeToTasks(currentUser.uid, (cloudTasks) => {
          setTasks(cloudTasks);
          setIsLoadingTasks(false);
        });
      } else {
        // Load local storage tasks as fallback if not logged in to cloud
        const localService = createDbService({ type: 'local' });
        unsubscribe = localService.subscribeToTasks(undefined, (localTasks) => {
          setTasks(localTasks.length > 0 ? localTasks : DUMMY_TASKS);
          setIsLoadingTasks(false);
        });
      }
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [dbService, currentUser]);

  // Database credentials update handler
  const updateDbConfig = (newConfig: DbConfig) => {
    setIsLoadingTasks(true);
    try {
      localStorage.setItem('todo_app_db_type', newConfig.type);
      if (newConfig.type === 'supabase') {
        localStorage.setItem('todo_app_supabase_url', newConfig.supabaseUrl || '');
        localStorage.setItem('todo_app_supabase_anon_key', newConfig.supabaseAnonKey || '');
      } else if (newConfig.type === 'firebase') {
        localStorage.setItem('todo_app_firebase_config', JSON.stringify(newConfig.firebaseConfig || null));
      } else {
        localStorage.removeItem('todo_app_supabase_url');
        localStorage.removeItem('todo_app_supabase_anon_key');
        localStorage.removeItem('todo_app_firebase_config');
      }

      setDbConfig(newConfig);
      addToast(`Switched backend to ${newConfig.type.toUpperCase()}`, 'success');
    } catch (err: any) {
      console.error(err);
      addToast('Failed to update backend credentials', 'error');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Cloud Auth Methods
  const signUp = async (email: string, password: string) => {
    setIsLoadingUser(true);
    try {
      if (dbService.name === 'supabase') {
        const client = (dbService as any).getClient() as SupabaseClient;
        const { error } = await client.auth.signUp({ email, password });
        if (error) throw error;
        addToast('Sign up successful! Please check your email.', 'success');
      } else if (dbService.name === 'firebase') {
        const auth = getAuth();
        await fbCreateUser(auth, email, password);
        addToast('Account registered successfully!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Signup failure', 'error');
      throw err;
    } finally {
      setIsLoadingUser(false);
    }
  };

  const logIn = async (email: string, password: string) => {
    setIsLoadingUser(true);
    try {
      if (dbService.name === 'supabase') {
        const client = (dbService as any).getClient() as SupabaseClient;
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        addToast('Welcome back!', 'success');
      } else if (dbService.name === 'firebase') {
        const auth = getAuth();
        await fbSignIn(auth, email, password);
        addToast('Logged in successfully!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Login failure', 'error');
      throw err;
    } finally {
      setIsLoadingUser(false);
    }
  };

  const logInWithGoogle = async () => {
    setIsLoadingUser(true);
    try {
      if (dbService.name === 'supabase') {
        const client = (dbService as any).getClient() as SupabaseClient;
        const { error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      } else if (dbService.name === 'firebase') {
        const auth = getAuth();
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        addToast('Logged in with Google!', 'success');
      } else {
        throw new Error('Please link a cloud database in Settings to use Google Sign-In.');
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Google Login failure', 'error');
    } finally {
      setIsLoadingUser(false);
    }
  };

  const logOut = async () => {
    setIsLoadingUser(true);
    try {
      if (dbService.name === 'supabase') {
        const client = (dbService as any).getClient() as SupabaseClient;
        const { error } = await client.auth.signOut();
        if (error) throw error;
      } else if (dbService.name === 'firebase') {
        const auth = getAuth();
        await fbSignOut(auth);
      }
      addToast('Logged out successfully', 'info');
    } catch (err: any) {
      console.error(err);
      addToast('Failed to log out', 'error');
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Auto task migration (Local -> Cloud)
  const migrateLocalTasks = async () => {
    if (!currentUser) {
      addToast('Must be logged in to migrate tasks', 'warning');
      return;
    }
    
    setIsLoadingTasks(true);
    try {
      const saved = localStorage.getItem('todo_app_tasks');
      let localTasks: Task[] = [];
      if (saved) {
        try {
          localTasks = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
      
      if (localTasks.length === 0) {
        addToast('No offline tasks found to migrate', 'info');
        return;
      }

      await dbService.bulkAddTasks(localTasks, currentUser.uid);
      localStorage.removeItem('todo_app_tasks');
      
      // Refetch tasks from cloud
      const cloudTasks = await dbService.getTasks(currentUser.uid);
      setTasks(cloudTasks);
      
      addToast(`Migrated ${localTasks.length} tasks successfully! 🚀`, 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to migrate tasks', 'error');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Accent Switcher Wrapper
  const setAccentTheme = (theme: AccentTheme) => {
    setAccentThemeState(theme);
    addToast(`Theme accent changed to ${theme.charAt(0).toUpperCase() + theme.slice(1)}`, 'info');
  };

  // Theme Mode Toggler Wrapper
  const toggleThemeMode = () => {
    setThemeModeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      addToast(`Switched to ${next} mode`, 'info');
      return next;
    });
  };

  // Toast notifications management
  const addToast = (message: string, type: ToastMessage['type'], duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Task Actions
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (dbConfig.type !== 'local' && !currentUser) {
      addToast('Please sign in to save tasks to the cloud.', 'warning');
      setIsAuthModalOpen(true);
      return;
    }
    
    try {
      const newTask = await dbService.addTask(taskData, currentUser?.uid);
      setTasks(prev => [newTask, ...prev]);
      addToast('Task created successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to create task', 'error');
    }
  };

  const editTask = async (id: string, updatedTaskData: Partial<Task>) => {
    if (dbConfig.type !== 'local' && !currentUser) {
      addToast('Please sign in to modify tasks.', 'warning');
      return;
    }

    try {
      const updated = await dbService.updateTask(id, updatedTaskData);
      setTasks(prev => prev.map(task => {
        if (task.id === id) {
          return {
            ...task,
            ...updatedTaskData,
            updatedAt: updated.updatedAt
          };
        }
        return task;
      }));
      addToast('Task updated successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to update task', 'error');
    }
  };

  const deleteTask = async (id: string) => {
    if (dbConfig.type !== 'local' && !currentUser) {
      addToast('Please sign in to delete tasks.', 'warning');
      return;
    }

    try {
      await dbService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      addToast('Task deleted successfully', 'error');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const toggleTaskCompleted = async (id: string) => {
    if (dbConfig.type !== 'local' && !currentUser) {
      addToast('Please sign in to save progress.', 'warning');
      return;
    }

    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const nextCompleted = !task.completed;
    
    try {
      await dbService.updateTask(id, { completed: nextCompleted });
      
      setTasks(prev => prev.map(t => {
        if (t.id === id) {
          if (nextCompleted) {
            addToast('Task completed! Great job! 🎉', 'success');
            import('canvas-confetti').then((confetti) => {
              confetti.default({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.8 },
                colors: ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4']
              });
            }).catch(err => console.log('Error loading confetti', err));
          } else {
            addToast('Task marked incomplete', 'info');
          }

          return {
            ...t,
            completed: nextCompleted,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      }));
    } catch (err: any) {
      console.error(err);
      addToast('Failed to toggle task state', 'error');
    }
  };

  const reorderTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  // Subtask Actions
  const toggleSubTaskCompleted = async (taskId: string, subtaskId: string) => {
    if (dbConfig.type !== 'local' && !currentUser) {
      addToast('Please sign in to save progress.', 'warning');
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedSubtasks = task.subtasks.map(sub => {
      if (sub.id === subtaskId) {
        return { ...sub, completed: !sub.completed };
      }
      return sub;
    });

    const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
    let completed = task.completed;
    
    if (allCompleted && !task.completed) {
      completed = true;
      addToast('All subtasks completed! Task done! 🚀', 'success');
      import('canvas-confetti').then((confetti) => {
        confetti.default({ particleCount: 50, spread: 40 });
      });
    }

    try {
      await dbService.updateTask(taskId, { subtasks: updatedSubtasks, completed });
      
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            completed,
            subtasks: updatedSubtasks,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      }));
    } catch (err: any) {
      console.error(err);
      addToast('Failed to update subtask', 'error');
    }
  };

  const addSubTask = async (taskId: string, title: string) => {
    if (dbConfig.type !== 'local' && !currentUser) {
      addToast('Please sign in to add subtasks.', 'warning');
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSub: SubTask = {
      id: `sub-${Math.random().toString(36).substring(2, 9)}`,
      title,
      completed: false
    };

    const updatedSubtasks = [...task.subtasks, newSub];

    try {
      await dbService.updateTask(taskId, { subtasks: updatedSubtasks, completed: false });
      
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            completed: false,
            subtasks: updatedSubtasks,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      }));
      addToast('Subtask added', 'success');
    } catch (err: any) {
      console.error(err);
      addToast('Failed to add subtask', 'error');
    }
  };

  const deleteSubTask = async (taskId: string, subtaskId: string) => {
    if (dbConfig.type !== 'local' && !currentUser) {
      addToast('Please sign in to modify subtasks.', 'warning');
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.filter(sub => sub.id !== subtaskId);

    try {
      await dbService.updateTask(taskId, { subtasks: updatedSubtasks });
      
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: updatedSubtasks,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      }));
      addToast('Subtask deleted', 'info');
    } catch (err: any) {
      console.error(err);
      addToast('Failed to delete subtask', 'error');
    }
  };

  return (
    <AppContext.Provider value={{
      tasks,
      activeFilter,
      searchQuery,
      sortConfig,
      accentTheme,
      themeMode,
      toasts,
      selectedTask,
      isTaskModalOpen,
      isCustomizerOpen,
      isAuthModalOpen,
      
      dbConfig,
      dbConnectionStatus,
      currentUser,
      isLoadingUser,
      isLoadingTasks,
      
      updateDbConfig,
      signUp,
      logIn,
      logInWithGoogle,
      logOut,
      migrateLocalTasks,
      
      addTask,
      editTask,
      deleteTask,
      toggleTaskCompleted,
      reorderTasks,
      toggleSubTaskCompleted,
      addSubTask,
      deleteSubTask,
      setActiveFilter,
      setSearchQuery,
      setSortConfig,
      setAccentTheme,
      toggleThemeMode,
      setSelectedTask,
      setIsTaskModalOpen,
      setIsCustomizerOpen,
      setIsAuthModalOpen,
      addToast,
      removeToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
