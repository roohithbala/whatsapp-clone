import React from "react";

const ChatHeaderDropdown = ({
  showMoreMenu,
  moreMenuItems,
  onClose
}) => {
  if (!showMoreMenu) return null;

  return (
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
            onClick={() => { item.onClick(); onClose(); }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default ChatHeaderDropdown;
