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

export const requestAddMember = async (groupId, userId) => {
  const res = await api.post(`/groups/${groupId}/invite-requests`, { userId });
  return res.data;
};

export const getInviteRequests = async (groupId) => {
  const res = await api.get(`/groups/${groupId}/invite-requests`);
  return res.data;
};

export const approveInviteRequest = async (groupId, requestId) => {
  const res = await api.post(`/groups/${groupId}/invite-requests/${requestId}/approve`);
  return res.data;
};

export const rejectInviteRequest = async (groupId, requestId) => {
  const res = await api.post(`/groups/${groupId}/invite-requests/${requestId}/reject`);
  return res.data;
};

export const updateGroupInfo = async (groupId, groupData) => {
  const res = await api.put(`/groups/${groupId}`, groupData);
  return res.data;
};

const groupService = {
  fetchMyGroups,
  createGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  getGroupInvite,
  joinGroupByInvite,
  requestAddMember,
  getInviteRequests,
  approveInviteRequest,
  rejectInviteRequest,
  updateGroupInfo
};

export default groupService;
