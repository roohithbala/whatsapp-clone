import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const AddMemberModal = ({ communityId, onClose, onAddMember, users }) => {
  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  if (!communityId) return null;

  const filteredUsers = users?.filter(u => !u.isGroup && (!searchMemberQuery || u.username.toLowerCase().includes(searchMemberQuery.toLowerCase())));

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500] flex items-center justify-center p-4 animate-[overlay-fade_0.2s_ease_forwards]" 
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-sidebar-alt)] border border-[var(--border-strong)] rounded-2xl p-6 w-full max-w-[380px] shadow-2xl flex flex-col gap-4 max-h-[80vh] animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]" 
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">Add Member</h3>
        
        <div className="w-full">
          <input 
            type="text" 
            className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm px-4 py-3 rounded-xl border border-[var(--border-input)] outline-none focus:border-[var(--whatsapp-green)] focus:ring-2 focus:ring-[var(--whatsapp-green)]/20 transition-all duration-200" 
            placeholder="Search users..." 
            value={searchMemberQuery}
            onChange={(e) => setSearchMemberQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
          {filteredUsers?.length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center gap-2">
              <span className="text-3xl">🔍</span>
              <p className="text-sm text-[var(--text-muted)]">No users found</p>
            </div>
          ) : (
            filteredUsers?.map(u => (
              <div 
                key={u.userId} 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200 cursor-pointer text-left shrink-0 border border-transparent hover:border-[var(--border-light)]" 
                onClick={() => onAddMember(communityId, u.userId)}
              >
                <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] flex items-center justify-center font-bold text-sm text-[var(--whatsapp-green)] shrink-0 border border-[var(--border-light)]">
                  {u.username?.[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{u.username}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">{u.status || 'Available'}</div>
                </div>
                <svg className="w-4 h-4 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
            ))
          )}
        </div>
        
        <div className="flex justify-end pt-2 border-t border-[var(--border-light)]">
          <button 
            className="px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition-all duration-200 cursor-pointer" 
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddMemberModal;
