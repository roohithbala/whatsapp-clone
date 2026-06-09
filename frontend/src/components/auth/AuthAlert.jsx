import React from "react";

export default function AuthAlert({ type = "error", message }) {
  if (!message) return null;

  const isError = type === "error";

  return isError ? (
    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-xs text-left mb-4 animate-slideUp flex items-start gap-2.5">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>{message}</span>
    </div>
  ) : (
    <div className="bg-[var(--whatsapp-green)]/10 border border-[var(--whatsapp-green)]/20 text-[var(--whatsapp-green)] p-3.5 rounded-2xl text-xs text-left mb-5 animate-slideUp flex items-start gap-2.5">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
