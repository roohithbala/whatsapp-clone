import React from "react";

const MessageReplyPreview = ({ replyTo, onViewStory }) => {
  const handleClick = async () => {
    if (replyTo.statusId && onViewStory) {
      try {
        const statusService = (await import("../../../../services/statusService")).default;
        const statusObj = await statusService.fetchStatus(replyTo.statusId);
        
        if (statusObj) {
          onViewStory({
            user: statusObj.userId,
            stories: [statusObj]
          });
        }
      } catch (err) {
        console.error("Failed to load status:", err);
        alert("This status update is no longer available.");
      }
      return;
    }
    
    // Scroll to replied message
    const el = document.querySelector(`[data-message-id="${replyTo.id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-[var(--whatsapp-green)]", "ring-opacity-50");
      setTimeout(() => el.classList.remove("ring-2", "ring-[var(--whatsapp-green)]", "ring-opacity-50"), 1500);
    }
  };

  return (
    <div
      className="bg-black/10 border-l-[3px] border-[var(--whatsapp-green)] px-3 py-1.5 rounded-r-lg text-xs mb-2 cursor-pointer select-none opacity-90 hover:bg-black/15 transition text-left"
      onClick={handleClick}
    >
      <div className="font-bold text-[var(--whatsapp-green)] text-[11px] mb-0.5 truncate flex items-center justify-between">
        <span>{replyTo.senderName || "User"}</span>
        {replyTo.statusId && (
          <span className="text-[9px] uppercase tracking-wider bg-[var(--whatsapp-green)]/20 px-1.5 py-0.5 rounded-full font-semibold">
            Status
          </span>
        )}
      </div>
      {replyTo.mediaUrl ? (
        <div className="flex items-center gap-2 mt-1">
          {replyTo.messageType === "video" ? (
            <div className="w-8 h-8 rounded bg-black flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          ) : (
            <img src={replyTo.mediaUrl} alt="Status preview" className="w-8 h-8 rounded object-cover shrink-0 border border-black/10" />
          )}
          <span className="truncate text-[var(--text-primary)] text-[12.5px] leading-snug italic text-[var(--text-secondary)]">
            {replyTo.text || "[Media]"}
          </span>
        </div>
      ) : (
        <div className="truncate text-[var(--text-primary)] max-w-full text-[12.5px] leading-snug">
          {replyTo.text || "[Media]"}
        </div>
      )}
    </div>
  );
};

export default MessageReplyPreview;
