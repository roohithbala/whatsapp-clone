import React from 'react';

const LockedChatsRow = ({ railMode, currentUser, onLockTrigger, setRailMode }) => {
  if (railMode === "messages") {
    return (
      <>
        {currentUser?.lockedChats && currentUser.lockedChats.length > 0 && (
          <div 
            className="flex items-center gap-3.5 px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--chat-item-hover)]" 
            onClick={() => onLockTrigger('locked')}
          >
            <div className="w-[49px] h-[49px] rounded-full bg-[var(--bg-input)] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--whatsapp-green)"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>
            </div>
            <div className="flex-1 min-w-0 border-b border-[var(--border-light)] py-1">
              <div className="font-normal text-[15px] text-whatsapp-green">Locked Chats</div>
              <div className="text-[13px] text-[var(--text-secondary)] leading-snug">Locked and hidden</div>
            </div>
          </div>
        )}
        {currentUser?.archivedChats && currentUser.archivedChats.length > 0 && (
          <div 
            className="flex items-center gap-3.5 px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--chat-item-hover)]" 
            onClick={() => setRailMode('archived')}
          >
            <div className="w-[49px] h-[49px] rounded-full bg-[var(--bg-input)] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--whatsapp-green)"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.47 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12.06l.87 1H5.12z"/></svg>
            </div>
            <div className="flex-1 min-w-0 border-b border-[var(--border-light)] py-1">
              <div className="font-normal text-[15px] text-[var(--text-primary)]">Archived</div>
              <div className="text-[13px] text-[var(--text-secondary)] leading-snug">{currentUser.archivedChats.length} conversation{currentUser.archivedChats.length > 1 ? 's' : ''}</div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div 
      className="flex items-center gap-3.5 px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--chat-item-hover)]" 
      onClick={() => setRailMode('messages')}
    >
      <div className="w-[49px] h-[49px] rounded-full bg-[var(--bg-input)] flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--text-secondary)"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </div>
      <div className="flex-1 min-w-0 border-b border-[var(--border-light)] py-1">
        <div className="font-normal text-[15px] text-[var(--text-primary)]">{railMode === 'locked' ? 'Locked Chats' : 'Archived'}</div>
        <div className="text-[13px] text-[var(--text-secondary)] leading-snug">Back to all chats</div>
      </div>
    </div>
  );
};

export default LockedChatsRow;
