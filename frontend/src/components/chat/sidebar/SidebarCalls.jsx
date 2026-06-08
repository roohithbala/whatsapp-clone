import React, { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const SidebarCalls = ({ setRailMode, currentUser, onStartCall, users }) => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewCallPicker, setShowNewCallPicker] = useState(false);
  const [callPickerSearch, setCallPickerSearch] = useState("");

  const fetchCalls = useCallback(async () => {
    if (!currentUser?.userId) return;
    setLoading(true);
    try {
      const res = await api.get("/calls");
      setCalls(res.data || []);
    } catch (err) {
      console.error("Failed to fetch calls:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.userId]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const formatCallTime = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-sidebar)]">
      <div className="p-5 border-b border-[var(--border-light)] flex items-center gap-3 text-left bg-[var(--bg-sidebar-alt)]">
        {setRailMode && (
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer transition duration-200"
            onClick={() => setRailMode("messages")}
            title="Back to Chats"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        )}
        <h2 className="text-xl font-bold text-[var(--text-primary)] flex-1">Calls</h2>
        {/* New call button */}
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition border-0 bg-transparent"
          onClick={() => { setShowNewCallPicker(true); setCallPickerSearch(""); }}
          title="New call"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.27 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition"
          onClick={fetchCalls}
          title="Refresh"
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
            <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
        </button>
      </div>

      {/* New Call — contact picker */}
      {showNewCallPicker && (
        <div className="border-b border-[var(--border-light)] bg-[var(--bg-sidebar)] z-10">
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center gap-2 bg-[var(--bg-input)] rounded-xl px-3 py-2">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)] shrink-0">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                autoFocus
                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                placeholder="Search contacts..."
                value={callPickerSearch}
                onChange={e => setCallPickerSearch(e.target.value)}
              />
              <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer" onClick={() => setShowNewCallPicker(false)}>✕</button>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {(users || []).filter(u => u.userId !== currentUser?.userId && !u.isGroup && (u.username || u.name || "").toLowerCase().includes(callPickerSearch.toLowerCase())).slice(0, 10).map(u => (
              <div key={u.userId} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-hover)] cursor-pointer select-none">
                <div className="w-9 h-9 rounded-full bg-[var(--avatar-bg)] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {(u.username || u.name || "?")[0].toUpperCase()}
                </div>
                <span className="flex-1 text-[13.5px] font-medium text-[var(--text-primary)] truncate">{u.username || u.name}</span>
                <div className="flex gap-1.5">
                  <button
                    title="Voice call"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--whatsapp-green)] hover:bg-[var(--bg-hover)] border-0 bg-transparent cursor-pointer"
                    onClick={() => { setShowNewCallPicker(false); onStartCall && onStartCall("audio", u); }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.27 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </button>
                  <button
                    title="Video call"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--whatsapp-green)] hover:bg-[var(--bg-hover)] border-0 bg-transparent cursor-pointer"
                    onClick={() => { setShowNewCallPicker(false); onStartCall && onStartCall("video", u); }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* Create call link */}
        <div 
          className="flex items-center gap-3.5 px-4 py-3.5 cursor-pointer select-none transition-all duration-200 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)]"
          onClick={() => {
            const meetingId = `whatsapp-clone-${Math.random().toString(36).substr(2, 9)}`;
            const link = `https://meet.jit.si/${meetingId}`;
            navigator.clipboard.writeText(link);
            alert(`Call link created & copied to clipboard:\n${link}`);
          }}
        >
          <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-teal)] flex items-center justify-center shadow-md shrink-0">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-[15px] font-semibold text-[var(--text-primary)]">Create call link</div>
            <div className="text-[13px] text-[var(--text-secondary)]">Share a link for your WhatsApp call</div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-[var(--whatsapp-green)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-input)] flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.27 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)]">No recent calls</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 text-xs font-semibold text-[var(--whatsapp-green)] tracking-wider uppercase text-left">
              Recent
            </div>
            {calls.map((call) => {
              const isOutgoing = call.callerId === currentUser.userId;
              const otherUserId = isOutgoing ? call.receiverId : call.callerId;
              const otherUsername = isOutgoing ? call.receiverUsername : call.callerUsername;
              const otherUser = users?.find((u) => u.userId === otherUserId);
              const profilePicUrl = otherUser?.profilePicture
                ? otherUser.profilePicture.startsWith("http")
                  ? otherUser.profilePicture
                  : `${API_BASE}${otherUser.profilePicture}`
                : null;
              const isMissed = !isOutgoing && call.status === "missed";
              const avatarChar = (otherUsername || "?").charAt(0).toUpperCase();

              return (
                <div
                  key={call._id || call.callId}
                  className="flex items-center gap-3.5 px-4 py-3 cursor-pointer select-none transition-all duration-200 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)]"
                >
                  <div className="w-[49px] h-[49px] rounded-full overflow-hidden bg-[var(--avatar-bg)] flex items-center justify-center font-medium text-white text-lg shrink-0 relative">
                    <span>{avatarChar}</span>
                    {profilePicUrl && (
                      <img src={profilePicUrl} alt={otherUsername} className="w-full h-full object-cover absolute inset-0" onError={e => { e.target.style.display = "none"; }} />
                    )}
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <div
                      className="text-[15px] font-medium truncate"
                      style={{ color: isMissed ? "#ef4444" : "var(--text-primary)" }}
                    >
                      {otherUsername || otherUserId}
                    </div>
                    <div className="text-[12px] text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5">
                      {/* Arrow icon */}
                      {isOutgoing ? (
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--whatsapp-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <line x1="7" y1="17" x2="17" y2="7" />
                          <polyline points="7 7 17 7 17 17" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={isMissed ? "#ef4444" : "var(--whatsapp-green)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <line x1="17" y1="7" x2="7" y2="17" />
                          <polyline points="7 7 7 17 17 17" />
                        </svg>
                      )}
                      {/* Call type icon */}
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="shrink-0 opacity-60">
                        {call.type === "video" ? (
                          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                        ) : (
                          <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.1-.03-.21-.05-.31-.05-.26 0-.51.1-.71.29l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                        )}
                      </svg>
                      <span>
                        {isMissed ? "Missed · " : ""}
                        {formatCallTime(call.createdAt)}
                        {call.duration > 0 && ` · ${formatDuration(call.duration)}`}
                      </span>
                    </div>
                  </div>

                  {/* Call back button */}
                  <button
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--whatsapp-green)] hover:bg-[var(--bg-hover)] shrink-0 transition border-0 bg-transparent cursor-pointer"
                    title={`${call.type === "video" ? "Video" : "Voice"} call`}
                    onClick={() => {
                      if (onStartCall) {
                        const fallbackUser = {
                          userId: otherUserId,
                          username: otherUsername || otherUserId
                        };
                        onStartCall(call.type || "audio", otherUser || fallbackUser);
                      }
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {call.type === "video" ? (
                        <path d="M23 7l-7 5 7 5V7z M1 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5z" />
                      ) : (
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.27 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      )}
                    </svg>
                  </button>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default SidebarCalls;
