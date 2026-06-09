import React, { useState, useRef, useEffect } from "react";
import MessageMenu from "./MessageMenu";

const QUICK_REACTIONS = ["❤️", "😂", "👍", "😮", "🙏", "😢"];

const MessageHoverActions = ({
  isSent,
  selectMode,
  message,
  isStarred,
  onReply,
  onShowInfo,
  onForward,
  onEdit,
  onDelete,
  onTranslate,
  handleReact,
  handleCopy,
  handleStar
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const menuRef = useRef(null);
  const reactionPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(e.target))
        setShowReactionPicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (selectMode) return null;

  return (
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
                  setShowReactionPicker(false);
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
          onDelete={() => { setShowMenu(false); onDelete(); }}
          onClose={() => setShowMenu(false)}
          alignRight={isSent}
          onTranslate={() => { onTranslate(); setShowMenu(false); }}
        />
      </div>
    </div>
  );
};

export default MessageHoverActions;
