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

  getToken: () => localStorage.getItem('authToken'),

  removeToken: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  loginUser: async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      const data = response.data;
      if (data.token) userService.setToken(data.token);
      if (data.user) userService.setCurrentUser(data.user);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Login failed");
    }
  },

  registerUser: async (username, email, password, confirmPassword) => {
    try {
      const response = await api.post('/users/register', { 
        username, 
        email, 
        password, 
        confirmPassword 
      });
      const data = response.data;
      if (data.token) userService.setToken(data.token);
      if (data.user) userService.setCurrentUser(data.user);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Registration failed");
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

  forgotPassword: async (email) => {
    const res = await api.post('/users/forgot-password', { email });
    return res.data;
  }
};

export default userService;
