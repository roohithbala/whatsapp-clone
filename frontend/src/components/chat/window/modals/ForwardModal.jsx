import React, { useState } from 'react';

const ForwardModal = ({ 
  forwardingMessage, 
  setForwardingMessage, 
  messageSearchTerm, 
  setMessageSearchTerm, 
  users, 
  handleForwardMessage 
}) => {
  const [pendingUser, setPendingUser] = useState(null);

  if (!forwardingMessage) return null;

  const handleClose = () => {
    setForwardingMessage(null);
    setMessageSearchTerm("");
    setPendingUser(null);
  };

  const handleUserClick = (u) => {
    setPendingUser(u);
  };

  const handleConfirm = () => {
    if (pendingUser) {
      handleForwardMessage(pendingUser);
      handleClose();
    }
  };

  return (
    <div className="whatsapp-modal-overlay select-none" onClick={handleClose}>
      <div
        className="bg-[var(--bg-sidebar)] border border-[var(--border-strong)] rounded-2xl w-[90%] max-w-[400px] flex flex-col gap-0 shadow-2xl overflow-hidden animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--border-light)]">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--whatsapp-green)]">
              <polyline points="15 17 20 12 15 7" />
              <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
            </svg>
            <h3 className="text-[15px] font-bold text-[var(--text-primary)]">Forward message</h3>
          </div>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors border-0 bg-transparent"
            onClick={handleClose}
            title="Close"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-[var(--border-light)]">
          <input
            type="text"
            placeholder="Search contacts..."
            value={messageSearchTerm}
            onChange={(e) => setMessageSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-strong)] rounded-xl text-[13.5px] outline-none transition focus:border-[var(--whatsapp-green)]"
            autoFocus
          />
        </div>

        {/* User List */}
        <div className="overflow-y-auto max-h-[40vh] flex flex-col py-2">
          {users
            .filter(u => u.username?.toLowerCase().includes(messageSearchTerm.toLowerCase()))
            .map(u => (
              <div
                key={u.userId}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all duration-150 ${
                  pendingUser?.userId === u.userId
                    ? 'bg-[var(--whatsapp-green)]/10 border-l-2 border-[var(--whatsapp-green)]'
                    : 'hover:bg-[var(--bg-hover)] border-l-2 border-transparent'
                }`}
                onClick={() => handleUserClick(u)}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--whatsapp-green)] to-[var(--whatsapp-teal)] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {u.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-[var(--text-primary)] truncate">{u.username}</div>
                  {u.status && <div className="text-[11px] text-[var(--text-secondary)] truncate">{u.status}</div>}
                </div>
                {pendingUser?.userId === u.userId && (
                  <div className="w-5 h-5 rounded-full bg-[var(--whatsapp-green)] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Inline Confirm / Footer */}
        {pendingUser && (
          <div className="px-4 py-3 border-t border-[var(--border-light)] bg-[var(--bg-sidebar-alt)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[var(--whatsapp-green)] to-[var(--whatsapp-teal)] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {pendingUser.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                Forward to <span className="text-[var(--whatsapp-green)]">{pendingUser.username}</span>?
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                className="px-3 py-1.5 text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer rounded-lg hover:bg-[var(--bg-hover)] transition"
                onClick={() => setPendingUser(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1.5 text-[12px] font-bold bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white rounded-xl border-none cursor-pointer transition shadow-sm"
                onClick={handleConfirm}
              >
                Forward
              </button>
            </div>
          </div>
        )}

        {!pendingUser && (
          <div className="px-4 py-3 border-t border-[var(--border-light)] flex justify-end">
            <button
              className="px-4 py-1.5 text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer rounded-lg hover:bg-[var(--bg-hover)] transition"
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForwardModal;
