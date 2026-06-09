import React from "react";

const ChatPinnedBanner = ({ pinnedMessage, showPinned, onDismiss }) => {
  if (!pinnedMessage || !showPinned) return null;

  const handleBannerClick = () => {
    const el = document.querySelector(`[data-message-id="${pinnedMessage._id}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-sidebar-alt)] border-b border-[var(--border-light)] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors select-none"
      onClick={handleBannerClick}
    >
      <div className="w-0.5 h-8 bg-[var(--whatsapp-green)] rounded-full shrink-0 animate-pulse" />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] font-bold text-[var(--whatsapp-green)] tracking-wider uppercase">Starred message</span>
        <span className="text-[12.5px] text-[var(--text-secondary)] truncate mt-0.5 text-left">
          {pinnedMessage.text || "[Media]"}
        </span>
      </div>
      <button
        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm leading-none border-0 bg-transparent cursor-pointer shrink-0 p-1.5 ml-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors"
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        title="Dismiss"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

export default ChatPinnedBanner;
