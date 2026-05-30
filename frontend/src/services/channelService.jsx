import api from './api';

export const getChannels = async () => {
  const response = await api.get('/channels');
  return response.data;
};

export const getChannelById = async (channelId) => {
  const response = await api.get(`/channels/${channelId}`);
  return response.data;
};

export const createChannel = async (channelData) => {
  const response = await api.post('/channels', channelData);
  return response.data;
};

export const followChannel = async (channelId) => {
  const response = await api.post(`/channels/${channelId}/follow`);
  return response.data;
};

export const getChannelMessages = async (channelId) => {
  const response = await api.get(`/channels/${channelId}/messages`);
  return response.data;
};

export const updateChannel = async (channelId, channelData) => {
  const response = await api.put(`/channels/${channelId}`, channelData);
  return response.data;
};

export const promoteAdmin = async (channelId, userId) => {
  const response = await api.post(`/channels/${channelId}/admins`, { userId });
  return response.data;
};

export const demoteAdmin = async (channelId, userId) => {
  const response = await api.delete(`/channels/${channelId}/admins/${userId}`);
  return response.data;
};

const channelService = {
  getChannels,
  getChannelById,
  createChannel,
  followChannel,
  getChannelMessages,
  updateChannel,
  promoteAdmin,
  demoteAdmin
};

export default channelService;
