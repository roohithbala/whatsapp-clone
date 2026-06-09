import React from "react";

const ChatListBroadcastModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="whatsapp-modal-overlay select-none" onClick={onClose}>
      <div
        className="bg-[var(--bg-sidebar)] border border-[var(--border-strong)] rounded-2xl w-[90%] max-w-[400px] p-6 flex flex-col gap-4 shadow-2xl animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📢</span>
            <div>
              <h3 className="text-[15px] font-bold text-[var(--text-primary)]">New Broadcast</h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Send to multiple contacts at once</p>
            </div>
          </div>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors border-0 bg-transparent"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed border border-[var(--border-light)] rounded-xl p-3 bg-[var(--bg-sidebar-alt)]">
          Only contacts who have your number saved in their address book will receive your broadcast messages.
        </p>
        <div className="flex gap-2 justify-end border-t border-[var(--border-light)] pt-3">
          <button
            className="px-4 py-2 text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer rounded-xl hover:bg-[var(--bg-hover)] transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 text-[13px] font-bold bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white rounded-xl border-none cursor-pointer transition shadow-sm"
            onClick={onClose}
          >
            Select Contacts
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatListBroadcastModal;
