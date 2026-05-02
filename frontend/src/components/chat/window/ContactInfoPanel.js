import React, { useState } from 'react';
import userService from '../../../services/userService';

const ContactInfoPanel = ({ user, onClose, currentUser }) => {
  const [isBlocked, setIsBlocked] = useState(currentUser?.blockedUsers?.includes(user.userId));
  const [isFavorite, setIsFavorite] = useState(currentUser?.favoriteUsers?.includes(user.userId));
  const [isArchived, setIsArchived] = useState(currentUser?.archivedChats?.includes(user.userId));
  const [isLocked, setIsLocked] = useState(currentUser?.lockedChats?.includes(user.userId));

  if (!user) return null;

  const handleBlock = async () => {
    try {
      if (isBlocked) await userService.unblockChat(user.userId);
      else await userService.blockChat(user.userId);
      setIsBlocked(!isBlocked);
    } catch (e) { alert("Action failed"); }
  };

  const handleFavorite = async () => {
    try {
      await userService.favoriteChat(user.userId);
      setIsFavorite(!isFavorite);
    } catch (e) { alert("Action failed"); }
  };

  const handleArchive = async () => {
    try {
      if (isArchived) await userService.unarchiveChat(user.userId);
      else await userService.archiveChat(user.userId);
      setIsArchived(!isArchived);
    } catch (e) { alert("Action failed"); }
  };

  const handleLock = async () => {
    try {
      if (isLocked) await userService.unlockChat(user.userId);
      else await userService.lockChat(user.userId);
      setIsLocked(!isLocked);
    } catch (e) { alert("Action failed"); }
  };

  return (
    <div className="sidebar-content-view" style={{ 
      position: 'absolute', right: 0, top: 0, bottom: 0, width: '30%', minWidth: '320px', 
      borderLeft: '1px solid var(--border-light)', zIndex: 1000, background: 'var(--bg-panel)',
      animation: 'slideInRight 0.3s ease-out'
    }}>
      <div className="chat-sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="icon-button" onClick={onClose}>✕</button>
        <h2>Contact info</h2>
      </div>
      
      <div className="sidebar-scrollable" style={{ paddingBottom: '20px' }}>
        <div style={{ textAlign: 'center', padding: '28px 20px' }}>
          <div style={{ 
            width: '160px', height: '160px', borderRadius: '50%', background: 'var(--whatsapp-green)', 
            margin: '0 auto 20px', display: 'grid', placeItems: 'center', fontSize: '64px', color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden'
          }}>
            {user.profilePicture ? <img src={user.profilePicture} style={{width:'100%', height:'100%', objectFit: 'cover'}} alt=""/> : user.username?.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontSize: '20px' }}>{user.username}</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>{user.isOnline ? 'Online' : 'Offline'}</p>
        </div>

        <div style={{ padding: '16px 30px', background: 'var(--bg-sidebar)', marginBottom: '12px' }}>
          <h4 style={{ color: 'var(--whatsapp-green)', margin: '0 0 8px', fontSize: '14px', fontWeight: '500' }}>About</h4>
          <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '15px' }}>{user.status || "Hey there! I am using WhatsApp."}</p>
        </div>

        <div style={{ padding: '16px 30px', background: 'var(--bg-sidebar)', marginBottom: '12px' }}>
          <div className="chat-list-item clickable" style={{ padding: '12px 0' }} onClick={handleFavorite}>
            <div style={{ color: isFavorite ? 'var(--whatsapp-green)' : 'var(--text-secondary)', fontSize: '20px', marginRight: '20px' }}>⭐</div>
            <div className="chat-list-name" style={{ fontWeight: 400 }}>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</div>
          </div>
          <div className="chat-list-item clickable" style={{ padding: '12px 0' }} onClick={handleArchive}>
            <div style={{ color: isArchived ? 'var(--whatsapp-green)' : 'var(--text-secondary)', fontSize: '20px', marginRight: '20px' }}>📥</div>
            <div className="chat-list-name" style={{ fontWeight: 400 }}>{isArchived ? 'Unarchive Chat' : 'Archive Chat'}</div>
          </div>
          <div className="chat-list-item clickable" style={{ padding: '12px 0' }} onClick={handleLock}>
            <div style={{ color: isLocked ? 'var(--whatsapp-green)' : 'var(--text-secondary)', fontSize: '20px', marginRight: '20px' }}>🔒</div>
            <div className="chat-list-name" style={{ fontWeight: 400 }}>{isLocked ? 'Unlock Chat' : 'Lock Chat'}</div>
          </div>
        </div>

        <div style={{ padding: '16px 30px', background: 'var(--bg-sidebar)' }}>
          <div className="chat-list-item clickable" style={{ padding: '12px 0', color: '#ea0038' }} onClick={handleBlock}>
            <div style={{ fontSize: '20px', marginRight: '20px' }}>🚫</div>
            <div className="chat-list-name" style={{ color: '#ea0038', fontWeight: 400 }}>{isBlocked ? 'Unblock User' : 'Block User'}</div>
          </div>
          <div className="chat-list-item clickable" style={{ padding: '12px 0', color: '#ea0038' }}>
            <div style={{ fontSize: '20px', marginRight: '20px' }}>🚩</div>
            <div className="chat-list-name" style={{ color: '#ea0038', fontWeight: 400 }}>Report User</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoPanel;
