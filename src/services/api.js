import axios from 'axios';
import useStore from '../store/useStore';

const API_URL = 'https://realtime-chat-api-z27k.onrender.com';
console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url, config.data);
    try {
      const token = useStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from store:', error);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      try {
        useStore.getState().logout();
      } catch (storeError) {
        console.error('Error calling logout from store:', storeError);
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  sendRegistrationOtp: (email) => api.post('/auth/send-otp', { email }),
  verifyRegistrationOtp: (data) => api.post('/auth/register', data),
  sendResetPasswordOtp: (email) => api.post('/auth/send-reset-otp', { email }),
  verifyResetPasswordOtp: (data) => api.post('/auth/reset-password', data),
};

export const user = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data) => api.put('/api/user/profile', data),
  updateAvatar: (formData) => {
    const token = useStore.getState().token;
    return api.put('/api/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });
  },
  updatePassword: (data) => api.put('/user/password', data),
  search: (query) => api.get(`/user/search?q=${query}`),
  getFriends: () => api.get('/user/friends'),
  sendFriendRequest: (userId) => api.post(`/user/friends/request/${userId}`),
  acceptFriendRequest: (requestId) => api.post(`/user/friends/accept/${requestId}`),
  rejectFriendRequest: (requestId) => api.post(`/user/friends/reject/${requestId}`),
  removeFriend: (userId) => api.delete(`/user/friends/${userId}`)
};

export const messages = {
  sendMessage: (data) => api.post('/messages', data),
  getMessages: (userId, page = 1, limit = 50) => 
    api.get(`/messages/${userId}?page=${page}&limit=${limit}`),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  editMessage: (messageId, content) => api.put(`/messages/${messageId}`, { content }),
  uploadAttachment: (formData) => api.post('/messages/attachment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

export const groups = {
  create: (data) => api.post('/groups', data),
  getGroups: () => api.get('/groups'),
  getGroup: (groupId) => api.get(`/groups/${groupId}`),
  updateGroup: (groupId, data) => api.put(`/groups/${groupId}`, data),
  deleteGroup: (groupId) => api.delete(`/groups/${groupId}`),
  updateAvatar: (groupId, formData) => api.put(`/groups/${groupId}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  inviteUser: (groupId, userId) => api.post(`/groups/${groupId}/invite/${userId}`),
  removeUser: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`),
  updateRole: (groupId, userId, role) => 
    api.put(`/groups/${groupId}/members/${userId}/role`, { role }),
  leaveGroup: (groupId) => api.post(`/groups/${groupId}/leave`),
  getMessages: (groupId, page = 1, limit = 50) => 
    api.get(`/groups/${groupId}/messages?page=${page}&limit=${limit}`)
};

export const notifications = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  deleteAllNotifications: () => api.delete('/notifications')
};

export const uploadAvatar = async (file, token) => {
  try {
    console.log('Preparing to upload avatar...', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      hasToken: !!token
    });

    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await axios.post(
      'https://realtime-chat-api-z27k.onrender.com/api/user/upload-avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    console.log('Avatar upload successful:', response.data);
    return response;
  } catch (error) {
    console.error('Avatar upload failed:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    throw error;
  }
};

export default {
  auth,
  user,
  messages,
  groups,
  notifications
}; 
