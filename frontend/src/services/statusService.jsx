import api from './api';

export const getStatuses = async () => {
  const response = await api.get('/status');
  return response.data;
};

export const createStatus = async (statusData) => {
  const response = await api.post('/status', statusData);
  return response.data;
};

export const deleteStatus = async (statusId) => {
  const response = await api.delete(`/status/${statusId}`);
  return response.data;
};

export const markStatusAsViewed = async (statusId) => {
  const response = await api.post(`/status/${statusId}/view`);
  return response.data;
};

export const fetchStatus = async (statusId) => {
  const response = await api.get(`/status/${statusId}`);
  return response.data;
};

const statusService = {
  getStatuses,
  createStatus,
  deleteStatus,
  markStatusAsViewed,
  fetchStatus
};

export default statusService;
