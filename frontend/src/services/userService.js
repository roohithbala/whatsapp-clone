import api from './api';

const userService = {
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('currentUser');
      if (!user || user === "undefined") return null;
      return JSON.parse(user);
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
      return null;
    }
  },
  
  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  },

  setToken: (token) => {
    localStorage.setItem('authToken', token);
  },

  setRefreshToken: (token) => {
    if (token) localStorage.setItem('refreshToken', token);
  },

  getToken: () => localStorage.getItem('authToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),

  removeToken: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  },

  loginUser: async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      const data = response.data;
      if (data.token) userService.setToken(data.token);
      if (data.refreshToken) userService.setRefreshToken(data.refreshToken);
      if (data.user) userService.setCurrentUser(data.user);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  registerUser: async (username, email, password, confirmPassword) => {
    try {
      const response = await api.post('/users/register', { username, email, password, confirmPassword });
      const data = response.data;
      if (data.token) userService.setToken(data.token);
      if (data.refreshToken) userService.setRefreshToken(data.refreshToken);
      if (data.user) userService.setCurrentUser(data.user);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  getAllUsers: async () => {
    const res = await api.get('/users');
    return res.data;
  },

  updateProfile: async (userId, data) => {
    const res = await api.put(`/users/${userId}`, data);
    return res.data;
  },
  
  updateSettings: async (userId, data) => {
    const res = await api.put(`/users/${userId}/settings`, data);
    return res.data;
  },

  verifyPin: async (userId, pin) => {
    const res = await api.post(`/users/${userId}/verify-pin`, { pin });
    return res.data;
  },

  archiveChat: async (targetId) => {
    const res = await api.post(`/users/archive/${targetId}`);
    return res.data;
  },
  
  favoriteChat: async (targetId) => {
    const res = await api.post(`/users/favorite/${targetId}`);
    return res.data;
  },
  
  blockChat: async (targetId) => {
    const res = await api.post(`/users/block/${targetId}`);
    return res.data;
  },
  
  lockChat: async (targetId) => {
    const res = await api.post(`/users/lock/${targetId}`);
    return res.data;
  },

  unlockChat: async (targetId) => {
    const res = await api.post(`/users/unlock/${targetId}`);
    return res.data;
  },

  unarchiveChat: async (targetId) => {
    const res = await api.post(`/users/unarchive/${targetId}`);
    return res.data;
  },

  unblockChat: async (targetId) => {
    const res = await api.post(`/users/unblock/${targetId}`);
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post('/users/forgot-password', { email });
    return res.data;
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  }
};

export default userService;
