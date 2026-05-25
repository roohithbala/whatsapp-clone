import * as messageApi from './messageApi';

export const {
  fetchMessages,
  sendEncryptedMessage,
  decryptMessageContent,
  fetchConversations,
  starMessage,
  fetchStarredMessages
} = messageApi;

export const decryptIncomingMessage = (message, currentUserId, selectedUserId) =>
  decryptMessageContent(message, currentUserId, selectedUserId);

const messageService = {
  fetchMessages,
  sendEncryptedMessage,
  decryptMessageContent,
  decryptIncomingMessage,
  fetchConversations,
  starMessage,
  fetchStarredMessages
};

export default messageService;
