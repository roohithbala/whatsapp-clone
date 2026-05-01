import * as messageApi from './messageApi';

export const {
  fetchMessages,
  sendEncryptedMessage,
  decryptMessageContent,
  fetchConversations
} = messageApi;

export const decryptIncomingMessage = (message, currentUserId, selectedUserId) =>
  decryptMessageContent(message, currentUserId, selectedUserId);

const messageService = {
  fetchMessages,
  sendEncryptedMessage,
  decryptMessageContent,
  decryptIncomingMessage,
  fetchConversations
};

export default messageService;
