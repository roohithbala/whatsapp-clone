import React, { useState, useEffect, useRef } from "react";
import api from "../../../services/api";

const API_BASE = "http://localhost:5000";

const ChatHeader = ({
  selectedUser,
  isPeerTyping,
  groupTypingUsers = {},
  onToggleSearch,
  onMoreClick,
  onStartCall,
  isChannel,
  isGroup,
  messages = [],
  onBack,
  currentUser,
  onDisappearingMessagesClick,
  disappearingDuration = "off",
}) => {
  const avatarChar = selectedUser?.username?.charAt(0)?.toUpperCase() || "?";
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [showPinned, setShowPinned] = useState(true);
  const moreMenuRef = useRef(null);

  const profilePicUrl = selectedUser?.profilePicture || selectedUser?.avatarUrl
    ? (selectedUser.profilePicture || selectedUser.avatarUrl).startsWith("http")
      ? selectedUser.profilePicture || selectedUser.avatarUrl
      : `${API_BASE}${selectedUser.profilePicture || selectedUser.avatarUrl}`
    : null;

  // Find the most recent starred/pinned message to show in banner
  useEffect(() => {
    if (messages && messages.length > 0) {
      const starred = messages.find(m => m.starredBy?.includes(currentUser?.userId) && !m.isDeleted);
      setPinnedMessage(starred || null);
    }
  }, [messages, currentUser?.userId]);

  // Close more menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getGroupTypingString = () => {
    if (!groupTypingUsers) return "";
    const activeTyping = Object.values(groupTypingUsers).filter(Boolean);
    if (activeTyping.length === 0) return "";
    if (activeTyping.length === 1) return `${activeTyping[0]} is typing...`;
    if (activeTyping.length === 2) return `${activeTyping[0]} and ${activeTyping[1]} are typing...`;
    return "Several people are typing...";
  };

  const groupTypingString = getGroupTypingString();

  const getSubtitle = () => {
    if (isPeerTyping) {
      return (
        <span className="flex items-center gap-1 text-[var(--whatsapp-green)]">
          typing
          <span className="flex gap-0.5 ml-0.5">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1 h-1 rounded-full bg-[var(--whatsapp-green)] typing-dot"
                style={{ animationDelay: `${-0.32 + i * 0.16}s` }}
              />
            ))}
          </span>
        </span>
      );
    }
    if (isChannel) {
      return `${selectedUser?.followers?.length || 0} follower${selectedUser?.followers?.length === 1 ? "" : "s"}`;
    }
    if (isGroup) {
      return groupTypingString
        ? <span className="text-[var(--whatsapp-green)]">{groupTypingString}</span>
        : `${selectedUser?.members?.length || 0} participants`;
    }
    if (selectedUser?.isOnline) {
      return <span className="text-[var(--whatsapp-green)]">online</span>;
    }
    if (selectedUser?.updatedAt) {
      return `last seen ${new Date(selectedUser.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return "offline";
  };

  const ActionButton = ({ onClick, title, children }) => (
    <button
      className="w-10 h-10 rounded-full bg-transparent border-0 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer transition-all duration-200"
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );

  const moreMenuItems = [
    { 
      label: "Search messages", 
      onClick: onToggleSearch,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      )
    },
    !isChannel && { 
      label: "Mute notifications", 
      onClick: () => {},
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75">
          <path d="M11 5L6 9H2v6h4l5 4V5z"/>
          <path d="M23 9l-6 6"/>
          <path d="M17 9l6 6"/>
        </svg>
      )
    },
    { 
      label: isGroup || isChannel ? "Group/Channel info" : "Contact info", 
      onClick: onMoreClick,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      )
    },
    !isChannel && { 
      label: "Disappearing messages", 
      onClick: onDisappearingMessagesClick,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      )
    },
    !isGroup && !isChannel && { 
      label: "Clear messages", 
      onClick: async () => {
        if (window.confirm("Clear all messages? This cannot be undone.")) {
          // Could be implemented later
        }
      },
      danger: true,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      )
    },
  ].filter(Boolean);

  return (
    <div className="flex flex-col shrink-0">
      {/* Main header */}
      <header className="h-[64px] px-4 bg-[var(--glass-bg)] backdrop-blur-[24px] flex items-center justify-between border-b border-[var(--border-light)] z-10 select-none">
        <div
          className="flex items-center gap-3.5 cursor-pointer rounded-xl hover:bg-[var(--bg-hover)] py-1 px-2 -ml-1 transition flex-1 min-w-0"
          onClick={onMoreClick}
        >
          {onBack && (
            <button
              className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition shrink-0 border-0 bg-transparent"
              onClick={(e) => { e.stopPropagation(); onBack(); }}
              type="button"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
          )}

          {/* Avatar */}
          <div className="w-[42px] h-[42px] rounded-full overflow-hidden flex items-center justify-center font-semibold text-white text-base bg-gradient-to-tr from-[var(--avatar-bg)] to-[var(--text-muted)] relative shrink-0 shadow-sm">
            <span>{avatarChar}</span>
            {profilePicUrl && (
              <img
                src={profilePicUrl}
                alt={selectedUser?.username}
                className="w-full h-full object-cover absolute inset-0"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}
            {selectedUser?.isOnline && !isGroup && !isChannel && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00d9a6] border-2 border-[var(--bg-sidebar)] rounded-full animate-pulse" />
            )}
          </div>

          {/* Name + status */}
          <div className="flex flex-col min-w-0">
            <span className="text-[15.5px] font-bold text-[var(--text-primary)] tracking-tight truncate leading-tight flex items-center gap-1.5">
              {selectedUser?.username}
              {disappearingDuration !== "off" && (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--whatsapp-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" title={`Disappearing messages: ${disappearingDuration}`}>
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              )}
            </span>
            <span className="text-[12px] font-medium text-[var(--text-secondary)] truncate leading-tight mt-0.5">
              {getSubtitle()}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {!isChannel && (
            <>
              <ActionButton onClick={() => onStartCall("video")} title="Video call">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </ActionButton>
              <ActionButton onClick={() => onStartCall("audio")} title="Voice call">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.27 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </ActionButton>
            </>
          )}
          <ActionButton onClick={onToggleSearch} title="Search messages">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </ActionButton>

          {/* More options menu */}
          <div className="relative" ref={moreMenuRef}>
            <ActionButton
              onClick={() => setShowMoreMenu(prev => !prev)}
              title="More options"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </ActionButton>
            {showMoreMenu && (
              <div
                className="absolute top-full right-0 mt-2 bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border-light)] rounded-2xl p-1.5 min-w-[200px] flex flex-col shadow-2xl z-[1002]"
                style={{ animation: "slideDown 0.15s ease" }}
              >
                {moreMenuItems.map((item, i) => (
                  <React.Fragment key={i}>
                    {item.danger && <div className="h-px bg-[var(--border-light)] my-1" />}
                    <button
                      className={`w-full flex items-center gap-3 text-left px-3 py-2 text-[13px] font-medium border-0 bg-transparent cursor-pointer rounded-xl transition-all duration-150 ${
                        item.danger
                          ? "text-red-500 hover:bg-red-500/10"
                          : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                      }`}
                      onClick={() => { item.onClick(); setShowMoreMenu(false); }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Pinned message banner */}
      {pinnedMessage && showPinned && (
        <div
          className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-sidebar-alt)] border-b border-[var(--border-light)] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors select-none"
          onClick={() => {
            const el = document.querySelector(`[data-message-id="${pinnedMessage._id}"]`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        >
          <div className="w-0.5 h-8 bg-[var(--whatsapp-green)] rounded-full shrink-0 animate-pulse" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] font-bold text-[var(--whatsapp-green)] tracking-wider uppercase">Starred message</span>
            <span className="text-[12.5px] text-[var(--text-secondary)] truncate mt-0.5">
              {pinnedMessage.text || "[Media]"}
            </span>
          </div>
          <button
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm leading-none border-0 bg-transparent cursor-pointer shrink-0 p-1 hover:bg-[var(--bg-hover)] rounded-full transition-colors"
            onClick={(e) => { e.stopPropagation(); setShowPinned(false); }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
