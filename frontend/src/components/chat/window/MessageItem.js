import React, { useState, useRef, useEffect } from 'react';
import MessageBody from './MessageBody';
import api from '../../../services/api';
import socket from '../../../socket';
import ReactionInfoModal from './ReactionInfoModal';

const MessageItem = ({ 
  message, currentUser, selectedUser, onReply, onEdit, onForward, onShowInfo, 
  isGroup, isChannel, onReactionUpdate, users 
}) => {
  const isSent = message.senderId === currentUser.userId;
  const time = new Date(message.createdAt || message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [showMenu, setShowMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReactionInfo, setShowReactionInfo] = useState(false);
  const [isStarred, setIsStarred] = useState(message.starredBy?.includes(currentUser.userId));
  const menuRef = useRef(null);

  const handleReact = async (emoji) => {
    try {
      const existing = (message.reactions || []).find(r => r.userId === currentUser.userId);
      let newReactions = [...(message.reactions || [])];
      
      if (existing) {
        if (existing.emoji === emoji) {
          newReactions = newReactions.filter(r => r.userId !== currentUser.userId);
        } else {
          newReactions = newReactions.map(r => r.userId === currentUser.userId ? { ...r, emoji } : r);
        }
      } else {
        newReactions.push({ userId: currentUser.userId, emoji });
      }

      // 1. Optimistic UI update for the sender
      if (onReactionUpdate) onReactionUpdate(message._id, newReactions);

      // 2. Save to DB
      await api.post(`/messages/react/${message._id}`, { emoji });
      setShowReactionPicker(false);
      
      // 3. Notify other users via socket
      if (selectedUser) {
        socket.emit("editMessage", { 
          message: { ...message, reactions: newReactions }, 
          receiverId: selectedUser.userId 
        });
      }
    } catch (e) {
      console.error("Reaction failed", e);
    }
  };

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
            <span className={`message-status ${message.status}`} style={{ color: message.status === 'seen' ? '#53bdeb' : 'inherit' }}>
              {message.status === 'seen' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
            </span>
          )}
          <div className="message-hover-actions">
            <button className="chat-item-menu-trigger" onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}>
              <svg viewBox="0 0 19 20" width="19" height="20"><path fill="currentColor" d="M3.8 6.7l5.7 5.7 5.7-5.7 1.6 1.6-7.3 7.2-7.3-7.2 1.6-1.6z"></path></svg>
            </button>
            <div className="reaction-trigger-wrap" style={{ position: 'relative' }}>
              <button className="reaction-trigger icon-button" style={{ padding: '4px', fontSize: '16px' }} onClick={(e) => { e.stopPropagation(); setShowReactionPicker(!showReactionPicker); }}>➕</button>
              {showReactionPicker && (
                <div className="reaction-picker-mini" style={{ position: 'absolute', bottom: '100%', right: 0, background: 'var(--bg-sidebar)', padding: '4px', borderRadius: '20px', display: 'flex', gap: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', zIndex: 10 }}>
                  {['❤️', '😂', '👍', '😮', '🙏'].map(emoji => (
                    <span key={emoji} className="emoji-item clickable" style={{ padding: '4px' }} onClick={(e) => { e.stopPropagation(); handleReact(emoji); }}>{emoji}</span>
                  ))}
                </div>
              )}
            </div>
            
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

        {message.reactions && Array.isArray(message.reactions) && message.reactions.length > 0 && (
          <div 
            className="message-reactions-list clickable" 
            onClick={(e) => { e.stopPropagation(); setShowReactionInfo(true); }}
            style={{ 
              position: 'absolute', 
              bottom: '-12px', 
              right: isSent ? '8px' : 'auto', 
              left: isSent ? 'auto' : '8px', 
              display: 'flex', 
              gap: '2px', 
              background: 'var(--bg-chat-bubble)', 
              padding: '2px 6px', 
              borderRadius: '12px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
              fontSize: '13px', 
              zIndex: 1,
              border: '1px solid var(--border-light)',
              cursor: 'pointer'
            }}
          >
            {Array.from(new Set(message.reactions.map(r => r.emoji))).map(emoji => (
              <span key={emoji}>{emoji}</span>
            ))}
            {message.reactions.length > 1 && <span style={{ color: 'var(--text-secondary)', marginLeft: '2px', fontSize: '11px' }}>{message.reactions.length}</span>}
          </div>
        )}

        {showReactionInfo && (
          <ReactionInfoModal 
            reactions={message.reactions} 
            users={users} 
            onClose={() => setShowReactionInfo(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default MessageItem;
