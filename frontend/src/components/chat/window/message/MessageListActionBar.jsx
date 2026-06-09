import React from "react";

const MessageListActionBar = ({
  selectMode,
  selectedIds,
  onCancel,
  handleBulkForward,
  handleBulkDeleteForMe
}) => {
  if (!selectMode) return null;

  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-sidebar-alt)] border-b border-[var(--border-light)] z-10 shrink-0"
      style={{ animation: "slideDown 0.2s ease" }}
    >
      <div className="flex items-center gap-3">
        <button
          className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer border-0 bg-transparent"
          onClick={onCancel}
        >
          ✕ Cancel
        </button>
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {selectedIds.size} selected
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={selectedIds.size === 0}
          className="px-3 py-1.5 text-xs font-semibold text-[var(--whatsapp-green)] border border-[var(--whatsapp-green)]/40 rounded-full hover:bg-[var(--whatsapp-green)]/10 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-transparent"
          onClick={handleBulkForward}
        >
          Forward
        </button>
        <button
          disabled={selectedIds.size === 0}
          className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-500/40 rounded-full hover:bg-red-500/10 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-transparent"
          onClick={handleBulkDeleteForMe}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default MessageListActionBar;
