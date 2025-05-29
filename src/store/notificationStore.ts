import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: Date;
  read: boolean;
  link?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

// Mock notifications for demonstration
const initialNotifications: Notification[] = [];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: initialNotifications,
  unreadCount: initialNotifications.filter(n => !n.read).length,
  
  addNotification: (notification) => set((state) => {
    const newNotification = {
      ...notification,
      id: `notification_${Date.now()}`,
      date: new Date(),
      read: false,
    };
    
    return {
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    };
  }),
  
  markAsRead: (id) => set((state) => {
    const updatedNotifications = state.notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    
    // Count how many are still unread
    const updatedUnreadCount = updatedNotifications.filter(n => !n.read).length;
    
    return {
      notifications: updatedNotifications,
      unreadCount: updatedUnreadCount
    };
  }),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(notification => ({ ...notification, read: true })),
    unreadCount: 0
  })),
  
  deleteNotification: (id) => set((state) => {
    const updatedNotifications = state.notifications.filter(notification => notification.id !== id);
    const wasUnread = state.notifications.find(n => n.id === id)?.read === false;
    
    return {
      notifications: updatedNotifications,
      unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount
    };
  }),
  
  clearAllNotifications: () => set({
    notifications: [],
    unreadCount: 0
  }),
}));
