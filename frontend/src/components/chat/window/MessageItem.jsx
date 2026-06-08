import React, { useState, useRef, useEffect, useCallback } from "react";
import MessageBody from "./MessageBody";
import api from "../../../services/api";
import socket from "../../../socket";
import ReactionInfoModal from "./ReactionInfoModal";
import MessageMenu from "./MessageMenu";
import DeleteConfirmModal from "./DeleteConfirmModal";

const QUICK_REACTIONS = ["❤️", "😂", "👍", "😮", "🙏", "😢"];

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
  isSelectedInSelectMode,
  onToggleSelect,
  messageRef,
}) => {
  const isSent = message.senderId === currentUser.userId;
  const time = new Date(message.createdAt || message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const [showMenu, setShowMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
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

  const menuRef = useRef(null);
  const reactionPickerRef = useRef(null);

  useEffect(() => {
    setIsStarred(message.starredBy?.includes(currentUser.userId));
  }, [message.starredBy, currentUser.userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(e.target))
        setShowReactionPicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      setShowReactionPicker(false);

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
        : selectedUser?.userId;
      socket.emit("editMessage", { message: deletedMsg, receiverId, isGroup });
      if (onDeleteLocal) onDeleteLocal(message._id, true);
    } catch (e) {
      console.error("Delete failed", e);
    }
  }, [message._id, isGroup, selectedUser, onDeleteLocal]);

  const handleStar = useCallback(async () => {
    try {
      await api.post(`/messages/toggle-star/${message._id}`);
      setIsStarred((prev) => !prev);
      setShowMenu(false);
    } catch (e) {
      console.error("Star failed", e);
    }
  }, [message._id]);

  const handleCopy = useCallback(() => {
    if (message.text) navigator.clipboard.writeText(message.text);
    setShowMenu(false);
  }, [message.text]);

  const renderStatusTicks = () => {
    if (message.status === "seen") {
      return (
        <svg viewBox="0 0 16 15" width="15" height="14" className="fill-[var(--tick-seen)] shrink-0 ml-1">
          <path d="M15 3.3L8.5 9.8 5.7 7l-1.4 1.4 4.2 4.2 8-8z" />
          <path d="M11 3.3L4.5 9.8 1.7 7l-1.4 1.4 4.2 4.2 8-8z" className="opacity-70" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 16 15" width="15" height="14" className="fill-white/60 shrink-0 ml-1">
        <path d="M15 3.3L8.5 9.8 5.7 7l-1.4 1.4 4.2 4.2 8-8z" />
        {message.status === "delivered" && (
          <path d="M11 3.3L4.5 9.8 1.7 7l-1.4 1.4 4.2 4.2 8-8z" className="opacity-70" />
        )}
      </svg>
    );
  };

  // Double-click to reply
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
            className="text-[12px] font-semibold mb-1.5 cursor-pointer hover:underline leading-tight tracking-tight"
            style={{ color: getSenderColor(message.senderUsername) }}
          >
            {message.senderUsername}
          </div>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div
            className="bg-black/10 border-l-[3px] border-[var(--whatsapp-green)] px-3 py-1.5 rounded-r-lg text-xs mb-2 cursor-pointer select-none opacity-90 hover:bg-black/15 transition"
            onClick={() => {
              // Scroll to replied message
              const el = document.querySelector(`[data-message-id="${message.replyTo.id}"]`);
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.classList.add("ring-2", "ring-[var(--whatsapp-green)]", "ring-opacity-50");
                setTimeout(() => el.classList.remove("ring-2", "ring-[var(--whatsapp-green)]", "ring-opacity-50"), 1500);
              }
            }}
          >
            <div className="font-bold text-[var(--whatsapp-green)] text-[11px] mb-0.5 truncate">
              {message.replyTo.senderName || "User"}
            </div>
            <div className="truncate text-[var(--text-primary)] max-w-full text-[12.5px] leading-snug">
              {message.replyTo.text || "[Media]"}
            </div>
          </div>
        )}

        {/* Message body */}
        <div>
          <MessageBody message={message} searchTerm={searchTerm} isSent={isSent} currentUser={currentUser} users={users} />
        </div>

        {/* Translation states & language picker */}
        {translationLoading && (
          <div className={`mt-2 pt-2 border-t flex items-center gap-2 text-xs select-none ${isSent ? 'border-white/20 text-white/70' : 'border-[var(--border-light)]/30 text-[var(--text-secondary)]'}`}>
            <div className={`w-3.5 h-3.5 border-2 rounded-full animate-spin shrink-0 ${isSent ? 'border-white border-t-transparent' : 'border-[var(--whatsapp-green)] border-t-transparent'}`} />
            <span className="italic animate-pulse">Translating...</span>
          </div>
        )}

        {translationError && (
          <div className={`mt-2 pt-2 border-t flex items-center justify-between text-[11px] select-none ${isSent ? 'border-white/20 text-white/90' : 'border-[var(--border-light)]/30 text-red-400'}`}>
            <span>⚠️ {translationError}</span>
            <button className={`cursor-pointer border-none bg-transparent hover:underline text-[10px] font-bold ${isSent ? 'text-white/60 hover:text-white' : 'text-[var(--text-secondary)] hover:text-red-400'}`} onClick={() => setTranslationError("")}>Dismiss</button>
          </div>
        )}

        {translation && (
          <div className={`mt-2 pt-2 border-t select-text leading-relaxed ${isSent ? 'border-white/20' : 'border-[var(--border-light)]/40'}`}>
            <div className="flex items-center justify-between text-[10px] select-none font-bold uppercase tracking-wider mb-1">
              <span className={`flex items-center gap-1 ${isSent ? 'text-white/65' : 'text-[var(--text-secondary)]'}`}>
                🌐 Translated to {translationLanguage}
              </span>
              <button 
                className={`cursor-pointer border-none bg-transparent text-[10px] font-bold hover:underline ${isSent ? 'text-white/65 hover:text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`} 
                onClick={() => setTranslation(null)}
              >
                Hide
              </button>
            </div>
            <div className={`text-[13.5px] italic text-left ${isSent ? 'text-white' : 'text-[var(--text-primary)]'}`}>{translation}</div>
          </div>
        )}

        {showLangPicker && (
          <div className={`mt-2 pt-2 border-t select-none text-[12px] animate-slideUp ${isSent ? 'border-white/20' : 'border-[var(--border-light)]/40'}`}>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <span className={`flex items-center gap-1 ${isSent ? 'text-white/65' : 'text-[var(--text-secondary)]'}`}>
                🌐 Select Target Language
              </span>
              <button 
                className={`cursor-pointer border-none bg-transparent font-bold ${isSent ? 'text-white/65 hover:text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`} 
                onClick={() => setShowLangPicker(false)}
              >
                ✕
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mt-1 max-w-full">
              {[
                { name: "Spanish", code: "Spanish" },
                { name: "French", code: "French" },
                { name: "German", code: "German" },
                { name: "Hindi", code: "Hindi" },
                { name: "Japanese", code: "Japanese" },
                { name: "Chinese", code: "Chinese" },
                { name: "Arabic", code: "Arabic" },
                { name: "Portuguese", code: "Portuguese" }
              ].map(lang => (
                <button
                  key={lang.code}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border-none cursor-pointer transition ${
                    isSent 
                      ? 'bg-white/10 hover:bg-white/25 text-white' 
                      : 'bg-[var(--bg-input)] hover:bg-[var(--whatsapp-green)]/15 text-[var(--text-primary)] hover:text-[var(--whatsapp-green)]'
                  }`}
                  onClick={() => handleTranslate(lang.code)}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
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
            {isSent && renderStatusTicks()}
          </div>
        )}

        {/* Hover action buttons — only when not in select mode */}
        {!selectMode && (
          <div
            className={`absolute -top-6 ${
              isSent ? "right-0" : "left-0"
            } flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20 select-none`}
          >
            {/* Quick reactions */}
            <div className="relative" ref={reactionPickerRef}>
              <button
                className="w-7 h-7 rounded-full bg-[var(--bg-panel)] border border-[var(--border-light)] hover:bg-[var(--bg-hover)] flex items-center justify-center cursor-pointer text-sm shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReactionPicker(!showReactionPicker);
                  setShowMenu(false);
                }}
                title="React"
              >
                😊
              </button>
              {showReactionPicker && (
                <div
                  className={`absolute ${isSent ? "right-0" : "left-0"} bottom-full mb-1 bg-[var(--bg-sidebar)] border border-[var(--border-light)] p-1.5 rounded-full flex gap-1 shadow-2xl z-30`}
                  style={{ animation: "modalSlideUp 0.15s ease" }}
                >
                  {QUICK_REACTIONS.map((emoji) => (
                    <span
                      key={emoji}
                      className="p-1 text-base hover:scale-125 transition-transform cursor-pointer select-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReact(emoji);
                      }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Menu button */}
            <div className="relative" ref={menuRef}>
              <button
                className="w-7 h-7 rounded-full bg-[var(--bg-panel)] border border-[var(--border-light)] hover:bg-[var(--bg-hover)] flex items-center justify-center cursor-pointer text-[var(--text-secondary)] shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                  setShowReactionPicker(false);
                }}
                title="More options"
              >
                <svg viewBox="0 0 19 20" width="14" height="14" fill="currentColor">
                  <path d="M3.8 6.7l5.7 5.7 5.7-5.7 1.6 1.6-7.3 7.2-7.3-7.2 1.6-1.6z" />
                </svg>
              </button>
              <MessageMenu
                isOpen={showMenu}
                menuRef={menuRef}
                isSent={isSent}
                isStarred={isStarred}
                message={message}
                onReply={() => { onReply(message); setShowMenu(false); }}
                onShowInfo={() => { onShowInfo(message); setShowMenu(false); }}
                handleCopy={handleCopy}
                onForward={() => { onForward(message); setShowMenu(false); }}
                handleStar={handleStar}
                onEdit={() => { onEdit(message); setShowMenu(false); }}
                onDelete={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
                onClose={() => setShowMenu(false)}
                alignRight={isSent}
                onTranslate={() => { setShowLangPicker(true); setShowMenu(false); }}
              />
            </div>
          </div>
        )}

        {/* Reactions bubble */}
        {message.reactions && Array.isArray(message.reactions) && message.reactions.length > 0 && (
          <div
            className="absolute -bottom-3.5 bg-[var(--bg-panel)] px-2 py-0.5 rounded-full shadow-md border border-[var(--border-light)] text-xs flex gap-0.5 items-center select-none cursor-pointer hover:scale-105 transition z-10"
            style={{ right: isSent ? "10px" : "auto", left: isSent ? "auto" : "10px" }}
            onClick={(e) => {
              e.stopPropagation();
              setShowReactionInfo(true);
            }}
          >
            {Array.from(new Set(message.reactions.map((r) => r.emoji))).map((emoji) => (
              <span key={emoji}>{emoji}</span>
            ))}
            {message.reactions.length > 1 && (
              <span className="text-[10px] text-[var(--text-secondary)] font-bold ml-0.5">
                {message.reactions.length}
              </span>
            )}
          </div>
        )}

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
          isSent={isSent}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForEveryone={handleDeleteForEveryone}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};

export default MessageItem;
