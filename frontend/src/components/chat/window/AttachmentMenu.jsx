import React from "react";

const AttachmentMenu = ({ isOpen, onAction }) => {
  if (!isOpen) return null;

  const actions = [
    { id: "document", label: "Document", icon: "📄", color: "#7f66ff" },
    { id: "photos", label: "Photos & videos", icon: "🖼️", color: "#007bfc" },
    { id: "camera", label: "Camera", icon: "📷", color: "#ff2e74" },
    { id: "audio", label: "Audio", icon: "🎧", color: "#f97316" },
    { id: "contact", label: "Contact", icon: "👤", color: "#0ea5e9" },
    { id: "poll", label: "Poll", icon: "📊", color: "#eab308" },
    { id: "event", label: "Event", icon: "📅", color: "#ec4899" },
    { id: "sticker", label: "New sticker", icon: "🏷️", color: "#10b981" },
  ];

  return (
    <div
      data-input-panel
      className="absolute bottom-[72px] left-11 bg-[var(--bg-sidebar)] backdrop-blur-lg border border-[var(--border-light)] rounded-2xl p-2 shadow-2xl flex flex-col gap-0.5 z-50"
      style={{ animation: "modalSlideUp 0.2s cubic-bezier(0.16,1,0.3,1)", minWidth: "180px" }}
    >
      {actions.map((a) => (
        <div
          key={a.id}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-hover)] cursor-pointer transition select-none"
          onClick={() => onAction(a.id)}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm text-white shrink-0"
            style={{ backgroundColor: a.color }}
          >
            {a.icon}
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)]">{a.label}</span>
        </div>
      ))}
    </div>
  );
};

export default AttachmentMenu;
