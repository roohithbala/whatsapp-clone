import React from "react";

const MessageStatusTicks = ({ status }) => {
  if (status === "seen") {
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
      {status === "delivered" && (
        <path d="M11 3.3L4.5 9.8 1.7 7l-1.4 1.4 4.2 4.2 8-8z" className="opacity-70" />
      )}
    </svg>
  );
};

export default MessageStatusTicks;
