import { useEffect, useRef, useState, useCallback } from "react";
import ChatInput from "./ChatInput";
import socket from "../../socket";
import api from "../../services/api";
import { fetchMessages, sendEncryptedMessage } from "../../services/messageService";
import channelService from "../../services/channelService";
import ChatHeader from "./window/ChatHeader";
import MessageItem from "./window/MessageItem";
import ContactInfoPanel from "./window/ContactInfoPanel";
import MessageInfoModal from "./window/MessageInfoModal";
import AppLock from "./AppLock";
import GroupInfo from "./window/GroupInfo";

function ChatWindow({ selectedUser, currentUser, users, onMessageSent, onStartCall }) {
  const [messages, setMessages] = useState([]);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [messageSearchTerm, setMessageSearchTerm] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isChannel = !!selectedUser?.channelId;
  const isGroup = !!selectedUser?.groupId || !!selectedUser?.isGroup || !!selectedUser?.isCommunity;

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Show button if scrolled up more than 100px from bottom
    if (scrollHeight - scrollTop - clientHeight > 100) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

  useEffect(() => {
    if (!currentUser?.userId || !selectedUser) return;
    
    const targetId = selectedUser.userId || selectedUser.groupId;
    if (currentUser.hasPin && currentUser.lockedChats?.includes(targetId)) {
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }

    const markMessagesAsSeen = (msgs) => {
      if (!msgs || msgs.length === 0 || isChannel || isGroup) return;
      const unreadIds = msgs
        .filter(m => m.senderId === selectedUser.userId && m.status !== 'seen')
        .map(m => m._id);
      
      if (unreadIds.length > 0) {
        socket.emit("messageSeen", {
          messageIds: unreadIds,
          senderId: selectedUser.userId,
          receiverId: currentUser.userId
        });
      }
    };

    const loadMessages = async () => {
      try {
        let msgs = [];
        if (isChannel) {
          msgs = await channelService.getChannelMessages(selectedUser.channelId);
        } else if (isGroup) {
          const targetId = (selectedUser.groupId || selectedUser.userId)?.toString(); 
          const res = await api.get(`/messages/fetch-group/${targetId}`);
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

    loadMessages();

    if (isChannel || isGroup) return; 

    // Socket listeners for 1-on-1
    const onReceiveMessage = (message) => {
      if (
        (message.senderId === selectedUser.userId && message.receiverId === currentUser.userId) ||
        (message.senderId === currentUser.userId && message.receiverId === selectedUser.userId)
      ) {
        setMessages(prev => [...prev, message]);
        setTimeout(scrollToBottom, 100);
        
        if (message.senderId === selectedUser.userId) {
          socket.emit("messageSeen", {
            messageIds: [message._id],
            senderId: selectedUser.userId,
            receiverId: currentUser.userId
          });
        }
      }
    };

    const onTyping = ({ senderId, isTyping }) => {
      if (senderId === selectedUser.userId) {
        setIsPeerTyping(isTyping);
      }
    };

    const onMessageDeleted = (messageId) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    };

    const onMessageEdited = (editedMessage) => {
      setMessages(prev => prev.map(m => m._id === editedMessage._id ? editedMessage : m));
    };

    socket.on("receiveMessage", onReceiveMessage);
    socket.on("typing", onTyping);
    socket.on("messageDeleted", onMessageDeleted);
    socket.on("messageEdited", onMessageEdited);

    return () => {
      socket.off("receiveMessage", onReceiveMessage);
      socket.off("typing", onTyping);
      socket.off("messageDeleted", onMessageDeleted);
      socket.off("messageEdited", onMessageEdited);
    };
  }, [selectedUser, currentUser, scrollToBottom, users, isChannel, isGroup, forwardingMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleForwardMessage = async (targetUser) => {
    if (!forwardingMessage) return;
    const payload = {
      text: forwardingMessage.text,
      mediaUrl: forwardingMessage.mediaUrl,
      messageType: forwardingMessage.messageType || "text",
      senderId: currentUser.userId,
      receiverId: targetUser.userId,
      status: 'sent',
      replyTo: null
    };
    
    try {
      const sent = await sendEncryptedMessage(currentUser, targetUser, payload);
      socket.emit("sendMessage", sent);
      setForwardingMessage(null);
      alert("Message forwarded!");
    } catch (err) {
      console.error("Failed to forward:", err);
    }
  };

  const handleSendPayload = async (payload) => {
    if (editingMessage) {
      try {
        const res = await api.put(`/messages/${editingMessage._id}`, { text: payload.text });
        const editedMsg = res.data;
        socket.emit("editMessage", { message: editedMsg, receiverId: selectedUser.userId });
        setMessages(prev => prev.map(m => m._id === editedMsg._id ? editedMsg : m));
        setEditingMessage(null);
      } catch (e) {
        console.error("Failed to edit message", e);
      }
      return;
    }

    if (isChannel) {
      if (selectedUser.adminId !== currentUser.userId) {
        alert("Only admins can post to this channel.");
        return;
      }
      try {
        const res = await api.post(`/channels/${selectedUser.channelId}/messages`, {
          content: payload.text,
          mediaUrl: payload.mediaUrl
        });
        setMessages(prev => [...prev, res.data]);
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error("Failed to post to channel", err);
      }
      return;
    }

    if (isGroup) {
      try {
        const targetId = selectedUser.groupId || selectedUser.userId;
        const res = await api.post("/messages", {
          receiverId: targetId,
          text: payload.text,
          mediaUrl: payload.mediaUrl,
          messageType: payload.messageType,
          isGroup: true
        });
        setMessages(prev => [...prev, res.data]);
        if (onMessageSent) onMessageSent();
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error("Failed to send group message", err);
      }
      return;
    }

    const messagePayload = {
      ...payload,
      senderId: currentUser.userId,
      receiverId: selectedUser.userId,
      status: currentUser.userId === selectedUser.userId ? 'seen' : 'sent',
      replyTo: replyingTo ? { id: replyingTo._id, text: replyingTo.text, senderName: "User" } : null
    };
    
    const sent = await sendEncryptedMessage(currentUser, selectedUser, messagePayload);
    socket.emit("sendMessage", sent);
    setMessages(prev => [...prev, sent]);
    setReplyingTo(null);
    setEditingMessage(null);
    if (onMessageSent) onMessageSent();
    setTimeout(scrollToBottom, 100);
  };

  const handleTyping = () => {
    if (isChannel || isGroup) return;
    socket.emit("typing", {
      senderId: currentUser.userId,
      receiverId: selectedUser.userId,
      isTyping: true
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        senderId: currentUser.userId,
        receiverId: selectedUser.userId,
        isTyping: false
      });
    }, 2000);
  };

  const getHeaderInfo = () => {
    return {
      ...selectedUser,
      username: selectedUser.name || selectedUser.username,
      profilePicture: selectedUser.avatarUrl || selectedUser.profilePicture
    };
  };

  return (
    <section className="chat-window">
      {selectedUser ? (
        <>
          <ChatHeader 
            selectedUser={getHeaderInfo()} 
            isPeerTyping={isPeerTyping} 
            onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
            onStartCall={onStartCall}
            onMoreClick={() => setShowGroupInfo(!showGroupInfo)}
            isChannel={isChannel}
            isGroup={isGroup}
          />
          {isLocked ? (
            <div className="chat-window-content" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-chat-pattern)' }}>
              <AppLock currentUser={currentUser} onUnlock={() => setIsLocked(false)} />
            </div>
          ) : (
            <div className="chat-window-content" style={{ position: 'relative', display: 'flex', flex: 1, overflow: 'hidden' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {isSearchOpen && (
                <div className="chat-message-search-bar" style={{ padding: '12px 16px', background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    className="whatsapp-input" 
                    placeholder="Search messages..." 
                    value={messageSearchTerm}
                    onChange={(e) => setMessageSearchTerm(e.target.value)}
                    style={{ height: '36px', borderRadius: '18px' }}
                  />
                  <button className="icon-button" onClick={() => { setIsSearchOpen(false); setMessageSearchTerm(""); }}>✕</button>
                </div>
              )}
              <div className="chat-messages" ref={messagesContainerRef} onScroll={handleScroll}>
                {messages.filter(m => !messageSearchTerm || (m.text && m.text.toLowerCase().includes(messageSearchTerm.toLowerCase()))).map(m => (
                  <MessageItem 
                    key={m._id || m.timestamp || m.createdAt} 
                    message={m} 
                    currentUser={currentUser} 
                    selectedUser={selectedUser}
                    onReply={setReplyingTo}
                    onEdit={setEditingMessage}
                    onForward={setForwardingMessage}
                    onShowInfo={setInfoMessage}
                    isChannel={isChannel}
                    isGroup={isGroup}
                    onReactionUpdate={(msgId, newReactions) => {
                      setMessages(prev => prev.map(msg => msg._id === msgId ? { ...msg, reactions: newReactions } : msg));
                    }}
                  />
                ))}
                {showScrollButton && (
                  <button 
                    className="scroll-to-bottom-btn" 
                    onClick={scrollToBottom}
                    style={{
                      position: 'absolute', bottom: '80px', right: '20px', 
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'var(--bg-panel)', color: 'var(--icon-color)',
                      border: '1px solid var(--border-light)', boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      zIndex: 100
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
                  </button>
                )}
              </div>
              {((selectedUser.isCommunity && !selectedUser.isAdmin) || (isChannel && !selectedUser.isAdmin)) ? (
                <div className="admin-only-footer">
                  Only admins can send messages
                </div>
              ) : (
                <ChatInput 
                  onSendPayload={handleSendPayload} 
                  replyingTo={replyingTo} 
                  editingMessage={editingMessage}
                  onCancelReply={() => { setReplyingTo(null); setEditingMessage(null); }}
                  onType={handleTyping}
                  placeholder={isChannel ? "Post to channel..." : (isGroup ? "Type in group..." : "Type a message")}
                />
              )}
            </div>

            {showGroupInfo && isGroup && (
              <GroupInfo 
                group={selectedUser} 
                currentUser={currentUser} 
                users={users}
                onClose={() => setShowGroupInfo(false)} 
              />
            )}
            {showGroupInfo && !isGroup && (
              <ContactInfoPanel 
                user={selectedUser} 
                currentUser={currentUser} 
                onClose={() => setShowGroupInfo(false)} 
              />
            )}
          </div>
          )}

          {/* Info Modal */}
          {infoMessage && (
            <MessageInfoModal 
              message={infoMessage} 
              onClose={() => setInfoMessage(null)} 
            />
          )}

          {/* Forward Modal */}
          {forwardingMessage && (
            <div className="whatsapp-modal-overlay" style={{ zIndex: 9999 }}>
              <div className="whatsapp-modal" style={{ padding: '20px', minWidth: '350px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Forward Message</h3>
                
                <div className="modal-search-bar" style={{ marginBottom: '12px' }}>
                  <input 
                    type="text" 
                    className="whatsapp-input" 
                    placeholder="Search contacts..." 
                    value={messageSearchTerm}
                    onChange={(e) => setMessageSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>

                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
                  {users
                    .filter(u => u.userId !== currentUser.userId && (!messageSearchTerm || u.username.toLowerCase().includes(messageSearchTerm.toLowerCase())))
                    .map(u => (
                    <div key={u.userId} className="modal-list-item clickable" onClick={() => {
                      if (window.confirm(`Forward to ${u.username}?`)) {
                        handleForwardMessage(u);
                      }
                    }}>
                      <div className="modal-avatar">{u.username.charAt(0).toUpperCase()}</div>
                      <div className="modal-list-name">{u.username}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="text-button" onClick={() => { setForwardingMessage(null); setMessageSearchTerm(""); }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="chat-empty-state">
          <div className="status-placeholder-content">
            <div style={{ fontSize: '80px' }}>💬</div>
            <h2>WhatsApp for Web</h2>
            <p>Send and receive messages without keeping your phone online.<br/>Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default ChatWindow;
