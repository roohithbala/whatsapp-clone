import React, { useState } from "react";

const ShareContactModal = ({ isOpen, onClose, users = [], onSendPayload }) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  return (
    <div className="whatsapp-modal-overlay select-none" onClick={onClose}>
      <div 
        className="whatsapp-modal max-w-[420px] !bg-[var(--bg-sidebar)] border border-[var(--border-strong)] rounded-3xl p-6 relative flex flex-col text-left shadow-[var(--shadow-heavy)] h-auto max-h-[80vh]" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header: Fixed */}
        <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">👤</span>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] leading-tight">Share Contact</h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Select a contact to share</p>
            </div>
          </div>
          <button 
            className="w-8 h-8 rounded-full border-none bg-transparent hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer transition text-base"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Search Input: Fixed */}
        <div className="mb-4 shrink-0">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-strong)] rounded-xl text-[14px] outline-none transition focus:border-[var(--whatsapp-green)] focus:ring-1 focus:ring-[var(--whatsapp-green)]"
          />
        </div>

        {/* Contacts List Body: Scrollable */}
        <div className="flex-1 overflow-y-auto max-h-[250px] pr-1 flex flex-col gap-1.5" style={{ scrollbarWidth: "thin" }}>
          {users
            .filter(u => u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(u => {
              const initials = u.username.slice(0, 2).toUpperCase();
              return (
                <div 
                  key={u.userId}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-hover)] cursor-pointer transition select-none border border-transparent hover:border-[var(--border-light)]"
                  onClick={() => {
                    onSendPayload({
                      text: u.username,
                      messageType: "contact",
                      mediaUrl: u.profilePicture || u.avatarUrl || "",
                      timestamp: new Date().toISOString()
                    });
                    onClose();
                    setSearchQuery("");
                  }}
                >
                  <div className="w-[38px] h-[38px] rounded-full overflow-hidden flex items-center justify-center font-bold text-white text-xs bg-gradient-to-tr from-[var(--whatsapp-green)] to-[var(--whatsapp-teal)] shrink-0 shadow-sm relative">
                    <span>{initials}</span>
                    {(u.profilePicture || u.avatarUrl) && (
                      <img src={u.profilePicture || u.avatarUrl} alt="" className="w-full h-full object-cover absolute inset-0" onError={e => { e.target.style.display = "none"; }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13.5px] font-bold text-[var(--text-primary)] truncate">{u.username}</h4>
                    <span className="text-[10px] text-[var(--text-secondary)]">@{u.username}</span>
                  </div>
                </div>
              );
            })}
          {users.filter(u => u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
            <div className="text-center py-6 text-xs text-[var(--text-secondary)] select-none">
              No contacts found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareContactModal;
