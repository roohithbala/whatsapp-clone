import api from './api';

export const createCommunity = async (data) => {
  const res = await api.post('/communities', data);
  return res.data;
};

export const getMyCommunities = async () => {
  const res = await api.get('/communities/my');
  return res.data;
};

export const createGroupInCommunity = async (communityId, name, description) => {
  const res = await api.post(`/communities/${communityId}/create-group`, { name, description });
  return res.data;
};

export const addExistingGroupToCommunity = async (communityId, groupId) => {
  const res = await api.post(`/communities/${communityId}/add-group`, { groupId });
  return res.data;
};

export const joinCommunity = async (communityId) => {
  const res = await api.post(`/communities/${communityId}/join`);
  return res.data;
};

export const deleteCommunity = async (communityId) => {
  const res = await api.delete(`/communities/${communityId}`);
  return res.data;
};

export const addMemberToCommunity = async (communityId, userId) => {
  const res = await api.post(`/communities/${communityId}/members`, { userId });
  return res.data;
};
