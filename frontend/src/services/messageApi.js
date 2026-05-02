import api from './api';
import { deriveConversationKey, encryptData, decryptData, fromBase64, toBase64 } from './encryptionUtils';
import { normalizePayload, serializePayload, parsePayload } from './messagePayloadUtils';

export const decryptMessageContent = async (message, currentUserId, selectedUserId) => {
  if (message.isGroup) {
    return { ...message, text: message.text || "[Media]", timestamp: message.createdAt || message.timestamp };
  }
  try {
    const key = await deriveConversationKey(currentUserId, selectedUserId);
    const decodedText = await decryptData(key, fromBase64(message.iv), fromBase64(message.encryptedContent), message.algorithm);
    const payload = parsePayload(decodedText);
    return { ...message, ...payload, timestamp: message.createdAt || message.timestamp };
  } catch (error) {
    return { ...message, text: "[Unable to decrypt message]", decryptionError: true };
  }
};

export const fetchMessages = async (currentUserId, selectedUserId) => {
  const response = await api.get(`/messages/${currentUserId}/${selectedUserId}`);
  const messages = response.data;
  return Promise.all(messages.map(m => decryptMessageContent(m, currentUserId, selectedUserId)));
};

export const sendEncryptedMessage = async (currentUser, selectedUser, payloadInput) => {
  const payload = normalizePayload(payloadInput);
  const serialized = serializePayload(payload);
  const key = await deriveConversationKey(currentUser.userId, selectedUser.userId);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await encryptData(key, iv, serialized);
  
  const response = await api.post('/messages/send', {
    senderId: currentUser.userId,
    receiverId: selectedUser.userId,
    encryptedContent: toBase64(new Uint8Array(encrypted)),
    iv: toBase64(iv),
    algorithm: "AES-GCM"
  });
  
  return { ...response.data, ...payload, timestamp: response.data.createdAt || response.data.timestamp };
};

export const fetchConversations = async (userId) => {
  const response = await api.get(`/messages/conversations/${userId}`);
  const conversations = response.data;
  
  const decryptedConversations = await Promise.all(conversations.map(async (conv) => {
    const lastMsg = conv.lastMessage;
    const otherUserId = conv._id;
    try {
      const decryptedLastMsg = await decryptMessageContent(lastMsg, userId, otherUserId);
      return {
        userId: otherUserId,
        lastMessage: decryptedLastMsg,
        unreadCount: conv.unreadCount
      };
    } catch (err) {
      return {
        userId: otherUserId,
        lastMessage: { ...lastMsg, text: "[Encrypted message]", timestamp: lastMsg.createdAt },
        unreadCount: conv.unreadCount
      };
    }
  }));

  return decryptedConversations.reduce((acc, conv) => {
    acc[conv.userId] = conv;
    return acc;
  }, {});
};

export const starMessage = async (messageId) => {
  const response = await api.post(`/messages/toggle-star/${messageId}`);
  return response.data;
};

export const fetchStarredMessages = async (userId) => {
  const response = await api.get('/messages/starred');
  return response.data;
};
