import React from 'react';

const ChatHeader = ({ selectedUser, isPeerTyping, onToggleSearch, onMoreClick, onStartCall }) => {
  const avatarChar = selectedUser?.username?.charAt(0).toUpperCase() || "?";

  return (
    <header className="chat-window-header">
      <div className="chat-header-info">
        <div className="chat-header-avatar">{avatarChar}</div>
        <div className="chat-header-details">
          <div className="chat-header-name">{selectedUser?.username}</div>
          <div className="chat-header-status">
            {isPeerTyping ? (
              <span className="status-typing">typing...</span>
            ) : selectedUser?.isGroup ? (
              `${selectedUser.members?.length || 0} participants`
            ) : selectedUser?.isOnline ? (
              "online"
            ) : selectedUser?.updatedAt ? (
              `last seen at ${new Date(selectedUser.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            ) : (
              "offline"
            )}
          </div>
        </div>
      </div>
      <div className="chat-header-actions">
        <button className="chat-header-icon-btn" onClick={() => onStartCall('video')} title="Video Call">
          <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
        </button>
        <button className="chat-header-icon-btn" onClick={() => onStartCall('audio')} title="Audio Call">
          <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 0 0-1.02.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.21c.28-.27.36-.66.25-1.01A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/></svg>
        </button>
        <button className="chat-header-icon-btn" onClick={onToggleSearch}>
          <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        </button>
        <button className="chat-header-icon-btn" onClick={onMoreClick}>
          <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
