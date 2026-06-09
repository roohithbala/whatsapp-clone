import React from "react";

const SettingsSessionCard = ({
  session,
  currentSessionId,
  formatRelativeTime,
  getDeviceIcon,
  handleRevokeSession,
  revokingId
}) => {
  const isCurrent = session.sessionId === currentSessionId;

  return (
    <div 
      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition bg-white/[0.02] hover:bg-white/[0.04] ${
        isCurrent ? "border-[var(--whatsapp-green)]/30" : "border-[var(--border-light)]"
      }`}
    >
      {/* Left side: Icon and device info */}
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-[var(--border-light)] flex items-center justify-center shrink-0">
          {getDeviceIcon(session.deviceType, session.os)}
        </div>
        
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-[var(--text-primary)]">
              {session.browser} on {session.os}
            </span>
            {isCurrent && (
              <span className="text-[10px] bg-[var(--whatsapp-green)] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                This Device
              </span>
            )}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1 flex flex-col gap-0.5">
            <span>IP Address: {session.ipAddress}</span>
            <span>
              {isCurrent ? "Active now" : `Last active: ${formatRelativeTime(session.lastActiveAt)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Log out button */}
      <button 
        onClick={() => handleRevokeSession(session.sessionId)}
        disabled={revokingId === session.sessionId}
        title={isCurrent ? "Log out of this account" : "Log out this session"}
        className={`w-9 h-9 rounded-full flex items-center justify-center border transition shrink-0 cursor-pointer ${
          isCurrent 
            ? "border-[var(--border-light)] hover:bg-red-500/10 hover:border-red-500/20 text-[var(--text-secondary)] hover:text-red-500" 
            : "border-red-500/20 hover:bg-red-500/10 text-red-500"
        }`}
      >
        {revokingId === session.sessionId ? (
          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default SettingsSessionCard;
