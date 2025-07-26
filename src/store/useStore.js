import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

const useStore = create(
  persist(
    (set, get) => ({

      // Avatar upload function with Cloudinary integration
      updateAvatar: async (formData) => {
        const token = get().token;
        const userId = get().user?._id;
        
        // Validation checks
        if (!token) {
          throw new Error("No authentication token found");
        }
        
        if (!userId) {
          throw new Error("User ID not found");
        }
        
        if (!formData || !formData.has('avatar')) {
          throw new Error("No avatar file provided");
        }
        
        console.log('Uploading avatar for user:', userId);
        console.log('API URL:', import.meta.env.VITE_API_URL);
        
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/avatar`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`
              // Don't set Content-Type for FormData - browser sets it automatically with boundary
            },
            body: formData
          });
          
          console.log('Response status:', response.status);
          const responseData = await response.json();
          console.log('Response data:', responseData);
          
          if (!response.ok) {
            throw new Error(responseData.message || `HTTP ${response.status}`);
          }
          
          // Update user profile with new avatar versions
          const updatedUser = { 
            ...get().user,
            profilePicture: {
              versions: responseData.profilePicture.versions,
              publicId: responseData.profilePicture.publicId,
              lastUpdated: new Date()
            }
          };
          
          set({ user: updatedUser });
          return responseData;
          
        } catch (error) {
          console.error("updateAvatar error:", error);
          
          // Re-throw with more context if it's a network error
          if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to server');
          }
          
          throw error;
        }
      },

      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,

      // Chat state
      activeChat: null,
      activeGroup: null,
      messages: [],
      onlineUsers: [],
      typingUsers: [],

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
          onlineUsers: [],
          typingUsers: []
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
        onlineUsers: [...new Set([...state.onlineUsers, userId])]
      })),
      removeOnlineUser: (userId) => set((state) => ({
        onlineUsers: state.onlineUsers.filter(id => id !== userId)
      })),
      setOnlineUsers: (users) => set({ onlineUsers: users }),

      addTypingUser: (userId) => set((state) => ({
        typingUsers: [...new Set([...state.typingUsers, userId])]
      })),
      removeTypingUser: (userId) => set((state) => ({
        typingUsers: state.typingUsers.filter(id => id !== userId)
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
      clearNotifications: () => set({ notifications: [] }),

      // Avatar upload function
      updateAvatar: async (formData) => {
        const token = get().token;
        const userId = get().user?._id;
        
        // Validation checks
        if (!token) {
          throw new Error("No authentication token found. Please log in again.");
        }
        
        if (!userId) {
          throw new Error("User ID not found. Please refresh the page and try again.");
        }
        
        if (!formData || !formData.has('avatar')) {
          throw new Error("Please select an image file to upload.");
        }
        
        console.log('Uploading avatar for user:', userId);
        console.log('API URL:', import.meta.env.VITE_API_URL);
        
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/avatar`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
              // Don't set Content-Type for FormData - browser sets it automatically with boundary
            },
            body: formData
          });
          
          console.log('Avatar upload response status:', response.status);
          
          // Clone the response to read it multiple times if needed
          const responseClone = response.clone();
          let data;
          
          try {
            // First try to parse as JSON
            data = await response.json();
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            // If JSON parsing fails, try to get the response as text
            const errorText = await responseClone.text();
            console.error('Response text:', errorText);
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }
          
          if (!response.ok) {
            console.error('Avatar upload failed:', data);
            const errorMessage = data?.message || `Server returned ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
          }
          
          console.log('Avatar upload successful:', data);
          
          if (!data.profilePicture) {
            console.warn('No profile picture data in response:', data);
            throw new Error('Invalid response from server: missing profile picture data');
          }
          
          // Update user in store with new avatar data
          const updatedUser = { 
            ...get().user,
            profilePicture: {
              versions: data.profilePicture.versions,
              publicId: data.profilePicture.publicId,
              lastUpdated: new Date()
            }
          };
          
          set({ user: updatedUser });
          return data;
          
        } catch (error) {
          console.error("Avatar upload error:", error);
          
          // Enhance error messages for better user feedback
          if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to the server. Please check your connection and try again.');
          }
          
          // Re-throw the error with a user-friendly message
          if (error.message.includes('Failed to fetch') || 
              error.message.includes('NetworkError')) {
            throw new Error('Network error: Unable to connect to the server. Please try again later.');
          }
          
          // If the error is already user-friendly, re-throw it as is
          throw error;
        }
      }
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

// Custom hooks for optimized selectors
export const useAuth = () => useStore(
  (state) => ({
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    setUser: state.setUser,
    setToken: state.setToken,
    logout: state.logout
  }),
  shallow
);

export const useTheme = () => useStore(
  (state) => ({
    theme: state.theme,
    toggleTheme: state.toggleTheme
  }),
  shallow
);

export const useUI = () => useStore(
  (state) => ({
    sidebarOpen: state.sidebarOpen,
    toggleSidebar: state.toggleSidebar,
    notifications: state.notifications,
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    clearNotifications: state.clearNotifications
  }),
  shallow
);

export default useStore; 

