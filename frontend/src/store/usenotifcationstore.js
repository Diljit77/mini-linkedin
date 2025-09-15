import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  showNotificationPopup: false,
  currentNotification: null,
  

  setNotifications: (notifications) => set({ notifications }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1,
    showNotificationPopup: true,
    currentNotification: notification
  })),
  
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(notif => 
      notif._id === id ? { ...notif, isRead: true } : notif
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(notif => ({ ...notif, isRead: true })),
    unreadCount: 0
  })),

  hidePopup: () => set({ showNotificationPopup: false, currentNotification: null }),

  setUnreadCount: (count) => set({ unreadCount: count }),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(notif => notif._id !== id),
    unreadCount: state.notifications.find(notif => notif._id === id && !notif.isRead) 
      ? Math.max(0, state.unreadCount - 1) 
      : state.unreadCount
  }))
}));