import React from "react";

const MessageDateSeparator = ({ date }) => {
  const formatDate = (d) => {
    const now = new Date();
    const target = new Date(d);
    const diffDays = Math.floor((now.setHours(0,0,0,0) - target.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) {
      return new Date(d).toLocaleDateString([], { weekday: "long" });
    }
    return new Date(d).toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="flex items-center justify-center my-3 select-none pointer-events-none">
      <span className="bg-[var(--bg-panel)] text-[var(--text-secondary)] text-[11.5px] font-medium px-3 py-1 rounded-full shadow-sm border border-[var(--border-light)] backdrop-blur-sm">
        {formatDate(date)}
      </span>
    </div>
  );
};

export default MessageDateSeparator;
