import React from "react";

const API_BASE = "http://localhost:5000";

const CallHistoryItem = ({
  call,
  currentUser,
  users,
  formatCallTime,
  formatDuration,
  onStartCall
}) => {
  const isOutgoing = call.callerId === currentUser.userId;
  const otherUserId = isOutgoing ? call.receiverId : call.callerId;
  const otherUsername = isOutgoing ? call.receiverUsername : call.callerUsername;
  const otherUser = users?.find((u) => u.userId === otherUserId);
  const profilePicUrl = otherUser?.profilePicture
    ? otherUser.profilePicture.startsWith("http")
      ? otherUser.profilePicture
      : `${API_BASE}${otherUser.profilePicture}`
    : null;
  const isMissed = !isOutgoing && call.status === "missed";
  const avatarChar = (otherUsername || "?").charAt(0).toUpperCase();

  const handleCallClick = () => {
    if (onStartCall) {
      const fallbackUser = {
        userId: otherUserId,
        username: otherUsername || otherUserId
      };
      onStartCall(call.type || "audio", otherUser || fallbackUser);
    }
  };

  return (
    <div
      className="flex items-center gap-3.5 px-4 py-3 cursor-pointer select-none transition-all duration-200 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)]"
    >
      <div className="w-[49px] h-[49px] rounded-full overflow-hidden bg-[var(--avatar-bg)] flex items-center justify-center font-medium text-white text-lg shrink-0 relative">
        <span>{avatarChar}</span>
        {profilePicUrl && (
          <img src={profilePicUrl} alt={otherUsername} className="w-full h-full object-cover absolute inset-0" onError={e => { e.target.style.display = "none"; }} />
        )}
      </div>

      <div className="flex-1 text-left min-w-0">
        <div
          className="text-[15px] font-medium truncate"
          style={{ color: isMissed ? "#ef4444" : "var(--text-primary)" }}
        >
          {otherUsername || otherUserId}
        </div>
        <div className="text-[12px] text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5">
          {isOutgoing ? (
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--whatsapp-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={isMissed ? "#ef4444" : "var(--whatsapp-green)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <line x1="17" y1="7" x2="7" y2="17" />
              <polyline points="7 7 7 17 17 17" />
            </svg>
          )}
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="shrink-0 opacity-60">
            {call.type === "video" ? (
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            ) : (
              <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.1-.03-.21-.05-.31-.05-.26 0-.51.1-.71.29l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
            )}
          </svg>
          <span>
            {isMissed ? "Missed · " : ""}
            {formatCallTime(call.createdAt)}
            {call.duration > 0 && ` · ${formatDuration(call.duration)}`}
          </span>
        </div>
      </div>

      <button
        className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--whatsapp-green)] hover:bg-[var(--bg-hover)] shrink-0 transition border-0 bg-transparent cursor-pointer"
        title={`${call.type === "video" ? "Video" : "Voice"} call`}
        onClick={handleCallClick}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {call.type === "video" ? (
            <path d="M23 7l-7 5 7 5V7z M1 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5z" />
          ) : (
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.27 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          )}
        </svg>
      </button>
    </div>
  );
};

export default CallHistoryItem;
