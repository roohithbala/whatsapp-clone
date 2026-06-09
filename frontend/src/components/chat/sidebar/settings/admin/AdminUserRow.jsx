import React from "react";

const AdminUserRow = ({ user, actionLoadingId, onToggleSuspend, onViewChats }) => (
  <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-sidebar-alt)]">
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="relative w-9 h-9 rounded-full bg-[var(--whatsapp-teal)]/20 border border-[var(--border-light)] flex items-center justify-center text-sm font-bold text-[var(--whatsapp-green)] shrink-0 overflow-hidden">
        {user.profilePicture ? (
          <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          user.username.substring(0, 2).toUpperCase()
        )}
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-sidebar)] ${
            user.isOnline ? "bg-green-500" : "bg-zinc-500"
          }`}
        />
      </div>

      {/* Info */}
      <div>
        <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
          {user.username}
          {user.role === "admin" && (
            <span className="px-1.5 py-0.5 rounded text-[8px] bg-[var(--whatsapp-green)]/20 text-[var(--whatsapp-green)] uppercase">
              Admin
            </span>
          )}
          {user.isSuspended && (
            <span className="px-1.5 py-0.5 rounded text-[8px] bg-red-500/20 text-red-400 uppercase">
              Banned
            </span>
          )}
        </h4>
        <p className="text-[10px] text-[var(--text-secondary)]">{user.email}</p>
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-2 shrink-0">
      {/* View chats */}
      <button
        onClick={() => onViewChats(user)}
        title="View chat history"
        className="py-1.5 px-2.5 rounded-lg text-[10px] font-bold bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] border border-[var(--border-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
      >
        👁 Chats
      </button>

      {/* Ban/activate — admins are untouchable */}
      {user.role !== "admin" && (
        <button
          onClick={() => {
            if (user.isSuspended) {
              onToggleSuspend(user.userId);
            } else {
              const reason = window.prompt(`Enter suspension reason for ${user.username}:`);
              if (reason === null) return; // cancelled
              onToggleSuspend(user.userId, reason);
            }
          }}
          disabled={actionLoadingId === user.userId}
          className={`py-1.5 px-3 rounded-lg text-[10px] font-bold transition cursor-pointer ${
            user.isSuspended
              ? "bg-green-600/20 text-green-400 hover:bg-green-600/35"
              : "bg-red-600/20 text-red-400 hover:bg-red-600/35"
          }`}
        >
          {user.isSuspended ? "Activate" : "Ban"}
        </button>
      )}
    </div>
  </div>
);

export default AdminUserRow;

