import React from "react";

/**
 * In-app delete confirmation modal — replaces window.confirm()
 */
const DeleteConfirmModal = ({ message, canDeleteForEveryone, onDeleteForMe, onDeleteForEveryone, onCancel }) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[5000] flex items-end sm:items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-[var(--bg-sidebar)] border border-[var(--border-light)] rounded-2xl w-full max-w-[360px] shadow-2xl overflow-hidden"
        style={{ animation: "modalSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">Delete message?</h3>
          <p className="text-[13px] text-[var(--text-secondary)]">
            {canDeleteForEveryone
              ? "Choose who to delete this message for."
              : "You can only delete this message for yourself."}
          </p>
        </div>
        <div className="flex flex-col border-t border-[var(--border-light)]">
          {canDeleteForEveryone && !message?.isDeleted && (
            <button
              className="w-full px-5 py-3.5 text-left text-[14px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition cursor-pointer border-0 bg-transparent border-b border-[var(--border-light)]"
              onClick={onDeleteForEveryone}
            >
              Delete for everyone
            </button>
          )}
          <button
            className="w-full px-5 py-3.5 text-left text-[14px] font-medium text-red-500 hover:bg-red-500/10 transition cursor-pointer border-0 bg-transparent border-b border-[var(--border-light)]"
            onClick={onDeleteForMe}
          >
            Delete for me
          </button>
          <button
            className="w-full px-5 py-3.5 text-left text-[14px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition cursor-pointer border-0 bg-transparent"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
