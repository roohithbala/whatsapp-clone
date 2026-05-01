import api from './api';

export const createCommunity = async (data) => {
  const res = await api.post('/communities', data);
  return res.data;
};

export const getMyCommunities = async () => {
  const res = await api.get('/communities/my');
  return res.data;
};

export const addGroupToCommunity = async (communityId, groupId) => {
  const res = await api.post(`/communities/${communityId}/groups`, { groupId });
  return res.data;
};
