import React, { useState } from "react";
import userService from "../../../../services/userService";

const API_BASE = "http://localhost:5000";

const ContactInfoPanel = ({ user, onClose, currentUser }) => {
  const [isBlocked, setIsBlocked] = useState(
    currentUser?.blockedUsers?.includes(user.userId),
  );
  const [isFavorite, setIsFavorite] = useState(
    currentUser?.favoriteUsers?.includes(user.userId),
  );
  const [isArchived, setIsArchived] = useState(
    currentUser?.archivedChats?.includes(user.userId),
  );
  const [isLocked, setIsLocked] = useState(
    currentUser?.lockedChats?.includes(user.userId),
  );

  if (!user) return null;

  const handleBlock = async () => {
    try {
      if (isBlocked) await userService.unblockChat(user.userId);
      else await userService.blockChat(user.userId);
      setIsBlocked(!isBlocked);
    } catch (e) {
      alert("Action failed");
    }
  };

  const handleFavorite = async () => {
    try {
      await userService.favoriteChat(user.userId);
      setIsFavorite(!isFavorite);
    } catch (e) {
      alert("Action failed");
    }
  };

  const handleArchive = async () => {
    try {
      if (isArchived) await userService.unarchiveChat(user.userId);
      else await userService.archiveChat(user.userId);
      setIsArchived(!isArchived);
    } catch (e) {
      alert("Action failed");
    }
  };

  const handleLock = async () => {
    try {
      if (isLocked) await userService.unlockChat(user.userId);
      else await userService.lockChat(user.userId);
      setIsLocked(!isLocked);
    } catch (e) {
      alert("Action failed");
    }
  };

  return (
    <div className="w-[340px] h-full flex flex-col bg-[var(--bg-sidebar)] border-l border-[var(--border-light)] flex-shrink-0 animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-[var(--border-light)] flex items-center gap-3 bg-[var(--bg-sidebar-alt)] shrink-0">
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors border-0 bg-transparent shrink-0"
          onClick={onClose}
          title="Close"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          Contact info
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-8">
        {/* User Card */}
        <div className="flex flex-col items-center justify-center p-6 bg-[var(--bg-sidebar)] border-b border-[var(--border-light)] gap-4">
          <div className="w-24 h-24 rounded-full bg-[var(--whatsapp-green)] flex items-center justify-center font-bold text-3xl text-white shadow-md overflow-hidden relative select-none">
            {user.profilePicture ? (
              <img
                src={
                  user.profilePicture.startsWith("http")
                    ? user.profilePicture
                    : `${API_BASE}${user.profilePicture}`
                }
                className="w-full h-full object-cover"
                alt={user.username}
              />
            ) : (
              user.username?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {user.username}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {user.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* About Info */}
        <div className="p-4 bg-[var(--bg-sidebar)] border-b border-[var(--border-light)] flex flex-col gap-2 text-left">
          <h4 className="text-xs font-bold text-[var(--whatsapp-green)] tracking-wider uppercase">
            About
          </h4>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            {user.status || "Hey there! I am using WhatsApp."}
          </p>
        </div>

        {/* Chat Control Settings */}
        <div className="bg-[var(--bg-sidebar)] border-b border-[var(--border-light)] py-1.5 flex flex-col">
          <div
            className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--bg-hover)] transition duration-200 cursor-pointer text-left"
            onClick={handleFavorite}
          >
            <div className="text-lg w-8 text-center text-[var(--text-secondary)]">
              ⭐
            </div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </div>
          </div>
          <div
            className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--bg-hover)] transition duration-200 cursor-pointer text-left"
            onClick={handleArchive}
          >
            <div className="text-lg w-8 text-center text-[var(--text-secondary)]">
              📥
            </div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              {isArchived ? "Unarchive Chat" : "Archive Chat"}
            </div>
          </div>
          <div
            className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--bg-hover)] transition duration-200 cursor-pointer text-left"
            onClick={handleLock}
          >
            <div className="text-lg w-8 text-center text-[var(--text-secondary)]">
              🔒
            </div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              {isLocked ? "Unlock Chat" : "Lock Chat"}
            </div>
          </div>
        </div>

        {/* Safety Actions */}
        <div className="bg-[var(--bg-sidebar)] py-1.5 flex flex-col">
          <div
            className="flex items-center gap-4 px-4 py-3 hover:bg-red-500/10 transition duration-200 cursor-pointer text-left text-red-500"
            onClick={handleBlock}
          >
            <div className="text-lg w-8 text-center">🚫</div>
            <div className="text-sm font-bold">
              {isBlocked ? "Unblock User" : "Block User"}
            </div>
          </div>
          <div
            className="flex items-center gap-4 px-4 py-3 hover:bg-red-500/10 transition duration-200 cursor-pointer text-left text-red-500"
            onClick={async () => {
              const reason = prompt(
                `Enter reason to report ${user.username || "user"}:`,
              );
              if (!reason) return;
              try {
                const res = await userService.reportUser(user.userId, reason);
                alert(res.message || "User reported successfully!");
              } catch (e) {
                alert(
                  e.response?.data?.error ||
                    e.message ||
                    "Failed to report user",
                );
              }
            }}
          >
            <div className="text-lg w-8 text-center">🚩</div>
            <div className="text-sm font-bold">Report User</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoPanel;
