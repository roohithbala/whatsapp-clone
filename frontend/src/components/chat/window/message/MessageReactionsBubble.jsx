import React from "react";

const MessageReactionsBubble = ({ reactions, isSent, onClick }) => {
  if (!reactions || !Array.isArray(reactions) || reactions.length === 0) {
    return null;
  }

  const uniqueEmojis = Array.from(new Set(reactions.map((r) => r.emoji)));

  return (
    <div
      className="absolute -bottom-3.5 bg-[var(--bg-panel)] px-2 py-0.5 rounded-full shadow-md border border-[var(--border-light)] text-xs flex gap-0.5 items-center select-none cursor-pointer hover:scale-105 transition z-10"
      style={{ right: isSent ? "10px" : "auto", left: isSent ? "auto" : "10px" }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {uniqueEmojis.map((emoji) => (
        <span key={emoji}>{emoji}</span>
      ))}
      {reactions.length > 1 && (
        <span className="text-[10px] text-[var(--text-secondary)] font-bold ml-0.5">
          {reactions.length}
        </span>
      )}
    </div>
  );
};

export default MessageReactionsBubble;
