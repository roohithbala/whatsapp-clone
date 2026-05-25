import React, { useState, useRef, useCallback } from "react";
import MessageItem from "./MessageItem";
import MessageDateSeparator from "./MessageDateSeparator";
import api from "../../../services/api";
import socket from "../../../socket";

const MessageList = ({
  messages,
  messageSearchTerm,
  currentUser,
  selectedUser,
  setReplyingTo,
  setEditingMessage,
  setForwardingMessage,
  setInfoMessage,
  isChannel,
  isGroup,
  setMessages,
  messagesContainerRef,
  handleScroll,
  showScrollButton,
  scrollToBottom,
}) => {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const messageRefs = useRef({});

  const filteredMessages = messages.filter(
    (m) =>
      !messageSearchTerm ||
      (m.text && m.text.toLowerCase().includes(messageSearchTerm.toLowerCase()))
  );

  // Inject date separators
  const renderItems = () => {
    const items = [];
    let lastDate = null;

    filteredMessages.forEach((m, idx) => {
      const msgDate = new Date(m.createdAt || m.timestamp);
      const dateStr = msgDate.toDateString();

      if (dateStr !== lastDate) {
        items.push(
          <MessageDateSeparator key={`sep-${dateStr}-${idx}`} date={msgDate} />
        );
        lastDate = dateStr;
      }

      items.push(
        <MessageItem
          key={m._id || m.timestamp || idx}
          message={m}
          currentUser={currentUser}
          selectedUser={selectedUser}
          onReply={(msg) => { setReplyingTo(msg); setEditingMessage(null); }}
          onEdit={setEditingMessage}
          onForward={setForwardingMessage}
          onShowInfo={setInfoMessage}
          isChannel={isChannel}
          isGroup={isGroup}
          onReactionUpdate={(msgId, newReactions) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === msgId ? { ...msg, reactions: newReactions } : msg
              )
            );
          }}
          searchTerm={messageSearchTerm}
          onDeleteLocal={(msgId, isForEveryone) => {
            if (isForEveryone) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg._id === msgId
                    ? { ...msg, isDeleted: true, text: "This message was deleted", mediaUrl: null }
                    : msg
                )
              );
            } else {
              setMessages((prev) => prev.filter((msg) => msg._id !== msgId));
            }
          }}
          selectMode={selectMode}
          isSelectedInSelectMode={selectedIds.has(m._id)}
          onToggleSelect={(id) => {
            setSelectedIds((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            });
          }}
          messageRef={(el) => { if (el && m._id) messageRefs.current[m._id] = el; }}
        />
      );
    });

    return items;
  };

  // Bulk delete for me
  const handleBulkDeleteForMe = useCallback(async () => {
    const ids = [...selectedIds];
    try {
      await Promise.all(ids.map(id => api.post(`/messages/delete-for-me/${id}`)));
      setMessages(prev => prev.filter(m => !ids.includes(m._id)));
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch (err) {
      console.error("Bulk delete failed:", err);
    }
  }, [selectedIds, setMessages]);

  // Bulk forward
  const handleBulkForward = useCallback(() => {
    const ids = [...selectedIds];
    if (ids.length === 1) {
      const msg = messages.find(m => m._id === ids[0]);
      if (msg) setForwardingMessage(msg);
    }
    setSelectMode(false);
    setSelectedIds(new Set());
  }, [selectedIds, messages, setForwardingMessage]);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Multi-select action bar */}
      {selectMode && (
        <div
          className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-sidebar-alt)] border-b border-[var(--border-light)] z-10 shrink-0"
          style={{ animation: "slideDown 0.2s ease" }}
        >
          <div className="flex items-center gap-3">
            <button
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer border-0 bg-transparent"
              onClick={() => { setSelectMode(false); setSelectedIds(new Set()); }}
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
      )}

      {/* Messages scrollable area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1 bg-[var(--bg-chat)] relative"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M400 200 C400 310.457 310.457 400 200 400 89.543 400 0 310.457 0 200 0 89.543 89.543 0 200 0 310.457 0 400 89.543 400 200z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        ref={messagesContainerRef}
        onScroll={handleScroll}
        onContextMenu={(e) => {
          // Long press / right-click enters select mode
          if (!selectMode) {
            e.preventDefault();
            setSelectMode(true);
          }
        }}
      >
        {filteredMessages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-sm py-12 select-none">
            {messageSearchTerm ? "No messages match your search" : "No messages yet. Say hello! 👋"}
          </div>
        )}

        {renderItems()}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-[var(--bg-panel)] text-[var(--text-secondary)] border border-[var(--border-light)] shadow-xl flex items-center justify-center cursor-pointer hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all duration-200 z-50"
          onClick={scrollToBottom}
          title="Scroll to bottom"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MessageList;
