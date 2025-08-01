import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

const useStore = create(
  persist(
    (set, get) => ({
      // Avatar upload function with improved error handling
      updateAvatar: async (formData) => {
        const token = get().token;
        const user = get().user;
        
        if (!token) {
          throw new Error('Please log in to upload an avatar');
        }
        
        if (!formData || !formData.has('avatar')) {
          throw new Error('Please select an image file');
        }
        
        if (!user?._id) {
          console.error('No user ID found in store:', { user });
          // Try to get the user ID from the token as a fallback
          try {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            if (tokenData?.userId) {
              console.log('Using user ID from token:', tokenData.userId);
              // Update the user in the store with the ID from the token
              set({ user: { ...user, _id: tokenData.userId } });
            } else {
              throw new Error('No user ID in token');
            }
          } catch (tokenError) {
            console.error('Error extracting user ID from token:', tokenError);
            throw new Error('User not properly authenticated. Please log in again.');
          }
        }

        try {
          // Set loading state
          set({ isLoading: true, error: null });
          
          const userId = get().user?._id;
          if (!userId) throw new Error('User ID not found');
          
          // Ensure formData has the correct field name 'profilePic'
          const uploadFormData = new FormData();
          const file = formData.get('avatar');
          if (!file) {
            throw new Error('No file selected');
          }
          uploadFormData.append('profilePic', file);
          
          const baseUrl = import.meta.env.VITE_API_URL || 'https://realtime-chat-api-z27k.onrender.com';
          const uploadUrl = `${baseUrl}/api/upload/profile-picture/${userId}`;
          console.log('Uploading to URL:', uploadUrl);
          
          const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
              // Don't set Content-Type header - let the browser set it with the correct boundary
            },
            body: uploadFormData,
            credentials: 'include' // Important for cookies/sessions
          });

          // Handle response
          const responseText = await response.text();
          console.log('Raw response:', responseText);
          
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            console.error('Error parsing JSON:', e);
            throw new Error('Invalid server response: ' + responseText);
          }

          if (!response.ok) {
            throw new Error(data.message || `Server error: ${response.status}`);
          }

          // Update user data with the new avatar
          if (data.user) {
            set({ 
              user: { ...user, ...data.user },
              isLoading: false 
            });
          } else if (data.avatarUrl) {
            // Handle case where backend returns just the avatar URL
            const updatedUser = { 
              ...user, 
              avatar: data.avatarUrl,
              profilePicture: { url: data.avatarUrl }
            };
            set({ user: updatedUser, isLoading: false });
          } else {
            throw new Error('Invalid response from server');
          }

          return data;
        } catch (error) {
          console.error('Avatar upload failed:', error);
          set({ 
            error: error.message || 'Failed to upload avatar',
            isLoading: false 
          });
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

      // Avatar upload function with improved error handling and logging
      updateAvatar: async (formData) => {
        try {
          const { user: currentUser, token } = get();
          const userId = currentUser?._id;
          
          if (!userId) {
            throw new Error("User ID not found");
          }
          
          if (!formData || !formData.has('avatar')) {
            throw new Error("Please select an image file to upload.");
          }
          
          console.log('🚀 Starting avatar upload for user:', userId);
          const baseUrl = import.meta.env.VITE_API_URL || 'https://realtime-chat-api-z27k.onrender.com';
          console.log('🌐 API URL:', baseUrl);
          
          // Get the file from FormData
          const file = formData.get('avatar');
          
          if (!file) {
            throw new Error('No file found in form data');
          }
          
          // Validate file type and size
          const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
          const maxSize = 5 * 1024 * 1024; // 5MB
          
          if (!validTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP).');
          }
          
          if (file.size > maxSize) {
            throw new Error('File is too large. Maximum size is 5MB.');
          }
          
          // Create a new FormData instance for the upload
          const uploadFormData = new FormData();
          uploadFormData.append('avatar', file); // Use 'avatar' as the field name to match multer config
          
          console.log('📤 Preparing to upload file:', {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: new Date(file.lastModified).toISOString()
          });
          
          // Make the upload request
          const response = await fetch(`${baseUrl}/api/upload/profile-picture/${userId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              // Let the browser set the Content-Type with boundary for FormData
            },
            body: uploadFormData,
            credentials: 'include',
            mode: 'cors'
          });
          
          console.log('📥 Avatar upload response status:', response.status);
          
          // Clone the response to read it multiple times if needed
          const responseClone = response.clone();
          
          // Try to parse the response as JSON
          let data;
          try {
            data = await response.json();
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            // If JSON parsing fails, try to get the response as text
            const errorText = await responseClone.text();
            console.error('Response text:', errorText);
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }
          
          // Check for non-OK response
          if (!response.ok) {
            console.error('Avatar upload failed:', data);
            let errorMessage = 'Failed to upload avatar';
            
            if (response.status === 400) {
              errorMessage = data?.error || 'Invalid file format or no file provided';
            } else if (response.status === 401) {
              errorMessage = 'Session expired. Please log in again.';
            } else if (response.status === 413) {
              errorMessage = 'File is too large. Please choose a smaller image.';
            } else if (response.status >= 500) {
              errorMessage = 'Server error. Please try again later.';
            } else {
              errorMessage = data?.message || `Server returned ${response.status}: ${response.statusText}`;
            }
            
            throw new Error(errorMessage);
          }
          
          console.log('Avatar upload successful:', data);
          
          // Update user data in the store based on the response format
          console.log('Processing avatar upload response:', data);
          
          // Handle the response format from our updated backend
          if (data.success && data.profilePicture) {
            console.log('Using profile picture object from response');
            set({
              user: {
                ...get().user,
                profilePicture: {
                  url: data.profilePicture.url,
                  key: data.profilePicture.key,
                  lastUpdated: data.profilePicture.lastUpdated || new Date().toISOString(),
                  versions: data.profilePicture.versions || {
                    original: data.profilePicture.url,
                    large: data.profilePicture.url,
                    medium: data.profilePicture.url,
                    small: data.profilePicture.url
                  }
                }
              }
            });
          } 
          // Fallback to other possible response formats
          else if (data.user?.profilePicture) {
            console.log('Using user object with profile picture from response');
            set({
              user: {
                ...get().user,
                ...data.user,
                profilePicture: {
                  ...data.user.profilePicture,
                  versions: data.user.profilePicture.versions || {
                    original: data.user.profilePicture.url || '',
                    large: data.user.profilePicture.url || '',
                    medium: data.user.profilePicture.url || '',
                    small: data.user.profilePicture.url || ''
                  }
                }
              }
            });
          } 
          // Legacy format support
          else if (data.avatarUrl || data.publicId) {
            console.log('Using legacy avatar URL format');
            set({
              user: {
                ...get().user,
                avatar: data.avatarUrl,
                profilePicture: {
                  url: data.avatarUrl,
                  key: data.publicId || '',
                  lastUpdated: new Date().toISOString(),
                  versions: {
                    original: data.avatarUrl || '',
                    large: data.avatarUrl || '',
                    medium: data.avatarUrl || '',
                    small: data.avatarUrl || ''
                  },
                  publicId: data.publicId || null
                }
              }
            });
          } else {
            console.warn('Unexpected response format from server:', data);
            throw new Error('Invalid response format from server. Please try again.');
          }
          
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
