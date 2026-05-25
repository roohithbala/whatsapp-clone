import React from 'react';
import userService from '../../../../services/userService';

const SettingsBlocked = ({ onBack, currentUser, users, onUpdateSettings }) => {
  const handleUnblock = async (userId) => {
    try {
      await userService.unblockChat(userId);
      if (onUpdateSettings) onUpdateSettings({ blockedUsers: currentUser.blockedUsers.filter(id => id !== userId) });
    } catch (e) {
      console.error(e);
      alert("Failed to unblock");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-sidebar)]">
      <div className="p-5 border-b border-[var(--border-light)] flex items-center gap-3 text-left bg-[var(--bg-sidebar-alt)]">
        <button 
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer transition duration-200" 
          onClick={onBack}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Blocked</h2>
      </div>
      <div className="settings-list flex-1 overflow-y-auto">
        {currentUser?.blockedUsers?.map(userId => {
           const user = users?.find(u => String(u.userId) === String(userId));
           return (
             <div key={userId} className="settings-item flex items-center justify-between p-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition select-none text-left">
               <div className="settings-item-text flex-1">
                 <h4 className="text-sm font-semibold text-[var(--text-primary)]">{user?.username || userId}</h4>
               </div>
               <button 
                 className="px-3 py-1.5 text-xs text-[var(--whatsapp-green)] font-semibold hover:bg-[var(--whatsapp-green)]/10 rounded-full transition cursor-pointer" 
                 onClick={() => handleUnblock(userId)}
               >
                 Unblock
               </button>
             </div>
           );
        })}
        {(!currentUser?.blockedUsers || currentUser.blockedUsers.length === 0) && (
          <p className="text-center p-8 text-xs text-[var(--text-secondary)]">No blocked contacts</p>
        )}
      </div>
    </div>
  );
};

export default SettingsBlocked;
