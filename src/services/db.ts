import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch, query, where, Firestore, onSnapshot } from 'firebase/firestore';
import type { Task } from '../types';

export interface IDbService {
  name: 'supabase' | 'firebase' | 'local';
  getTasks(userId?: string): Promise<Task[]>;
  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  bulkAddTasks(tasks: Task[], userId?: string): Promise<void>;
  subscribeToTasks(userId: string | undefined, callback: (tasks: Task[]) => void): () => void;
}

// -------------------------------------------------------------
// PostgreSQL <-> TypeScript Mappers for Supabase
// -------------------------------------------------------------
function mapTaskFromDb(dbTask: any): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || undefined,
    completed: dbTask.completed,
    priority: dbTask.priority,
    dueDate: dbTask.due_date || undefined,
    tags: dbTask.tags || [],
    subtasks: typeof dbTask.subtasks === 'string' ? JSON.parse(dbTask.subtasks) : (dbTask.subtasks || []),
    estimatedPomodoros: dbTask.estimated_pomodoros || 1,
    completedPomodoros: dbTask.completed_pomodoros || 0,
    reminder: dbTask.reminder || false,
    createdAt: dbTask.created_at,
    updatedAt: dbTask.updated_at,
  };
}

function mapTaskToDb(task: Partial<Task>, userId?: string) {
  const dbTask: any = {};
  if (task.id !== undefined) dbTask.id = task.id;
  if (userId !== undefined) dbTask.user_id = userId;
  if (task.title !== undefined) dbTask.title = task.title;
  if (task.description !== undefined) dbTask.description = task.description;
  if (task.completed !== undefined) dbTask.completed = task.completed;
  if (task.priority !== undefined) dbTask.priority = task.priority;
  if (task.dueDate !== undefined) dbTask.due_date = task.dueDate;
  if (task.tags !== undefined) dbTask.tags = task.tags;
  
  // subtasks can be sent directly as JSON array to supabase-js client
  if (task.subtasks !== undefined) dbTask.subtasks = task.subtasks;
  
  if (task.estimatedPomodoros !== undefined) dbTask.estimated_pomodoros = task.estimatedPomodoros;
  if (task.completedPomodoros !== undefined) dbTask.completed_pomodoros = task.completedPomodoros;
  if (task.reminder !== undefined) dbTask.reminder = task.reminder;
  if (task.createdAt !== undefined) dbTask.created_at = task.createdAt;
  if (task.updatedAt !== undefined) dbTask.updated_at = task.updatedAt;
  return dbTask;
}

// -------------------------------------------------------------
// 1. LOCAL STORAGE DRIVER
// -------------------------------------------------------------
class LocalStorageService implements IDbService {
  name = 'local' as const;

  async getTasks(): Promise<Task[]> {
    const saved = localStorage.getItem('todo_app_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing local tasks', e);
      }
    }
    return [];
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const newId = `task-${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();
    const fullTask: Task = {
      ...task,
      id: newId,
      createdAt,
      updatedAt
    };
    const tasks = await this.getTasks();
    localStorage.setItem('todo_app_tasks', JSON.stringify([fullTask, ...tasks]));
    window.dispatchEvent(new Event('local_tasks_updated'));
    return fullTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const tasks = await this.getTasks();
    let updated: Task | null = null;
    const nextTasks = tasks.map(t => {
      if (t.id === id) {
        updated = { ...t, ...updates, updatedAt: new Date().toISOString() };
        return updated;
      }
      return t;
    });
    localStorage.setItem('todo_app_tasks', JSON.stringify(nextTasks));
    window.dispatchEvent(new Event('local_tasks_updated'));
    if (!updated) throw new Error('Task not found');
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    localStorage.setItem('todo_app_tasks', JSON.stringify(tasks.filter(t => t.id !== id)));
    window.dispatchEvent(new Event('local_tasks_updated'));
  }

  async bulkAddTasks(tasksToAdd: Task[]): Promise<void> {
    const tasks = await this.getTasks();
    const merged = [...tasksToAdd, ...tasks.filter(t => !tasksToAdd.some(ta => ta.id === t.id))];
    localStorage.setItem('todo_app_tasks', JSON.stringify(merged));
    window.dispatchEvent(new Event('local_tasks_updated'));
  }

  subscribeToTasks(userId: string | undefined, callback: (tasks: Task[]) => void): () => void {
    const update = () => {
      this.getTasks().then(callback);
    };
    
    update();

    const storageListener = (e: StorageEvent) => {
      if (e.key === 'todo_app_tasks') update();
    };
    const customListener = () => update();
    
    window.addEventListener('storage', storageListener);
    window.addEventListener('local_tasks_updated', customListener);
    
    return () => {
      window.removeEventListener('storage', storageListener);
      window.removeEventListener('local_tasks_updated', customListener);
    };
  }
}

// -------------------------------------------------------------
// 2. SUPABASE CLOUD DRIVER
// -------------------------------------------------------------
class SupabaseService implements IDbService {
  name = 'supabase' as const;
  private client: SupabaseClient;

  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }

  // Helper accessor to fetch direct client for subscriptions or auth
  getClient() {
    return this.client;
  }

  async getTasks(userId?: string): Promise<Task[]> {
    if (!userId) return [];
    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapTaskFromDb);
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<Task> {
    const newId = `task-${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();
    const fullTask: Task = {
      ...task,
      id: newId,
      createdAt,
      updatedAt
    };
    
    const dbTask = mapTaskToDb(fullTask, userId);
    const { error } = await this.client.from('tasks').insert(dbTask);
    if (error) throw error;
    return fullTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const dbTask = mapTaskToDb(updates);
    dbTask.updated_at = new Date().toISOString();
    
    const { data, error } = await this.client
      .from('tasks')
      .update(dbTask)
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Task not found in Supabase');
    return mapTaskFromDb(data[0]);
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await this.client.from('tasks').delete().eq('id', id);
    if (error) throw error;
  }

  async bulkAddTasks(tasks: Task[], userId?: string): Promise<void> {
    if (tasks.length === 0) return;
    const dbTasks = tasks.map(t => mapTaskToDb(t, userId));
    const { error } = await this.client.from('tasks').insert(dbTasks);
    if (error) throw error;
  }

  subscribeToTasks(userId: string | undefined, callback: (tasks: Task[]) => void): () => void {
    if (!userId) {
      callback([]);
      return () => {};
    }

    // Initial fetch
    this.getTasks(userId).then(callback);

    const channel = this.client
      .channel(`public:tasks:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
        () => {
          this.getTasks(userId).then(callback);
        }
      )
      .subscribe();

    return () => {
      this.client.removeChannel(channel);
    };
  }
}

// -------------------------------------------------------------
// 3. FIREBASE CLOUD DRIVER
// -------------------------------------------------------------
class FirebaseService implements IDbService {
  name = 'firebase' as const;
  private db: Firestore;

  constructor(config: any) {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    this.db = getFirestore(app);
  }

  async getTasks(userId?: string): Promise<Task[]> {
    if (!userId) return [];
    const q = query(collection(this.db, 'tasks'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const tasks: Task[] = [];
    snapshot.forEach(doc => {
      tasks.push(doc.data() as Task);
    });
    // Sort locally by creation date descending
    return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<Task> {
    const newId = `task-${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();
    const fullTask: Task = {
      ...task,
      id: newId,
      createdAt,
      updatedAt
    };
    
    const taskWithUser = { ...fullTask, userId };
    await setDoc(doc(this.db, 'tasks', newId), taskWithUser);
    return fullTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const docRef = doc(this.db, 'tasks', id);
    const fieldsToUpdate = { 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    await updateDoc(docRef, fieldsToUpdate);
    return { id, ...updates } as Task;
  }

  async deleteTask(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'tasks', id));
  }

  async bulkAddTasks(tasks: Task[], userId?: string): Promise<void> {
    if (tasks.length === 0) return;
    const batch = writeBatch(this.db);
    tasks.forEach(task => {
      const docRef = doc(this.db, 'tasks', task.id);
      batch.set(docRef, { ...task, userId });
    });
    await batch.commit();
  }

  subscribeToTasks(userId: string | undefined, callback: (tasks: Task[]) => void): () => void {
    if (!userId) {
      callback([]);
      return () => {};
    }

    const q = query(collection(this.db, 'tasks'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach(doc => {
        tasks.push(doc.data() as Task);
      });
      callback(tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });

    return unsubscribe;
  }
}

// -------------------------------------------------------------
// DYNAMIC CREDENTIALS & SERVICE FACTORY
// -------------------------------------------------------------
export interface DbConfig {
  type: 'local' | 'supabase' | 'firebase';
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export function getStoredDbConfig(): DbConfig {
  // 1. Env variables defaults (highest priority for developers)
  if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return {
      type: 'supabase',
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
    };
  }

  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      type: 'firebase',
      firebaseConfig: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
      }
    };
  }

  // 2. Local storage overrides (allows runtime custom connection)
  const savedType = localStorage.getItem('todo_app_db_type') as DbConfig['type'];
  if (savedType === 'supabase') {
    const url = localStorage.getItem('todo_app_supabase_url');
    const key = localStorage.getItem('todo_app_supabase_anon_key');
    if (url && key) {
      return { type: 'supabase', supabaseUrl: url, supabaseAnonKey: key };
    }
  } else if (savedType === 'firebase') {
    const cfgStr = localStorage.getItem('todo_app_firebase_config');
    if (cfgStr) {
      try {
        return { type: 'firebase', firebaseConfig: JSON.parse(cfgStr) };
      } catch (e) {
        console.error('Error parsing stored firebase config', e);
      }
    }
  }

  return { type: 'local' };
}

export function createDbService(config: DbConfig): IDbService {
  try {
    if (config.type === 'supabase' && config.supabaseUrl && config.supabaseAnonKey) {
      return new SupabaseService(config.supabaseUrl, config.supabaseAnonKey);
    }
    if (config.type === 'firebase' && config.firebaseConfig && config.firebaseConfig.apiKey) {
      return new FirebaseService(config.firebaseConfig);
    }
  } catch (e) {
    console.error('Failed to initialize cloud database service, falling back to LocalStorage', e);
  }
  return new LocalStorageService();
}
