import React from 'react';

const ChatItem = ({ 
  user, 
  meta, 
  isSelected, 
  onClick, 
  selectMode, 
  isSelectedInMap, 
  onSelectToggle,
  toDisplayName,
  currentUser
}) => {
  let displayName = toDisplayName(user);
  if (currentUser && user.userId === currentUser.userId) {
    displayName += " (You)";
  }
  const avatarChar = displayName.charAt(0).toUpperCase() || "?";

  const lastMsg = meta.lastMessage;
  const lastText = lastMsg ? (lastMsg.text || (lastMsg.type === 'image' ? '📷 Photo' : 'Message')) : (user.status || "Tap to chat");
  const lastTime = lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

  return (
    <div
      onClick={onClick}
      className={`chat-list-item${isSelected ? " active" : ""}`}
    >
      {selectMode && (
        <input
          type="checkbox"
          className="chat-select-checkbox"
          checked={isSelectedInMap}
          readOnly
        />
      )}
      <div className="chat-list-avatar-wrap">
        <div className="chat-list-avatar">{avatarChar}</div>
        {user.isOnline && <span className="online-indicator" />}
      </div>
      <div className="chat-list-meta">
        <div className="chat-list-name-row">
          <div className="chat-list-name">{displayName}</div>
          <div className="chat-list-time">{lastTime}</div>
        </div>
        <div className="chat-list-preview-row">
          <div className="chat-list-preview">
            {user.isTyping ? <span className="status-typing">Typing...</span> : lastText}
          </div>
          {meta.unreadCount > 0 ? (
            <span className="unread-badge">{meta.unreadCount}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
