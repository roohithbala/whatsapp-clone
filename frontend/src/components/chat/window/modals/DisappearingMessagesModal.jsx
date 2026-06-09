import React, { useState, useEffect } from "react";
import { DURATIONS } from "./disappearingDurations";

const DisappearingMessagesModal = ({
  isOpen,
  onClose,
  currentDuration,
  onSelect,
  peerName,
}) => {
  const [selected, setSelected] = useState(currentDuration || "off");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelected(currentDuration || "off");
  }, [currentDuration, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSelect(selected);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", animation: "overlayFadeIn 0.2s ease" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          background: "var(--bg-sidebar)",
          border: "var(--glass-border)",
          boxShadow: "var(--glass-shadow)",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "400px",
          animation: "modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,217,166,0.2) 0%, transparent 70%)" }}
        />

        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-[var(--border-light)]">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(0,217,166,0.12)" }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--whatsapp-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[var(--text-primary)] leading-tight">Disappearing messages</h2>
            {peerName && (
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 leading-tight">Chat with {peerName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition cursor-pointer"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Explanation */}
        <p className="px-6 pt-4 text-[12.5px] text-[var(--text-secondary)] leading-relaxed text-left">
          Once enabled, new messages will automatically disappear from this chat after the selected duration.
          This affects <strong className="text-[var(--text-primary)]">all new messages</strong> for both participants.
        </p>

        {/* Options */}
        <div className="px-4 py-3 flex flex-col gap-1.5">
          {DURATIONS.map((d) => {
            const isActive = selected === d.value;
            return (
              <button
                key={d.value}
                onClick={() => setSelected(d.value)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? "border-[var(--whatsapp-green)] bg-[rgba(0,217,166,0.08)]"
                    : "border-transparent hover:bg-[var(--bg-hover)]"
                }`}
              >
                <span className={`shrink-0 transition-colors ${isActive ? "text-[var(--whatsapp-green)]" : "text-[var(--text-muted)]"}`}>
                  {d.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-[14px] font-semibold leading-tight ${isActive ? "text-[var(--whatsapp-green)]" : "text-[var(--text-primary)]"}`}>
                    {d.label}
                  </div>
                  <div className="text-[11.5px] text-[var(--text-secondary)] mt-0.5 leading-tight">{d.sublabel}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isActive ? "border-[var(--whatsapp-green)] bg-[var(--whatsapp-green)]" : "border-[var(--text-muted)]"
                }`}>
                  {isActive && (
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13.5px] font-semibold text-[var(--text-secondary)] border border-[var(--border-strong)] hover:bg-[var(--bg-hover)] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || selected === currentDuration}
            className="flex-1 py-2.5 rounded-xl text-[13.5px] font-bold text-white transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: (isSubmitting || selected === currentDuration)
                ? "var(--border-strong)"
                : "linear-gradient(135deg, var(--whatsapp-green), var(--whatsapp-teal))",
              boxShadow: (isSubmitting || selected === currentDuration)
                ? "none"
                : "0 4px 16px rgba(0,217,166,0.3)",
            }}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisappearingMessagesModal;
