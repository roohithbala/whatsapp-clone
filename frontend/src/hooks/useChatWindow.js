import { useState, useEffect, useRef, useCallback } from "react";
import socket from "../socket";
import api from "../services/api";
import { fetchMessages, sendEncryptedMessage } from "../services/messageService";
import channelService from "../services/channelService";

export function useChatWindow(selectedUser, currentUser, users, onMessageSent, scrollToBottom) {
  const [messages, setMessages] = useState([]);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [groupTypingUsers, setGroupTypingUsers] = useState({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [messageSearchTerm, setMessageSearchTerm] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [disappearingDuration, setDisappearingDuration] = useState("off");

  const typingTimeoutRef = useRef(null);
  // Keep a stable ref to avoid stale closure issues with socket handlers
  const selectedUserRef = useRef(selectedUser);
  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const isChannel = !!selectedUser?.channelId;
  const isGroup = !!selectedUser?.groupId || !!selectedUser?.isGroup || !!selectedUser?.isCommunity;

  useEffect(() => {
    setGroupTypingUsers({});
    setIsPeerTyping(false);
    setIsSearchOpen(false);
    setReplyingTo(null);
    setEditingMessage(null);
    setMessageSearchTerm("");
  }, [selectedUser?.userId]);

  // ──────────────────────────────────────────────────────────────
  // Load messages + set up socket handlers
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.userId || !selectedUser) return;

    const targetId = selectedUser.userId || selectedUser.groupId;
    setIsLocked(currentUser.hasPin && currentUser.lockedChats?.includes(targetId));

    const markMessagesAsSeen = (msgs) => {
      if (!msgs || msgs.length === 0 || isChannel || isGroup) return;
      const unreadIds = msgs
        .filter(m => m.senderId === selectedUser.userId && m.status !== "seen")
        .map(m => m._id);

      if (unreadIds.length > 0) {
        socket.emit("messageSeen", {
          messageIds: unreadIds,
          senderId: selectedUser.userId,
          receiverId: currentUser.userId,
        });
      }
    };

    const loadMessages = async () => {
      try {
        let msgs = [];
        if (isChannel) {
          msgs = await channelService.getChannelMessages(selectedUser.channelId);
        } else if (isGroup) {
          const groupTargetId = (selectedUser.groupId || selectedUser.userId)?.toString();
          const res = await api.get(`/messages/fetch-group/${groupTargetId}`);
          msgs = res.data;
        } else {
          msgs = await fetchMessages(currentUser.userId, selectedUser.userId);
        }
        setMessages(msgs);
        markMessagesAsSeen(msgs);
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };

    const loadSettings = async () => {
      try {
        if (isChannel) return; // Channels don't have disappearing messages yet
        const targetId = isGroup ? (selectedUser.groupId || selectedUser.userId) : [currentUser.userId, selectedUser.userId].sort().join('_');
        const res = await api.get(`/messages/disappearing/${targetId}`);
        setDisappearingDuration(res.data.disappearingMessages || "off");
      } catch (err) {
        console.error("Error loading chat settings:", err);
      }
    };

    loadMessages();
    loadSettings();

    // ── Socket event handlers ──
    const onReceiveMessage = (message) => {
      const su = selectedUserRef.current;
      const cu = currentUserRef.current;
      if (!su || !cu) return;

      const isGroupMsg = message.isGroup && message.receiverId === (su.groupId || su.userId);
      const isDirectMsg =
        !message.isGroup &&
        ((message.senderId === su.userId && message.receiverId === cu.userId) ||
          (message.senderId === cu.userId && message.receiverId === su.userId));

      if (isGroupMsg || isDirectMsg) {
        setMessages(prev => {
          // Deduplicate: don't add if _id already exists
          if (message._id && prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        setTimeout(scrollToBottom, 100);

        if (!message.isGroup && message.senderId === su.userId) {
          socket.emit("messageSeen", {
            messageIds: [message._id],
            senderId: su.userId,
            receiverId: cu.userId,
          });
        }
      }
    };

    const onMessageDelivered = ({ messageId, status, deliveredAt }) => {
      setMessages(prev =>
        prev.map(m =>
          m._id === messageId ? { ...m, status, deliveredAt } : m
        )
      );
    };

    const onMessageSeen = ({ messageIds, seenAt }) => {
      setMessages(prev =>
        prev.map(m =>
          messageIds.includes(m._id) ? { ...m, status: "seen", seenAt } : m
        )
      );
    };

    const onTyping = ({ senderId, receiverId, isTyping, isGroup: isGroupTyping }) => {
      const su = selectedUserRef.current;
      if (!su) return;

      if (isGroupTyping) {
        if (receiverId === (su.groupId || su.userId)) {
          const userDetails = users.find(u => u.userId === senderId) || { username: "Someone" };
          setGroupTypingUsers(prev => ({
            ...prev,
            [senderId]: isTyping ? userDetails.username : false,
          }));
        }
      } else {
        if (senderId === su.userId) {
          setIsPeerTyping(isTyping);
        }
      }
    };

    const onMessageDeleted = (messageId) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    };

    const onMessageEdited = (editedMessage) => {
      setMessages(prev =>
        prev.map(m => (m._id === editedMessage._id ? editedMessage : m))
      );
    };

    const onReceiveChannelMessage = (message) => {
      const su = selectedUserRef.current;
      if (isChannel && su && message.channelId === su.channelId) {
        setMessages(prev => {
          if (message._id && prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        setTimeout(scrollToBottom, 100);
      }
    };

    const onDisappearingSettingChanged = ({ chatId, duration }) => {
      const su = selectedUserRef.current;
      const cu = currentUserRef.current;
      if (!su || !cu) return;
      const currentChatId = (su.groupId || su.isGroup || su.isCommunity) 
        ? (su.groupId || su.userId)
        : [cu.userId, su.userId].sort().join('_');
      if (chatId === currentChatId) {
        setDisappearingDuration(duration);
      }
    };

    socket.on("receiveMessage", onReceiveMessage);
    socket.on("messageDelivered", onMessageDelivered);
    socket.on("messageSeen", onMessageSeen);
    socket.on("typing", onTyping);
    socket.on("messageDeleted", onMessageDeleted);
    socket.on("messageEdited", onMessageEdited);
    socket.on("receiveChannelMessage", onReceiveChannelMessage);
    socket.on("disappearingSettingChanged", onDisappearingSettingChanged);

    return () => {
      socket.off("receiveMessage", onReceiveMessage);
      socket.off("messageDelivered", onMessageDelivered);
      socket.off("messageSeen", onMessageSeen);
      socket.off("typing", onTyping);
      socket.off("messageDeleted", onMessageDeleted);
      socket.off("messageEdited", onMessageEdited);
      socket.off("receiveChannelMessage", onReceiveChannelMessage);
      socket.off("disappearingSettingChanged", onDisappearingSettingChanged);
    };
    // NOTE: forwardingMessage deliberately EXCLUDED from deps to avoid reload loop
  }, [selectedUser?.userId, selectedUser?.groupId, selectedUser?.channelId, currentUser?.userId, scrollToBottom, users, isChannel, isGroup]);

  // ──────────────────────────────────────────────────────────────
  // Forward message
  // ──────────────────────────────────────────────────────────────
  const handleForwardMessage = useCallback(async (targetUser) => {
    if (!forwardingMessage) return;
    const payload = {
      text: forwardingMessage.text,
      mediaUrl: forwardingMessage.mediaUrl,
      messageType: forwardingMessage.messageType || "text",
      senderId: currentUser.userId,
      receiverId: targetUser.userId,
      status: "sent",
      replyTo: null,
    };

    try {
      const sent = await sendEncryptedMessage(currentUser, targetUser, payload);
      socket.emit("sendMessage", sent);
      setForwardingMessage(null);
    } catch (err) {
      console.error("Failed to forward:", err);
    }
  }, [forwardingMessage, currentUser]);

  // ──────────────────────────────────────────────────────────────
  // Send / Edit payload
  // ──────────────────────────────────────────────────────────────
  const handleSendPayload = useCallback(async (payload) => {
    if (editingMessage) {
      try {
        const res = await api.put(`/messages/${editingMessage._id}`, { text: payload.text });
        const editedMsg = res.data;
        const receiverId = isGroup
          ? (selectedUser.groupId || selectedUser.userId)
          : selectedUser.userId;
        socket.emit("editMessage", { message: editedMsg, receiverId, isGroup });
        setMessages(prev => prev.map(m => (m._id === editedMsg._id ? editedMsg : m)));
        setEditingMessage(null);
      } catch (e) {
        console.error("Failed to edit message", e);
      }
      return;
    }

    if (isChannel) {
      if (selectedUser.adminId !== currentUser.userId) {
        return;
      }
      try {
        const res = await api.post(`/channels/${selectedUser.channelId}/messages`, {
          content: payload.text,
          mediaUrl: payload.mediaUrl,
        });
        setMessages(prev => [...prev, res.data]);
        socket.emit("sendChannelMessage", { ...res.data, channelId: selectedUser.channelId });
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error("Failed to post to channel", err);
      }
      return;
    }

    if (isGroup) {
      try {
        const groupTargetId = selectedUser.groupId || selectedUser.userId;
        const res = await api.post("/messages", {
          receiverId: groupTargetId,
          text: payload.text,
          mediaUrl: payload.mediaUrl,
          messageType: payload.messageType,
          isGroup: true,
          replyTo: replyingTo
            ? { id: replyingTo._id, text: replyingTo.text, senderName: replyingTo.senderUsername || "User" }
            : null,
        });
        setMessages(prev => [...prev, res.data]);
        socket.emit("sendMessage", res.data);
        if (onMessageSent) onMessageSent();
        setReplyingTo(null);
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error("Failed to send group message", err);
      }
      return;
    }

    // Direct (1-on-1) message
    const messagePayload = {
      ...payload,
      senderId: currentUser.userId,
      receiverId: selectedUser.userId,
      status: currentUser.userId === selectedUser.userId ? "seen" : "sent",
      replyTo: replyingTo
        ? { id: replyingTo._id, text: replyingTo.text, senderName: replyingTo.senderUsername || "User" }
        : null,
    };

    try {
      const sent = await sendEncryptedMessage(currentUser, selectedUser, messagePayload);
      socket.emit("sendMessage", sent);
      setMessages(prev => {
        if (sent._id && prev.some(m => m._id === sent._id)) return prev;
        return [...prev, sent];
      });
      setReplyingTo(null);
      setEditingMessage(null);
      if (onMessageSent) onMessageSent();
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }, [editingMessage, isChannel, isGroup, selectedUser, currentUser, replyingTo, scrollToBottom, onMessageSent]);

  // ──────────────────────────────────────────────────────────────
  // Typing indicator
  // ──────────────────────────────────────────────────────────────
  const handleTyping = useCallback(() => {
    if (isChannel || !selectedUser) return;
    // For groups, use groupId; for DMs, use userId
    const receiverId = isGroup
      ? (selectedUser.groupId || selectedUser.userId)
      : selectedUser.userId;

    socket.emit("typing", {
      senderId: currentUser.userId,
      receiverId,
      isTyping: true,
      isGroup,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        senderId: currentUser.userId,
        receiverId,
        isTyping: false,
        isGroup,
      });
    }, 2000);
  }, [isChannel, isGroup, selectedUser, currentUser?.userId]);

  return {
    messages, setMessages,
    isPeerTyping,
    groupTypingUsers,
    isSearchOpen, setIsSearchOpen,
    replyingTo, setReplyingTo,
    editingMessage, setEditingMessage,
    forwardingMessage, setForwardingMessage,
    infoMessage, setInfoMessage,
    showScrollButton, setShowScrollButton,
    showGroupInfo, setShowGroupInfo,
    messageSearchTerm, setMessageSearchTerm,
    isLocked, setIsLocked,
    isChannel, isGroup,
    handleForwardMessage,
    handleSendPayload,
    handleTyping,
    disappearingDuration,
    setDisappearingDuration
  };
}
