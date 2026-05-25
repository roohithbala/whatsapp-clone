import React, { useState } from 'react';

const StatusPrivacyModal = ({
  isOpen,
  onClose,
  privacyType,
  setPrivacyType,
  privacyList,
  setPrivacyList,
  users,
  currentUser
}) => {
  const [showUserSelection, setShowUserSelection] = useState(false);

  if (!isOpen) return null;

  const toggleUserSelection = (userId) => {
    if (privacyList.includes(userId)) {
      setPrivacyList(privacyList.filter(id => id !== userId));
    } else {
      setPrivacyList([...privacyList, userId]);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500] flex items-center justify-center p-4 animate-[overlay-fade_0.2s_ease_forwards]"
      onClick={onClose}
    >
      {!showUserSelection ? (
        <div 
          className="bg-[var(--bg-sidebar)] border border-[var(--border-light)] rounded-2xl p-6 w-full max-w-[380px] shadow-2xl flex flex-col gap-4 animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]"
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Status privacy</h3>
          <p className="text-xs text-[var(--text-secondary)] -mt-2">Who can see your status updates</p>
          
          <div className="flex flex-col gap-2">
            <div 
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition-all duration-200 cursor-pointer" 
              onClick={() => { setPrivacyType('all'); setPrivacyList([]); }}
            >
              <input type="radio" checked={privacyType === 'all'} readOnly className="accent-[var(--whatsapp-green)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">My contacts</span>
            </div>
            
            <div 
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition-all duration-200 cursor-pointer" 
              onClick={() => { setPrivacyType('except'); setShowUserSelection(true); }}
            >
              <input type="radio" checked={privacyType === 'except'} readOnly className="accent-[var(--whatsapp-green)]" />
              <div className="flex-1 text-left">
                <span className="text-sm font-medium text-[var(--text-primary)] block">My contacts except...</span>
                {privacyType === 'except' && <div className="text-xs text-[var(--whatsapp-green)] font-semibold">{privacyList.length} excluded</div>}
              </div>
            </div>
            
            <div 
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition-all duration-200 cursor-pointer" 
              onClick={() => { setPrivacyType('only'); setShowUserSelection(true); }}
            >
              <input type="radio" checked={privacyType === 'only'} readOnly className="accent-[var(--whatsapp-green)]" />
              <div className="flex-1 text-left">
                <span className="text-sm font-medium text-[var(--text-primary)] block">Only share with...</span>
                {privacyType === 'only' && <div className="text-xs text-[var(--whatsapp-green)] font-semibold">{privacyList.length} selected</div>}
              </div>
            </div>
          </div>

          <button 
            className="w-full py-2.5 bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white text-sm font-semibold rounded-full shadow-md transition-all duration-200 cursor-pointer" 
            onClick={onClose}
          >
            Done
          </button>
        </div>
      ) : (
        <div 
          className="bg-[var(--bg-sidebar)] border border-[var(--border-light)] rounded-2xl p-6 w-full max-w-[380px] shadow-2xl flex flex-col gap-4 max-h-[80vh] animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 pb-2 border-b border-[var(--border-light)]">
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer transition duration-200" onClick={() => setShowUserSelection(false)}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
            </button>
            <h3 className="text-base font-bold text-[var(--text-primary)]">{privacyType === 'except' ? 'Hide status from' : 'Share status with'}</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
            {users.filter(u => u.userId !== currentUser.userId && !u.isGroup && !u.groupId && !u.communityId && !u.isCommunity && !u.isCommunityGroup).map(u => (
              <div 
                key={u.userId} 
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200 cursor-pointer" 
                onClick={() => toggleUserSelection(u.userId)}
              >
                 <div className="w-9 h-9 rounded-full bg-[var(--bg-input)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)]">{u.username?.[0]}</div>
                 <div className="flex-1 text-sm font-medium text-[var(--text-primary)]">{u.username}</div>
                 <input type="checkbox" checked={privacyList.includes(u.userId)} readOnly className="w-4 h-4 accent-[var(--whatsapp-green)]" />
              </div>
            ))}
          </div>

          <button 
            className="w-full py-2.5 bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white text-sm font-semibold rounded-full shadow-md transition-all duration-200 cursor-pointer" 
            onClick={() => setShowUserSelection(false)}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

export default StatusPrivacyModal;
