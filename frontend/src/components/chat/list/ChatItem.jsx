import React, { useState, useRef, useEffect } from "react";
import userService from "../../../services/userService";

const API_BASE = "http://localhost:5000";

const ChatItem = ({
  user,
  meta,
  isSelected,
  onClick,
  selectMode,
  isSelectedInMap,
  onSelectToggle,
  toDisplayName,
  currentUser,
  refreshUserData,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  let displayName = toDisplayName(user);
  if (currentUser && user.userId === currentUser.userId) displayName += " (You)";
  const avatarChar = displayName.charAt(0).toUpperCase() || "?";

  // Fix: use createdAt with fallback to timestamp
  const lastMsg = meta?.lastMessage;
  const lastText = lastMsg
    ? lastMsg.isDeleted
      ? "🚫 This message was deleted"
      : lastMsg.text ||
        (lastMsg.messageType === "image"
          ? "📷 Photo"
          : lastMsg.messageType === "video"
          ? "🎥 Video"
          : lastMsg.messageType === "audio"
          ? "🎤 Voice message"
          : lastMsg.messageType === "document"
          ? "📄 Document"
          : "Message")
    : user.status || "Tap to chat";

  const lastTimeRaw = lastMsg ? lastMsg.createdAt || lastMsg.timestamp : null;
  const lastTime = lastTimeRaw ? formatTime(new Date(lastTimeRaw)) : "";

  function formatTime(date) {
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" });
  }

  const profilePicUrl = user.profilePicture
    ? user.profilePicture.startsWith("http")
      ? user.profilePicture
      : `${API_BASE}${user.profilePicture}`
    : null;

  const isArchived = currentUser?.archivedChats?.includes(user.userId);
  const isFavorite = currentUser?.favoriteUsers?.includes(user.userId);
  const isBlocked = currentUser?.blockedUsers?.includes(user.userId);
  const isLocked = currentUser?.lockedChats?.includes(user.userId);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const menuActions = [
    {
      label: isArchived ? "Unarchive" : "Archive",
      icon: "📥",
      action: async () => {
        if (isArchived) await userService.unarchiveChat(user.userId);
        else await userService.archiveChat(user.userId);
        if (refreshUserData) await refreshUserData();
      },
    },
    {
      label: isFavorite ? "Unfavorite" : "Favorite",
      icon: isFavorite ? "⭐" : "☆",
      action: async () => {
        await userService.favoriteChat(user.userId);
        if (refreshUserData) await refreshUserData();
      },
    },
    {
      label: isBlocked ? "Unblock" : "Block",
      icon: "🚫",
      action: async () => {
        if (isBlocked) await userService.unblockChat(user.userId);
        else await userService.blockChat(user.userId);
        if (refreshUserData) await refreshUserData();
      },
    },
    {
      label: isLocked ? "Unlock" : "Lock",
      icon: "🔒",
      action: async () => {
        if (isLocked) {
          await userService.unlockChat(user.userId);
        } else {
          if (!currentUser.hasPin) {
            alert("Please set a PIN in Settings › Privacy & Security first.");
            return;
          }
          await userService.lockChat(user.userId);
        }
        if (refreshUserData) await refreshUserData();
      },
    },
  ];

  // Status tick for last sent message
  const renderLastMsgTick = () => {
    if (!lastMsg || lastMsg.senderId !== currentUser?.userId) return null;
    if (lastMsg.status === "seen") {
      return (
        <svg viewBox="0 0 16 15" width="14" height="13" className="fill-[#53bdeb] shrink-0">
          <path d="M15 3.3L8.5 9.8 5.7 7l-1.4 1.4 4.2 4.2 8-8z" />
          <path d="M11 3.3L4.5 9.8 1.7 7l-1.4 1.4 4.2 4.2 8-8z" opacity="0.7" />
        </svg>
      );
    }
    if (lastMsg.status === "delivered") {
      return (
        <svg viewBox="0 0 16 15" width="14" height="13" className="fill-[var(--text-muted)] shrink-0">
          <path d="M15 3.3L8.5 9.8 5.7 7l-1.4 1.4 4.2 4.2 8-8z" />
          <path d="M11 3.3L4.5 9.8 1.7 7l-1.4 1.4 4.2 4.2 8-8z" opacity="0.7" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 16 15" width="14" height="13" className="fill-[var(--text-muted)] shrink-0">
        <path d="M15 3.3L8.5 9.8 5.7 7l-1.4 1.4 4.2 4.2 8-8z" />
      </svg>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-3 px-3.5 py-3 mx-2.5 my-1.5 cursor-pointer select-none transition-all duration-300 rounded-xl relative border ${
        isSelected
          ? "bg-[var(--bg-active)] border-[var(--whatsapp-green)]/20 shadow-[0_4px_12px_rgba(0,217,166,0.06)]"
          : "bg-transparent border-transparent hover:bg-[var(--chat-item-hover)] hover:border-[var(--border-light)]"
      }`}
    >
      {selectMode && (
        <input
          type="checkbox"
          className="mr-2.5 w-4.5 h-4.5 accent-[var(--whatsapp-green)] cursor-pointer"
          checked={isSelectedInMap}
          readOnly
        />
      )}

      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-[48px] h-[48px] rounded-full overflow-hidden flex items-center justify-center font-semibold text-white text-base bg-gradient-to-tr from-[var(--avatar-bg)] to-[var(--text-muted)] relative shadow-sm">
          <span>{avatarChar}</span>
          {profilePicUrl && (
            <img
              src={profilePicUrl}
              alt={displayName}
              className="w-full h-full object-cover absolute inset-0 transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}
        </div>
        {user.isOnline && !user.isGroup && (
          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-[#00d9a6] border-2 border-[var(--bg-sidebar)] rounded-full shadow-sm" />
        )}
        {isFavorite && (
          <span className="absolute -top-0.5 -right-0.5 text-[10px] drop-shadow-md">⭐</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 py-0.5">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[14px] font-semibold text-[var(--text-primary)] truncate mr-2 flex items-center gap-1.5">
            {isBlocked && <span className="text-[11px] text-[var(--text-muted)]">🚫</span>}
            {displayName}
          </span>
          <span
            className={`text-[11px] font-medium shrink-0 ${
              meta?.unreadCount > 0 ? "text-[var(--whatsapp-green)] font-semibold" : "text-[var(--text-secondary)]"
            }`}
          >
            {lastTime}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-[12.5px] text-[var(--text-secondary)] truncate flex-1 pr-2 leading-tight flex items-center gap-1">
            {renderLastMsgTick()}
            {user.isTyping ? (
              <span className="text-[var(--whatsapp-green)] font-medium">typing...</span>
            ) : (
              <span className="truncate">{lastText}</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {meta?.unreadCount > 0 && (
              <span className="bg-[var(--whatsapp-green)] text-white text-[10px] font-extrabold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 shadow-[0_2px_8px_rgba(0,217,166,0.3)]">
                {meta.unreadCount > 99 ? "99+" : meta.unreadCount}
              </span>
            )}
            {/* Dropdown trigger */}
            <div
              ref={menuRef}
              className="relative w-5 h-5 rounded-full hover:bg-[var(--bg-hover)] flex items-center justify-center cursor-pointer text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
            >
              <svg viewBox="0 0 19 20" width="13" height="13" fill="currentColor">
                <path d="M3.8 6.7l5.7 5.7 5.7-5.7 1.6 1.6-7.3 7.2-7.3-7.2 1.6-1.6z" />
              </svg>
              {menuOpen && (
                <div
                  className="absolute top-full right-0 bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-light)] rounded-xl p-1 min-w-[155px] flex flex-col shadow-2xl z-[1001]"
                  style={{ animation: "slideDown 0.15s ease" }}
                >
                  {menuActions.map((a, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-3 py-2.5 text-[12.5px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition cursor-pointer flex items-center gap-2.5 border-0 bg-transparent"
                      onClick={async (e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        await a.action();
                      }}
                    >
                      <span className="text-[13px]">{a.icon}</span>
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
