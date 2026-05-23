import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useApp } from './AppContext';
import type { Task } from '../types';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  taskId: string;
  read: boolean;
  createdAt: string;
}

interface NotificationContextProps {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  requestPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tasks, addToast } = useApp();
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('todo_app_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Track triggered reminders so we don't trigger them repeatedly
  const [triggeredReminders, setTriggeredReminders] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('todo_app_triggered_reminders');
    return saved ? JSON.parse(saved) : {};
  });

  const hasPermission = useRef<boolean>(Notification.permission === 'granted');

  useEffect(() => {
    localStorage.setItem('todo_app_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('todo_app_triggered_reminders', JSON.stringify(triggeredReminders));
  }, [triggeredReminders]);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      hasPermission.current = permission === 'granted';
      if (permission === 'granted') {
        addToast('Desktop notifications enabled!', 'success');
      }
    }
  };

  const addNotification = (title: string, message: string, taskId: string) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      taskId,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Show in-app toast
    addToast(message, 'info');

    // Show desktop notification
    if ('Notification' in window && hasPermission.current) {
      new Notification(title, {
        body: message,
        icon: '/vite.svg' // Fallback icon
      });
    }
  };

  // The interval checker
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      tasks.forEach(task => {
        if (task.completed || !task.reminderConfig || task.reminderConfig.type === 'none') return;
        
        const config = task.reminderConfig;
        let targetDate: Date | null = null;

        if (config.type === 'exact' && task.dueDate && task.dueTime) {
          targetDate = new Date(`${task.dueDate}T${task.dueTime}`);
        } else if (config.type === 'custom' && config.customTime) {
          targetDate = new Date(config.customTime);
        } else if (task.dueDate && task.dueTime) {
          // Relative times
          const exactTime = new Date(`${task.dueDate}T${task.dueTime}`);
          if (config.type === '10m_before') {
            targetDate = new Date(exactTime.getTime() - 10 * 60000);
          } else if (config.type === '1h_before') {
            targetDate = new Date(exactTime.getTime() - 60 * 60000);
          } else if (config.type === '1d_before') {
            targetDate = new Date(exactTime.getTime() - 24 * 60 * 60000);
          }
        }

        if (targetDate) {
          const diffMs = targetDate.getTime() - now.getTime();
          
          // Trigger if the target time is within the last minute or next 10 seconds
          // and it hasn't been triggered yet
          const reminderId = `${task.id}-${config.type}-${targetDate.getTime()}`;
          
          if (diffMs <= 10000 && diffMs >= -60000 && !triggeredReminders[reminderId]) {
            addNotification('Task Reminder', `"${task.title}" is due soon!`, task.id);
            setTriggeredReminders(prev => ({ ...prev, [reminderId]: true }));
          }
        }
      });
    };

    // Check immediately, then every 30 seconds
    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [tasks, triggeredReminders]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      requestPermission
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
