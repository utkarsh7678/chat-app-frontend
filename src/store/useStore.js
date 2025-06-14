import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
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

      // User data
      friends: [],
      groups: [],
      friendRequests: [],

      // UI state
      theme: 'light',
      sidebarOpen: true,
      notifications: [],

      // Actions
      setUser: (user) => {
        console.log('setUser called with:', user);
        // Ensure user has required fields
        const validUser = user && typeof user === 'object' && (user._id || user.email);
        set({ user: validUser ? user : null, isAuthenticated: !!validUser });
      },
      setToken: (token) => {
        console.log('setToken called with:', token);
        set({ token });
      },
      logout: () => {
        console.log('Logout called');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          friends: [],
          groups: [],
          friendRequests: [],
          messages: [],
          onlineUsers: new Set(),
          typingUsers: new Set()
        });
      },

      setActiveChat: (chat) => set({ activeChat: chat }),
      setActiveGroup: (group) => set({ activeGroup: group }),
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),
      setMessages: (messages) => set({ messages }),
      clearMessages: () => set({ messages: [] }),

      // Friends and groups management
      setFriends: (friends) => set({ friends }),
      addFriend: (friend) => set((state) => ({
        friends: [...state.friends, friend]
      })),
      removeFriend: (friendId) => set((state) => ({
        friends: state.friends.filter(f => f._id !== friendId)
      })),

      setGroups: (groups) => set({ groups }),
      addGroup: (group) => set((state) => ({
        groups: [...state.groups, group]
      })),
      removeGroup: (groupId) => set((state) => ({
        groups: state.groups.filter(g => g._id !== groupId)
      })),

      setFriendRequests: (requests) => set({ friendRequests: requests }),
      addFriendRequest: (request) => set((state) => ({
        friendRequests: [...state.friendRequests, request]
      })),
      updateFriendRequest: (requestId, updates) => set((state) => ({
        friendRequests: state.friendRequests.map(r => 
          r._id === requestId ? { ...r, ...updates } : r
        )
      })),
      removeFriendRequest: (requestId) => set((state) => ({
        friendRequests: state.friendRequests.filter(r => r._id !== requestId)
      })),

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