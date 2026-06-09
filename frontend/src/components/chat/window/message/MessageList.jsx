import React, { useState, useRef, useCallback } from "react";
import MessageItem from "./MessageItem";
import MessageDateSeparator from "./MessageDateSeparator";
import MessageListActionBar from "./MessageListActionBar";
import api from "../../../../services/api";

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
  onMessageSent,
  onViewStory,
}) => {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const messageRefs = useRef({});

  const filteredMessages = messages.filter(
    (m) =>
      !messageSearchTerm ||
      (m.text && m.text.toLowerCase().includes(messageSearchTerm.toLowerCase()))
  );

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
          onViewStory={onViewStory}
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
            if (onMessageSent) {
              setTimeout(onMessageSent, 150);
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
      <MessageListActionBar
        selectMode={selectMode}
        selectedIds={selectedIds}
        onCancel={() => { setSelectMode(false); setSelectedIds(new Set()); }}
        handleBulkForward={handleBulkForward}
        handleBulkDeleteForMe={handleBulkDeleteForMe}
      />

      <div
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1 bg-[var(--bg-chat)] relative"
        ref={messagesContainerRef}
        onScroll={handleScroll}
        onContextMenu={(e) => {
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
