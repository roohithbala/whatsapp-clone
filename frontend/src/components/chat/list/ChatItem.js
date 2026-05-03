import React from 'react';
import userService from '../../../services/userService';

const ChatItem = ({ 
  user, 
  meta, 
  isSelected, 
  onClick, 
  selectMode, 
  isSelectedInMap, 
  onSelectToggle,
  toDisplayName,
  currentUser,
  refreshUserData
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
        {user.isOnline && !user.isGroup && <span className="online-indicator" />}
      </div>
      <div className="chat-list-meta">
        <div className="chat-list-name-row">
          <div className="chat-list-name">{displayName}</div>
          <div className="chat-list-time">
            {lastTime}
            <div className="chat-item-menu-trigger" onClick={(e) => { e.stopPropagation(); }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 4.001A2 2 0 0 0 12 13zm0 6a2 2 0 1 0-.001 4.001A2 2 0 0 0 12 19z"/></svg>
              <div className="chat-item-dropdown">
                <div className="dropdown-item" onClick={async (e) => { 
                  e.stopPropagation(); 
                  const isArchived = currentUser?.archivedChats?.includes(user.userId);
                  if (isArchived) await userService.unarchiveChat(user.userId);
                  else await userService.archiveChat(user.userId);
                  if (refreshUserData) await refreshUserData();
                  else window.location.reload(); 
                }}>
                  <span>{currentUser?.archivedChats?.includes(user.userId) ? '📥 Unarchive' : '📥 Archive'}</span>
                </div>
                
                <div className="dropdown-item" onClick={async (e) => { 
                  e.stopPropagation(); 
                  await userService.favoriteChat(user.userId);
                  if (refreshUserData) await refreshUserData();
                  else window.location.reload();
                }}>
                  <span>{currentUser?.favoriteUsers?.includes(user.userId) ? '⭐ Unfavorite' : '⭐ Favorite'}</span>
                </div>
                
                <div className="dropdown-item" onClick={async (e) => { 
                  e.stopPropagation(); 
                  const isBlocked = currentUser?.blockedUsers?.includes(user.userId);
                  if (isBlocked) await userService.unblockChat(user.userId);
                  else await userService.blockChat(user.userId);
                  if (refreshUserData) await refreshUserData();
                  else window.location.reload();
                }}>
                  <span>{currentUser?.blockedUsers?.includes(user.userId) ? '🚫 Unblock' : '🚫 Block'}</span>
                </div>
                
                <div className="dropdown-item" onClick={async (e) => { 
                  e.stopPropagation(); 
                  const isLocked = currentUser?.lockedChats?.includes(user.userId);
                  if (isLocked) {
                    await userService.unlockChat(user.userId);
                  } else {
                    if (!currentUser.hasPin) {
                      alert("Please set a PIN in Settings > Security first.");
                      return;
                    }
                    await userService.lockChat(user.userId);
                  }
                  if (refreshUserData) await refreshUserData();
                  else window.location.reload();
                }}>
                  <span>{currentUser?.lockedChats?.includes(user.userId) ? '🔓 Unlock' : '🔒 Lock'}</span>
                </div>
              </div>
            </div>
          </div>
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
