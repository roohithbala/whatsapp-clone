import api from './api';

export const getChannels = async () => {
  const response = await api.get('/channels');
  return response.data;
};

export const getChannelById = async (channelId) => {
  const response = await api.get(`/channels/${channelId}`);
  return response.data;
};

const channelService = {
  getChannels,
  getChannelById
};

export default channelService;
