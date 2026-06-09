import React, { useState, useEffect } from "react";
import userService from "../../../../services/userService";
import SettingsSessionCard from "./SettingsSessionCard";

const SettingsSessions = ({ onBack, currentUser, onLogout }) => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revokingId, setRevokingId] = useState(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await userService.getActiveSessions();
      setSessions(data.sessions || []);
      setCurrentSessionId(data.currentSessionId);
      setError("");
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setError("Failed to load active sessions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (sessionId) => {
    if (sessionId === currentSessionId) {
      if (window.confirm("Logging out of this session will log you out of the application entirely. Do you want to log out?")) {
        if (onLogout) {
          onLogout();
        } else {
          userService.removeToken();
          window.location.reload();
        }
      }
      return;
    }

    if (!window.confirm("Are you sure you want to revoke this session? The device will be logged out immediately.")) {
      return;
    }

    try {
      setRevokingId(sessionId);
      await userService.logoutSession(sessionId);
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
    } catch (err) {
      console.error("Failed to revoke session:", err);
      alert("Failed to revoke session. Please try again.");
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllOthers = async () => {
    if (!window.confirm("Are you sure you want to log out of all other sessions? All other devices will be logged out immediately.")) {
      return;
    }

    try {
      setRevokingAll(true);
      await userService.logoutAllOtherSessions();
      setSessions(prev => prev.filter(s => s.sessionId === currentSessionId));
    } catch (err) {
      console.error("Failed to revoke other sessions:", err);
      alert("Failed to revoke other sessions. Please try again.");
    } finally {
      setRevokingAll(false);
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Active now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getDeviceIcon = (deviceType, os) => {
    const device = (deviceType || "desktop").toLowerCase();
    const platform = (os || "").toLowerCase();

    if (device === "mobile" || platform === "ios" || platform === "android") {
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--whatsapp-green)]">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
      );
    } else if (device === "tablet") {
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--whatsapp-green)]">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--whatsapp-green)]">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      );
    }
  };

  const hasOtherSessions = sessions.some(s => s.sessionId !== currentSessionId);

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-sidebar)]">
      {/* Header */}
      <div className="p-5 border-b border-[var(--border-light)] flex items-center gap-3 text-left bg-[var(--bg-sidebar-alt)] shrink-0">
        <button 
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer transition duration-200" 
          onClick={onBack}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Devices & Sessions</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 text-left">
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
          Review the list of devices and sessions currently connected to your WhatsApp Clone account. You can log out of any session at any time.
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-8 h-8 border-3 border-[var(--whatsapp-green)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[var(--text-secondary)]">Loading connected devices...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
            {error}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {hasOtherSessions && (
              <button 
                onClick={handleRevokeAllOthers}
                disabled={revokingAll}
                className="w-full py-3 px-4 rounded-xl text-left border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/10 transition font-semibold text-sm flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{revokingAll ? "Revoking all other sessions..." : "Log out of all other devices"}</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            )}

            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1 px-1">Active logins</h3>
              {sessions.map((session) => (
                <SettingsSessionCard
                  key={session.sessionId}
                  session={session}
                  currentSessionId={currentSessionId}
                  formatRelativeTime={formatRelativeTime}
                  getDeviceIcon={getDeviceIcon}
                  handleRevokeSession={handleRevokeSession}
                  revokingId={revokingId}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsSessions;
