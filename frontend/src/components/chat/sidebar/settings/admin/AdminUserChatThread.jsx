import React, { useState, useEffect, useRef } from "react";
import api from "../../../../../services/api";
import { decryptMessageContent } from "../../../../../services/messageService";

const fmt = (iso) =>
  new Date(iso).toLocaleString([], { dateStyle: "short", timeStyle: "short" });

const Avatar = ({ user, size = "w-8 h-8" }) => (
  <div
    className={`${size} rounded-full bg-[var(--whatsapp-teal)]/20 border border-[var(--border-light)] flex items-center justify-center text-xs font-bold text-[var(--whatsapp-green)] shrink-0 overflow-hidden`}
  >
    {user?.profilePicture ? (
      <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
    ) : (
      (user?.username || "?").substring(0, 2).toUpperCase()
    )}
  </div>
);

// ── 3-dot kebab menu ──────────────────────────────────────────────────────────
const KebabMenu = ({ items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition"
        title="More actions"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 bg-[var(--bg-sidebar)] border border-[var(--border-light)] rounded-xl shadow-2xl overflow-hidden min-w-[170px]">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { item.onClick(); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[var(--bg-hover)] transition flex items-center gap-2 ${item.danger ? "text-red-400" : "text-[var(--text-primary)]"}`}
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Message bubble with per-message delete ────────────────────────────────────
const MsgBubble = ({ msg, subjectId, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const isMine = msg.senderId === subjectId;
  const isSystem = msg.messageType === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-1">
        <span className="px-3 py-1 rounded-full bg-[var(--bg-input)] text-[10px] text-[var(--text-secondary)] text-center max-w-[80%]">
          {msg.text}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1 group`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Delete button — appears on hover, left of bubble for sent, right for received */}
      {!isMine && hovered && (
        <button
          onClick={() => onDelete(msg._id)}
          title="Delete this message (admin)"
          className="self-center mr-1 w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
        >
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
          </svg>
        </button>
      )}

      <div
        className={`max-w-[78%] px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm ${
          isMine
            ? "bg-[var(--whatsapp-green)]/80 text-white rounded-br-sm"
            : "bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-light)] rounded-bl-sm"
        }`}
      >
        <p className={`font-semibold text-[10px] mb-0.5 ${isMine ? "text-white/70" : "text-[var(--whatsapp-green)]"}`}>
          {msg.senderUsername}
        </p>
        {msg.mediaUrl && (
          <a href={msg.mediaUrl} target="_blank" rel="noreferrer"
            className="block mb-1 text-[10px] underline opacity-70">📎 Attachment</a>
        )}
        {msg.text ? (
          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
        ) : msg.encryptedContent ? (
          <p className="italic opacity-60 flex items-center gap-1 text-[11px]">
            <span>🔒</span><span>Encrypted message</span>
          </p>
        ) : null}
        <p className={`text-[9px] mt-1 text-right ${isMine ? "text-white/50" : "text-[var(--text-secondary)]"}`}>
          {fmt(msg.createdAt)}
          {msg.isDeleted && " · deleted"}
        </p>
      </div>

      {/* Delete button — right side for sent messages */}
      {isMine && hovered && (
        <button
          onClick={() => onDelete(msg._id)}
          title="Delete this message (admin)"
          className="self-center ml-1 w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
        >
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default function AdminUserChatThread({ subject, partner, onBack, onUserBanned }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (!subject || !partner) return;
    setLoading(true);
    api.get(`/admin/users/${subject.userId}/thread/${partner.userId}`)
      .then(async (r) => {
        const rawMsgs = r.data || [];
        try {
          const decryptedMsgs = await Promise.all(
            rawMsgs.map(m => decryptMessageContent(m, subject.userId, partner.userId))
          );
          setMessages(decryptedMsgs);
        } catch (err) {
          console.error("Failed to decrypt thread messages:", err);
          setMessages(rawMsgs);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [subject, partner]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Delete a single message silently
  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm("Permanently delete this message? The user will not be notified.")) return;
    try {
      setActionBusy(true);
      await api.delete(`/admin/messages/${msgId}`);
      setMessages(prev => prev.filter(m => m._id !== msgId));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete message.");
    } finally {
      setActionBusy(false);
    }
  };

  // Silent ban — user sees only a generic community notice, never knows admin was here
  const handleSilentBan = async () => {
    const reason = window.prompt(
      `Silent ban ${partner.username}?\n\nEnter the reason (this will appear in a generic community-notice system message to the user, NOT attributed to admin monitoring):`
    );
    if (reason === null) return; // cancelled
    try {
      setActionBusy(true);
      await api.post(`/admin/users/${partner.userId}/silent-ban`, { reason });
      alert(`✅ ${partner.username} has been silently suspended. A generic community notice was delivered to them.`);
      if (onUserBanned) onUserBanned(partner.userId);
      onBack?.();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to ban user.");
    } finally {
      setActionBusy(false);
    }
  };

  const kebabItems = [
    {
      label: `Ban ${partner.username}`,
      icon: "🚫",
      danger: true,
      onClick: handleSilentBan,
    },
    {
      label: "Delete ALL messages",
      icon: "🗑️",
      danger: true,
      onClick: async () => {
        if (!window.confirm(`Permanently delete ALL messages between ${subject.username} and ${partner.username}? This cannot be undone.`)) return;
        try {
          setActionBusy(true);
          // Delete each message individually
          await Promise.all(messages.map(m => api.delete(`/admin/messages/${m._id}`).catch(() => {})));
          setMessages([]);
        } catch (err) {
          alert("Some messages could not be deleted.");
        } finally {
          setActionBusy(false);
        }
      },
    },
  ];

  if (!partner) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl animate-pulse">
          🔒
        </div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Admin Chat Auditor</h3>
        <p className="text-xs text-[var(--text-secondary)] max-w-xs">
          Select an active user conversation from the sidebar list to audit messages and moderate in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col text-[var(--text-primary)] bg-[var(--bg-sidebar)]">
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Thread header */}
        <div className="flex items-center gap-3 p-3 border-b border-[var(--border-light)] bg-[var(--bg-sidebar-alt)] shrink-0 z-10">
          <Avatar user={partner} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[var(--text-primary)] truncate">
              {subject.username} ↔ {partner.username}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)]">{messages.length} messages</p>
          </div>

          {/* 3-dot menu */}
          {actionBusy ? (
            <div className="w-5 h-5 border-2 border-[var(--whatsapp-green)] border-t-transparent rounded-full animate-spin" />
          ) : (
            <KebabMenu items={kebabItems} />
          )}
        </div>

        {/* Admin action hint */}
        <div className="px-3 pt-2 pb-1 shrink-0 border-b border-[var(--border-light)]/40 bg-black/10">
          <p className="text-[9px] text-amber-400/80 italic text-center">
            🛡️ Admin audit mode — hover and click the trash can next to any message to delete it silently.
          </p>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-0.5 bg-[var(--bg-chat)]/30">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[var(--whatsapp-green)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] text-center py-10">No messages in this conversation.</p>
          ) : (
            messages.map(m => (
              <MsgBubble
                key={m._id}
                msg={m}
                subjectId={subject.userId}
                onDelete={handleDeleteMessage}
              />
            ))
          )}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}
