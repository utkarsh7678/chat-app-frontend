import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,

      // Chat state
      activeChat: null,
      activeGroup: null,
      messages: [],
      onlineUsers: new Set(),
      typingUsers: new Set(),

      // UI state
      theme: 'light',
      sidebarOpen: true,
      notifications: [],

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      setActiveChat: (chat) => set({ activeChat: chat }),
      setActiveGroup: (group) => set({ activeGroup: group }),
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),
      setMessages: (messages) => set({ messages }),
      clearMessages: () => set({ messages: [] }),

      addOnlineUser: (userId) => set((state) => ({
        onlineUsers: new Set([...state.onlineUsers, userId])
      })),
      removeOnlineUser: (userId) => set((state) => ({
        onlineUsers: new Set([...state.onlineUsers].filter(id => id !== userId))
      })),
      setOnlineUsers: (users) => set({ onlineUsers: new Set(users) }),

      addTypingUser: (userId) => set((state) => ({
        typingUsers: new Set([...state.typingUsers, userId])
      })),
      removeTypingUser: (userId) => set((state) => ({
        typingUsers: new Set([...state.typingUsers].filter(id => id !== userId))
      })),

      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),
      toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen
      })),
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, notification]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] })
    }),
    {
      name: 'chat-app-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        theme: state.theme
      })
    }
  )
);

export default useStore; 