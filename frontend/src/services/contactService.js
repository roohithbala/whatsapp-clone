import api from './api';

export const getContacts = async (userId) => {
  const res = await api.get(`/users/${userId}/contacts`);
  return res.data;
};

export const addContact = async (userId, contactId) => {
  const res = await api.post(`/users/${userId}/contacts`, { contactId });
  return res.data;
};
