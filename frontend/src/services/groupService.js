import api from './api';

export const getGroups = async () => {
  const response = await api.get('/groups');
  return response.data;
};

export const getGroupById = async (groupId) => {
  const response = await api.get(`/groups/${groupId}`);
  return response.data;
};

export const createGroup = async (groupName, memberIds) => {
  const response = await api.post('/groups', { 
    name: groupName, 
    members: memberIds 
  });
  return response.data;
};

const groupService = {
  getGroups,
  getGroupById,
  createGroup
};

export default groupService;
