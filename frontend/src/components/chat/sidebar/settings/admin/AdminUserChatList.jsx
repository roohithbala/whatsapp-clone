import React, { useState, useEffect } from "react";
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

export default function AdminUserChatList({ subject, activePartner, onSelectPartner, onBack }) {
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!subject) return;
    setLoading(true);
    api.get(`/admin/users/${subject.userId}/conversations`)
      .then(async (r) => {
        const rawConvos = r.data || [];
        try {
          const decryptedConvos = await Promise.all(
            rawConvos.map(async (c) => {
              if (c.lastMessage) {
                const decLast = await decryptMessageContent(c.lastMessage, subject.userId, c.partner.userId);
                return { ...c, lastMessage: decLast };
              }
              return c;
            })
          );
          setConvos(decryptedConvos);
        } catch (err) {
          console.error("Failed to decrypt conversation list:", err);
          setConvos(rawConvos);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [subject]);

  const filtered = convos.filter(c =>
    c.partner.username?.toLowerCase().includes(search.toLowerCase()) ||
    c.partner.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[var(--bg-sidebar)]">
      {/* Header with Back Button to go back to Users directory */}
      <div className="p-4 border-b border-[var(--border-light)] flex items-center gap-3 bg-[var(--bg-sidebar-alt)] shrink-0">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer transition"
          title="Back to Users"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
            📂 {subject.username}&apos;s Chats
          </h4>
          <p className="text-[10px] text-[var(--text-secondary)]">({convos.length} conversations)</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-[var(--border-light)] bg-black/10 shrink-0">
        <input
          type="text"
          placeholder="Search conversation partner..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-light)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--whatsapp-green)] transition"
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[var(--whatsapp-green)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-[var(--text-secondary)] text-center py-10">No conversations found.</p>
        ) : (
          filtered.map(c => {
            const isSelected = activePartner && activePartner.userId === c.partner.userId;
            return (
              <button
                key={c.partner.userId}
                onClick={() => onSelectPartner(c.partner)}
                className={`w-full flex items-center gap-3 p-3 border-b border-[var(--border-light)] transition text-left ${
                  isSelected ? "bg-[var(--bg-active)]" : "hover:bg-[var(--bg-hover)]"
                }`}
              >
                <Avatar user={c.partner} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{c.partner.username}</span>
                    <span className="text-[9px] text-[var(--text-secondary)] shrink-0 ml-2">
                      {c.lastMessage ? fmt(c.lastMessage.createdAt) : ""}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">
                    {c.lastMessage?.text || (c.lastMessage?.encryptedContent ? "🔒 Encrypted message" : c.lastMessage?.mediaUrl ? "📎 Media" : "No messages")}
                  </p>
                  <span className="text-[9px] text-[var(--whatsapp-green)] font-medium">
                    {c.totalMessages} message{c.totalMessages !== 1 ? "s" : ""}
                  </span>
                </div>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-secondary)] shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
