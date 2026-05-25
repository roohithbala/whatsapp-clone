import React from "react";

const MessageMenu = ({
  isOpen,
  menuRef,
  isSent,
  isStarred,
  message,
  onReply,
  onShowInfo,
  handleCopy,
  onForward,
  handleStar,
  onEdit,
  onDelete,
  onClose,
  alignRight = true,
}) => {
  if (!isOpen) return null;

  const items = [
    {
      label: "Reply",
      onClick: onReply,
      always: true,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75">
          <path d="M9 14L4 9l5-5"/>
          <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
        </svg>
      )
    },
    {
      label: "Info",
      onClick: onShowInfo,
      show: isSent,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      )
    },
    {
      label: "Copy",
      onClick: handleCopy,
      show: !!message.text && !message.isDeleted,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      )
    },
    {
      label: "Forward",
      onClick: onForward,
      show: !message.isDeleted,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75">
          <path d="M15 10l5 5-5 5"/>
          <path d="M4 4v7a4 4 0 0 0 4 4h12"/>
        </svg>
      )
    },
    {
      label: isStarred ? "Unstar" : "Star",
      onClick: handleStar,
      always: true,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isStarred ? "text-yellow-500 fill-yellow-500" : "opacity-75"}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      )
    },
    {
      label: "Edit",
      onClick: onEdit,
      show: isSent && !message.isDeleted,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/>
        </svg>
      )
    },
    {
      label: "Delete",
      onClick: onDelete,
      always: true,
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
  ];

  const visibleItems = items.filter(item => item.always || item.show);

  return (
    <div
      className={`absolute top-full ${alignRight ? "right-0" : "left-0"} bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border-light)] rounded-2xl p-1.5 min-w-[170px] flex flex-col shadow-2xl z-[1001] mt-1`}
      style={{ animation: "slideDown 0.15s ease" }}
      ref={menuRef}
    >
      {visibleItems.map((item, i) => (
        <React.Fragment key={i}>
          {item.danger && <div className="h-px bg-[var(--border-light)] my-1" />}
          <button
            className={`w-full flex items-center gap-3 text-left px-3 py-2 text-[13px] border-0 bg-transparent cursor-pointer rounded-xl transition-all duration-150 font-medium ${
              item.danger
                ? "text-red-500 hover:bg-red-500/10"
                : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              item.onClick?.();
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default MessageMenu;
