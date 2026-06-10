import React, { useState, useEffect, useCallback } from "react";
import MessageBody from "./MessageBody";
import api from "../../../../services/api";
import socket from "../../../../socket";
import ReactionInfoModal from "./ReactionInfoModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import MessageStatusTicks from "./MessageStatusTicks";
import MessageReplyPreview from "./MessageReplyPreview";
import MessageLangPicker from "./MessageLangPicker";
import MessageReactionsBubble from "./MessageReactionsBubble";
import MessageTranslationSection from "./MessageTranslationSection";
import MessageHoverActions from "./MessageHoverActions";

const MessageItem = ({
  message,
  currentUser,
  selectedUser,
  onReply,
  onEdit,
  onForward,
  onShowInfo,
  isGroup,
  isChannel,
  onReactionUpdate,
  users,
  onDeleteLocal,
  searchTerm,
  selectMode,
  onViewStory,
  isSelectedInSelectMode,
  onToggleSelect,
  messageRef,
}) => {
  const isSent = message.senderId === currentUser.userId;
  const isGroupAdmin = isGroup && (
    selectedUser?.adminIds?.some(id => String(id) === String(currentUser?.userId)) || 
    String(selectedUser?.adminId) === String(currentUser?.userId)
  );
  const isChannelAdmin = isChannel && (
    selectedUser?.isAdmin === true ||
    String(selectedUser?.adminId) === String(currentUser?.userId) ||
    selectedUser?.admins?.some(id => String(id) === String(currentUser?.userId))
  );
  const canDeleteForEveryone = isSent || isGroupAdmin || isChannelAdmin;
  const time = new Date(message.createdAt || message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const [showReactionInfo, setShowReactionInfo] = useState(false);
  const [isStarred, setIsStarred] = useState(message.starredBy?.includes(currentUser.userId));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // AI Message Translation states
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [translation, setTranslation] = useState(null);
  const [translationLanguage, setTranslationLanguage] = useState(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationError, setTranslationError] = useState("");

  const handleTranslate = async (targetLanguage) => {
    setShowLangPicker(false);
    setTranslationLoading(true);
    setTranslationError("");
    try {
      const response = await api.post("/meta-ai/translate", {
        text: message.text,
        targetLanguage
      });
      setTranslation(response.data.translation);
      setTranslationLanguage(targetLanguage);
    } catch (err) {
      console.error("Translation error:", err);
      setTranslationError("Failed to translate.");
    } finally {
      setTranslationLoading(false);
    }
  };

  useEffect(() => {
    setIsStarred(message.starredBy?.includes(currentUser.userId));
  }, [message.starredBy, currentUser.userId]);

  const getSenderColor = (name) => {
    if (!name) return "#00a884";
    const colors = ["#e542a3", "#00a884", "#00b09b", "#9c27b0", "#f44336", "#ff9800", "#03a9f4", "#8bc34a"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const handleReact = useCallback(async (emoji) => {
    try {
      const existing = (message.reactions || []).find((r) => r.userId === currentUser.userId);
      let newReactions = [...(message.reactions || [])];

      if (existing) {
        if (existing.emoji === emoji) {
          newReactions = newReactions.filter((r) => r.userId !== currentUser.userId);
        } else {
          newReactions = newReactions.map((r) =>
            r.userId === currentUser.userId ? { ...r, emoji } : r
          );
        }
      } else {
        newReactions.push({ userId: currentUser.userId, emoji });
      }

      if (onReactionUpdate) onReactionUpdate(message._id, newReactions);

      await api.post(`/messages/react/${message._id}`, { emoji });

      if (selectedUser) {
        socket.emit("editMessage", {
          message: { ...message, reactions: newReactions },
          receiverId: isGroup ? (selectedUser.groupId || selectedUser.userId) : selectedUser.userId,
          isGroup,
        });
      }
    } catch (e) {
      console.error("Reaction failed", e);
    }
  }, [message, currentUser.userId, onReactionUpdate, selectedUser, isGroup]);

  const handleDeleteForMe = useCallback(async () => {
    setShowDeleteConfirm(false);
    try {
      await api.post(`/messages/delete-for-me/${message._id}`);
      if (onDeleteLocal) onDeleteLocal(message._id, false);
    } catch (e) {
      console.error("Delete failed", e);
    }
  }, [message._id, onDeleteLocal]);

  const handleDeleteForEveryone = useCallback(async () => {
    setShowDeleteConfirm(false);
    try {
      const res = await api.post(`/messages/delete-for-everyone/${message._id}`);
      const deletedMsg = res.data;
      const receiverId = isGroup
        ? (selectedUser?.groupId || selectedUser?.userId)
        : isChannel
        ? selectedUser?.channelId
        : selectedUser?.userId;
      socket.emit("editMessage", { message: deletedMsg, receiverId, isGroup, isChannel });
      if (onDeleteLocal) onDeleteLocal(message._id, true);
    } catch (e) {
      console.error("Delete failed", e);
    }
  }, [message._id, isGroup, isChannel, selectedUser, onDeleteLocal]);

  const handleStar = useCallback(async () => {
    try {
      await api.post(`/messages/toggle-star/${message._id}`);
      setIsStarred((prev) => !prev);
    } catch (e) {
      console.error("Star failed", e);
    }
  }, [message._id]);

  const handleCopy = useCallback(() => {
    if (message.text) navigator.clipboard.writeText(message.text);
  }, [message.text]);

  const handleDoubleClick = () => {
    if (!message.isDeleted) onReply(message);
  };

  const handleClick = () => {
    if (selectMode && onToggleSelect) {
      onToggleSelect(message._id);
    }
  };

  if (message.messageType === "system") {
    return (
      <div ref={messageRef} className="flex justify-center w-full my-3">
        <div className="bg-[var(--bg-sidebar-alt)] text-[var(--text-secondary)] text-[12px] px-3 py-1.5 rounded-lg border border-[var(--border-light)] shadow-sm font-medium text-center max-w-[80%] flex items-center gap-2">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[var(--whatsapp-green)]">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messageRef}
      data-message-id={message._id}
      className={`flex w-full mb-0.5 group transition-colors duration-150 ${
        isSent ? "justify-end" : "justify-start"
      } ${selectMode ? "cursor-pointer" : ""} ${
        isSelectedInSelectMode ? "bg-[var(--whatsapp-green)]/10 rounded-lg px-1" : ""
      }`}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
    >
      {/* Select checkbox */}
      {selectMode && (
        <div className="flex items-center pr-2">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              isSelectedInSelectMode
                ? "bg-[var(--whatsapp-green)] border-[var(--whatsapp-green)]"
                : "border-[var(--text-secondary)]"
            }`}
          >
            {isSelectedInSelectMode && (
              <svg viewBox="0 0 24 24" width="12" height="12" fill="white">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            )}
          </div>
        </div>
      )}

      <div
        className={`relative text-[14.2px] max-w-[70%] transition-all duration-200 ${
          ["sticker", "poll", "contact", "event"].includes(message.messageType)
            ? "bg-transparent border-transparent shadow-none p-0"
            : `rounded-2xl border shadow-sm hover:shadow-md leading-[1.45] min-w-[110px] select-text px-3.5 pt-2.5 pb-3 ${
                isSent
                  ? "bg-gradient-to-tr from-[var(--whatsapp-teal)] to-[var(--whatsapp-green)] text-white rounded-tr-sm border-transparent"
                  : "bg-[var(--bg-message-received)] text-[var(--text-primary)] rounded-tl-sm border-[var(--border-light)]"
              }`
        }`}
      >
        {/* Group sender name */}
        {!isSent && (isGroup || isChannel) && message.senderUsername && (
          <div
            className="text-[12px] font-semibold mb-1.5 cursor-pointer hover:underline leading-tight tracking-tight text-left"
            style={{ color: getSenderColor(message.senderUsername) }}
          >
            {message.senderUsername}
          </div>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <MessageReplyPreview replyTo={message.replyTo} onViewStory={onViewStory} />
        )}

        {/* Message body */}
        <div>
          <MessageBody message={message} searchTerm={searchTerm} isSent={isSent} currentUser={currentUser} users={users} />
        </div>

        {/* Translation Alerts and Text Blocks */}
        <MessageTranslationSection
          translationLoading={translationLoading}
          translationError={translationError}
          translation={translation}
          translationLanguage={translationLanguage}
          isSent={isSent}
          onCloseError={() => setTranslationError("")}
          onHideTranslation={() => setTranslation(null)}
        />

        {showLangPicker && (
          <MessageLangPicker isSent={isSent} onClose={() => setShowLangPicker(false)} onTranslate={handleTranslate} />
        )}

        {/* Time + status */}
        {!["poll", "contact", "event"].includes(message.messageType) && (
          <div className={`flex items-center justify-end gap-1 mt-1.5 select-none ${
            message.messageType === "sticker"
              ? "bg-black/35 text-white px-2 py-0.5 rounded-full w-fit ml-auto text-[10px]"
              : ""
          }`}>
            {message.isEdited && (
              <span className={`text-[11px] italic ${
                isSent || message.messageType === "sticker" ? "text-white/60" : "text-[var(--message-time-color)]"
              }`}>edited</span>
            )}
            {isStarred && <span className="text-[10px] text-yellow-500">⭐</span>}
            <span className={`text-[11px] ${
              isSent || message.messageType === "sticker" ? "text-white/70" : "text-[var(--message-time-color)]"
            }`}>{time}</span>
            {isSent && (
              <MessageStatusTicks 
                status={(!isGroup && !isChannel && (currentUser?.privacy?.readReceipts === false || selectedUser?.privacy?.readReceipts === false) && message.status === "seen") ? "delivered" : message.status} 
              />
            )}
          </div>
        )}

        {/* Hover action buttons — only when not in select mode */}
        <MessageHoverActions
          isSent={isSent}
          selectMode={selectMode}
          message={message}
          isStarred={isStarred}
          onReply={onReply}
          onShowInfo={onShowInfo}
          onForward={onForward}
          onEdit={onEdit}
          onDelete={() => setShowDeleteConfirm(true)}
          onTranslate={() => setShowLangPicker(true)}
          handleReact={handleReact}
          handleCopy={handleCopy}
          handleStar={handleStar}
        />

        {/* Reactions bubble */}
        <MessageReactionsBubble
          reactions={message.reactions}
          isSent={isSent}
          onClick={() => setShowReactionInfo(true)}
        />

        {showReactionInfo && (
          <ReactionInfoModal
            reactions={message.reactions}
            users={users}
            onClose={() => setShowReactionInfo(false)}
          />
        )}
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          message={message}
          canDeleteForEveryone={canDeleteForEveryone}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForEveryone={handleDeleteForEveryone}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};

export default MessageItem;
