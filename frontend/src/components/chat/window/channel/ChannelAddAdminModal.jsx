import React, { useState } from "react";

const API_BASE = "http://localhost:5000";

const ChannelAddAdminModal = ({
  users,
  adminsList,
  onClose,
  handlePromote
}) => {
  const [adminSearchTerm, setAdminSearchTerm] = useState("");

  const eligibleUsers = users?.filter(u => {
    const isGroup = u.isGroup || u.isCommunityGroup || u.isChannel;
    const isAlreadyAdmin = adminsList.includes(String(u.userId));
    const matchesSearch = u.username?.toLowerCase().includes(adminSearchTerm.toLowerCase());
    return !isGroup && !isAlreadyAdmin && matchesSearch;
  }) || [];

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500] flex items-center justify-center p-4 animate-[overlay-fade_0.2s_ease_forwards]" 
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-sidebar)] border border-[var(--border-light)] rounded-2xl p-6 w-full max-w-[380px] shadow-2xl flex flex-col gap-4 animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]" 
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2 text-left">Add Admin</h3>
        
        <input 
          className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm px-3 py-2 rounded-lg border border-[var(--border-input)] outline-none focus:border-[var(--whatsapp-green)] transition-all duration-200" 
          placeholder="Search users..." 
          value={adminSearchTerm}
          onChange={e => setAdminSearchTerm(e.target.value)}
          autoFocus
        />

        <div className="max-h-[250px] overflow-y-auto flex flex-col gap-1 pr-1">
          {eligibleUsers.map(u => (
            <div 
              key={u.userId} 
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition duration-200 cursor-pointer text-left" 
              onClick={() => handlePromote(u.userId)}
            >
              <div className="w-9 h-9 rounded-full bg-[var(--bg-input)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)] shrink-0 overflow-hidden relative select-none">
                {u.profilePicture ? (
                  <img 
                    src={u.profilePicture.startsWith("http") ? u.profilePicture : `${API_BASE}${u.profilePicture}`} 
                    className="w-full h-full object-cover" 
                    alt={u.username}
                  />
                ) : (
                  u.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{u.username}</div>
                <div className="text-xs text-[var(--text-secondary)] truncate">{u.status || "Available"}</div>
              </div>
              <div className="text-[11px] font-bold text-[var(--whatsapp-green)] bg-[var(--whatsapp-green)]/10 px-2 py-0.5 rounded-full shrink-0">
                + Add
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="w-full py-2.5 bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-sm font-semibold rounded-full border border-[var(--border-light)] transition duration-200 cursor-pointer" 
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ChannelAddAdminModal;
