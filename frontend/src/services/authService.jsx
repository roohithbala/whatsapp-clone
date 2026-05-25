import api from './api';

export const getToken = () => localStorage.getItem("authToken");
export const setToken = (token) => localStorage.setItem("authToken", token);
export const removeToken = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
};

export const getCurrentUser = () => {
  const userString = localStorage.getItem("currentUser");
  return userString ? JSON.parse(userString) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem("currentUser", JSON.stringify(user));
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });
    const data = response.data;
    setToken(data.token);
    setCurrentUser(data.user || data);
    return data.user || data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Login failed");
  }
};

export const registerUser = async (username, email, password, confirmPassword) => {
  try {
    const response = await api.post('/users/register', { 
      username, 
      email, 
      password, 
      confirmPassword 
    });
    const data = response.data;
    if (data.token) setToken(data.token);
    if (data.user) setCurrentUser(data.user);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Registration failed");
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/users/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to send reset link");
  }
};
