import React, { useState } from 'react';
import Modal from '../../ui/Modal';

const NewChatModal = ({ isOpen, onClose, users = [], currentUser, setSelectedUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.userId !== currentUser?.userId && 
    !user.isGroup && 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Chat">
      <div className="flex flex-col gap-4 max-h-[70vh]">
        <div className="bg-[var(--bg-input)] border border-[var(--border-input)] px-4 py-2.5 rounded-xl flex items-center gap-2">
          <span className="text-[var(--text-secondary)] text-sm">🔍</span>
          <input 
            type="text" 
            placeholder="Search contacts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm outline-none w-full"
          />
        </div>

        <div className="overflow-y-auto flex flex-col gap-1 pr-1">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div 
                key={user.userId} 
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-hover)] cursor-pointer transition text-left"
                onClick={() => setSelectedUser(user)}
              >
                <div className="w-10 h-10 rounded-full bg-[var(--whatsapp-green)]/15 text-[var(--whatsapp-green)] font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{user.username}</div>
                  <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{user.status || 'Available'}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-sm text-[var(--text-secondary)]">No contacts found</div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NewChatModal;
