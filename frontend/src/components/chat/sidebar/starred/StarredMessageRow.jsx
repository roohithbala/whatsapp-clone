import React from "react";

const StarredMessageRow = ({
  msg,
  isNavigating,
  chatName,
  preview,
  avatarLetter,
  picUrl,
  handleGoToMessage,
  handleUnstar
}) => {
  return (
    <div
      className={`group flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all duration-200 relative select-none ${
        isNavigating
          ? "bg-[var(--whatsapp-green)]/10"
          : "hover:bg-[var(--bg-hover)]"
      }`}
      onClick={() => handleGoToMessage(msg)}
      title="Click to go to this message"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--whatsapp-green)] to-[var(--whatsapp-teal)] flex items-center justify-center font-bold text-sm text-white shrink-0 overflow-hidden shadow-sm">
        {picUrl ? (
          <img src={picUrl} alt={chatName} className="w-full h-full object-cover" onError={e => { e.target.style.display = "none"; }} />
        ) : (
          avatarLetter
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-[13.5px] font-semibold text-[var(--text-primary)] truncate text-left">
            {chatName}
          </span>
          <span className="text-[11px] text-[var(--text-muted)] shrink-0">
            {new Date(msg.createdAt).toLocaleDateString([], { day: "numeric", month: "short", year: "2-digit" })}
          </span>
        </div>
        <div className="text-[12.5px] text-[var(--text-secondary)] line-clamp-2 leading-snug text-left">
          {preview}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 self-center">
        {isNavigating ? (
          <div className="w-4 h-4 border-2 border-[var(--whatsapp-green)] border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full text-[var(--whatsapp-green)]">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
            <button
              onClick={(e) => handleUnstar(msg._id, e)}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-none text-yellow-500 hover:text-[var(--text-muted)] cursor-pointer p-1 rounded-full hover:bg-[var(--bg-hover)] flex items-center justify-center"
              title="Unstar message"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StarredMessageRow;
