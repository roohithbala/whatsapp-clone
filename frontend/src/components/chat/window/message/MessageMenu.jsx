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
  onTranslate,
}) => {
  if (!isOpen) return null;

  const items = [
    {
      label: "Reply",
      onClick: onReply,
      always: true,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200 shrink-0">
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
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200 shrink-0">
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
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200 shrink-0">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      )
    },
    {
      label: "Translate",
      onClick: onTranslate,
      show: !!message.text && !message.isDeleted,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200 shrink-0">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      )
    },
    {
      label: "Forward",
      onClick: onForward,
      show: !message.isDeleted,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200 shrink-0">
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
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`group-hover:scale-110 transition-all duration-200 shrink-0 ${isStarred ? "text-yellow-500 fill-yellow-500 opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      )
    },
    {
      label: "Edit",
      onClick: onEdit,
      show: isSent && !message.isDeleted,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200 shrink-0">
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
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500/80 group-hover:text-red-500 group-hover:scale-110 transition-all duration-200 shrink-0">
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
      className={`absolute top-full ${alignRight ? "right-0" : "left-0"} bg-[var(--glass-bg)] backdrop-blur-[24px] border border-[var(--border-strong)]/20 rounded-[20px] p-2 min-w-[180px] flex flex-col shadow-[var(--glass-shadow)] shadow-2xl z-[1001] mt-1.5 animate-dropdown-appear`}
      ref={menuRef}
    >
      {visibleItems.map((item, i) => (
        <React.Fragment key={i}>
          {item.danger && <div className="h-px bg-[var(--border-strong)]/20 my-1.5 mx-1" />}
          <button
            className={`group w-full flex items-center gap-3.5 text-left px-3.5 py-2.5 text-[13.5px] border-0 bg-transparent cursor-pointer rounded-xl transition-all duration-200 font-semibold select-none ${
              item.danger
                ? "text-red-500 hover:bg-red-500/10"
                : "text-[var(--text-primary)] hover:bg-[var(--whatsapp-green)]/10 hover:text-[var(--whatsapp-green)]"
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
