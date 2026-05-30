import React from "react";

const ReplyEditBanner = ({ replyingTo, editingMessage, onCancelReply }) => {
  if (!replyingTo && !editingMessage) return null;

  return (
    <>
      {replyingTo && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-[var(--bg-input)]/60 border-l-[3px] border-[var(--whatsapp-green)] rounded-xl text-xs mb-2.5">
          <div className="flex flex-col min-w-0 pr-4">
            <span className="text-[var(--whatsapp-green)] font-semibold text-[11px] truncate">
              {replyingTo.senderUsername || "You"}
            </span>
            <span className="truncate text-[var(--text-primary)]">{replyingTo.text || "[Media]"}</span>
          </div>
          <button
            className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer border-0 bg-transparent shrink-0"
            onClick={onCancelReply}
            type="button"
          >
            ✕
          </button>
        </div>
      )}
      {editingMessage && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-[var(--bg-input)]/60 border-l-[3px] border-[var(--whatsapp-green)] rounded-xl text-xs mb-2.5">
          <div className="flex flex-col min-w-0 pr-4">
            <span className="text-[var(--whatsapp-green)] font-semibold text-[11px]">Editing message</span>
            <span className="truncate text-[var(--text-primary)]">{editingMessage.text}</span>
          </div>
          <button
            className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer border-0 bg-transparent shrink-0"
            onClick={onCancelReply}
            type="button"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
};

export default ReplyEditBanner;
