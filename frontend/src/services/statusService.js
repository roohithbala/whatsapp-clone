import api from './api';

export const getStatuses = async () => {
  const response = await api.get('/status');
  return response.data;
};

export const createStatus = async (statusData) => {
  const response = await api.post('/status', statusData);
  return response.data;
};

const statusService = {
  getStatuses,
  createStatus
};

export default statusService;
