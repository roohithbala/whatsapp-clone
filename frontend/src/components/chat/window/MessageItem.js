import React, { useState, useRef, useEffect } from 'react';
import MessageBody from './MessageBody';
import api from '../../../services/api';
import socket from '../../../socket';
const MessageItem = ({ message, currentUser, selectedUser, onReply, onEdit, onForward, onShowInfo, isGroup, isChannel }) => {
  const isSent = message.senderId === currentUser.userId;
  const time = new Date(message.createdAt || message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [showMenu, setShowMenu] = useState(false);
  const [isStarred, setIsStarred] = useState(message.starredBy?.includes(currentUser.userId));
  const menuRef = useRef(null);

  useEffect(() => {
    setIsStarred(message.starredBy?.includes(currentUser.userId));
  }, [message.starredBy, currentUser.userId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate a consistent color for group senders based on their name
  const getSenderColor = (name) => {
    if (!name) return '#00a884';
    const colors = ['#e542a3', '#00a884', '#00b09b', '#9c27b0', '#f44336', '#ff9800', '#03a9f4'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const handleDeleteForMe = async () => {
    try {
      await api.post(`/messages/delete-for-me/${message._id}`);
      window.location.reload(); 
    } catch (e) { console.error("Delete failed", e); }
  };

  const handleDeleteForEveryone = async () => {
    if (window.confirm("Delete this message for everyone?")) {
      try {
        const res = await api.post(`/messages/delete-for-everyone/${message._id}`);
        const deletedMsg = res.data;
        socket.emit("editMessage", { message: deletedMsg, receiverId: selectedUser.userId });
        window.location.reload();
      } catch (e) { console.error("Delete failed", e); }
    }
  };

  const handleStar = async () => {
    try {
      await api.post(`/messages/toggle-star/${message._id}`);
      setIsStarred(!isStarred);
      setShowMenu(false);
    } catch (e) {
      console.error("Star failed", e);
    }
  };

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
    }
    setShowMenu(false);
  };

  return (
    <div className={`message-row ${isSent ? "sent" : "received"}`}>
      <div className={`message-bubble ${isSent ? "sent" : "received"}`} onDoubleClick={() => onReply(message)}>
        
        {/* Group Sender Name */}
        {!isSent && (isGroup || isChannel) && message.senderUsername && (
          <div className="message-sender-name" style={{ color: getSenderColor(message.senderUsername), fontSize: '13px', fontWeight: 500, marginBottom: '2px', cursor: 'pointer' }}>
            {message.senderUsername}
          </div>
        )}

        {message.replyTo && (
          <div className="message-reply-preview" onClick={() => {/* Scroll to msg */}} style={{ cursor: 'pointer' }}>
            <div className="reply-sender">{message.replyTo.senderName || "User"}</div>
            <div className="reply-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
              {message.replyTo.text}
            </div>
          </div>
        )}
        <div className="message-content">
          <MessageBody message={message} />
        </div>
        <div className="message-meta">
          {message.isEdited && <span className="edited-indicator" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginRight: '4px' }}>(edited)</span>}
          {isStarred && <span className="starred-indicator">⭐</span>}
          <span className="message-time">{time}</span>
          {isSent && (
            <span className={`message-status ${message.status}`}>
              {message.status === 'seen' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
            </span>
          )}
          <div className="message-hover-actions">
            <button className="chat-item-menu-trigger" onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}>
              <svg viewBox="0 0 19 20" width="19" height="20"><path fill="currentColor" d="M3.8 6.7l5.7 5.7 5.7-5.7 1.6 1.6-7.3 7.2-7.3-7.2 1.6-1.6z"></path></svg>
            </button>
            
            {showMenu && (
              <div className="chat-item-dropdown" ref={menuRef} style={{ display: 'flex', top: '100%', right: '0', minWidth: '160px' }}>
                <div onClick={(e) => { e.stopPropagation(); onReply(message); setShowMenu(false); }}>Reply</div>
                {isSent && <div onClick={(e) => { e.stopPropagation(); onShowInfo(message); setShowMenu(false); }}>Info</div>}
                <div onClick={(e) => { e.stopPropagation(); handleCopy(); }}>Copy</div>
                <div onClick={(e) => { e.stopPropagation(); onForward(message); setShowMenu(false); }}>Forward</div>
                <div onClick={(e) => { e.stopPropagation(); handleStar(); }}>
                  {isStarred ? "Unstar" : "Star"}
                </div>
                {isSent && !message.isDeleted && <div onClick={(e) => { e.stopPropagation(); onEdit(message); setShowMenu(false); }}>Edit</div>}
                <div style={{ color: '#ef4444' }} onClick={(e) => { e.stopPropagation(); handleDeleteForMe(); }}>Delete for me</div>
                {isSent && !message.isDeleted && <div style={{ color: '#ef4444' }} onClick={(e) => { e.stopPropagation(); handleDeleteForEveryone(); }}>Delete for everyone</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
