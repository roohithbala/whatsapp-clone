import React, { useState } from 'react';

const AddMemberModal = ({ communityId, onClose, onAddMember, users }) => {
  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  if (!communityId) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500] flex items-center justify-center p-4 animate-[overlay-fade_0.2s_ease_forwards]" 
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-sidebar)] border border-[var(--border-light)] rounded-2xl p-6 w-full max-w-[380px] shadow-2xl flex flex-col gap-4 max-h-[80vh] animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]" 
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">Add Member to Community</h3>
        
        <div className="w-full">
          <input 
            type="text" 
            className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm px-4 py-2.5 rounded-lg border border-[var(--border-input)] outline-none focus:border-[var(--whatsapp-green)] transition-all duration-200" 
            placeholder="Search users..." 
            value={searchMemberQuery}
            onChange={(e) => setSearchMemberQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
          {users?.filter(u => !u.isGroup && (!searchMemberQuery || u.username.toLowerCase().includes(searchMemberQuery.toLowerCase()))).map(u => (
            <div 
              key={u.userId} 
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200 cursor-pointer text-left shrink-0" 
              onClick={() => onAddMember(communityId, u.userId)}
            >
              <div className="w-9 h-9 rounded-full bg-[var(--bg-input)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)] shrink-0">{u.username?.[0].toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{u.username}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">{u.status || 'Available'}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end pt-2 border-t border-[var(--border-light)]/20">
          <button 
            className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition duration-200 cursor-pointer" 
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
