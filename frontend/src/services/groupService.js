import api from './api';

export const fetchMyGroups = async () => {
  const res = await api.get('/groups');
  return res.data;
};

export const createGroup = async (groupData) => {
  const res = await api.post('/groups', groupData);
  return res.data;
};

export const addMemberToGroup = async (groupId, userId) => {
  const res = await api.post(`/groups/${groupId}/members`, { userId });
  return res.data;
};

export const removeMemberFromGroup = async (groupId, userId) => {
  const res = await api.delete(`/groups/${groupId}/members/${userId}`);
  return res.data;
};

export const getGroupInvite = async (groupId) => {
  const res = await api.get(`/groups/${groupId}/invite`);
  return res.data;
};

export const joinGroupByInvite = async (inviteCode) => {
  const res = await api.post(`/groups/join/${inviteCode}`);
  return res.data;
};

const groupService = {
  fetchMyGroups,
  createGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  getGroupInvite,
  joinGroupByInvite
};

export default groupService;
