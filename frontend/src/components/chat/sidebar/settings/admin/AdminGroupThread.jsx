import React, { useState, useEffect, useRef } from "react";
import api from "../../../../../services/api";

const fmt = (iso) =>
  new Date(iso).toLocaleString([], { dateStyle: "short", timeStyle: "short" });

const Avatar = ({ name, url, size = "w-10 h-10" }) => (
  <div
    className={`${size} rounded-full bg-[var(--whatsapp-teal)]/20 border border-[var(--border-light)] flex items-center justify-center text-sm font-bold text-[var(--whatsapp-green)] shrink-0 overflow-hidden`}
  >
    {url ? (
      <img src={url} alt={name} className="w-full h-full object-cover" />
    ) : (
      (name || "?").substring(0, 2).toUpperCase()
    )}
  </div>
);

// ── 3-dot kebab menu ──
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
        className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition"
        title="More actions"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 bg-[var(--bg-sidebar)] border border-[var(--border-light)] rounded-xl shadow-2xl overflow-hidden min-w-[180px]">
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

// ── Message bubble ──
const MsgBubble = ({ msg, onDelete }) => {
  const [hovered, setHovered] = useState(false);
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
      className="flex justify-start mb-2 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-light)] rounded-bl-sm flex flex-col">
        <div className="flex justify-between items-center gap-4 mb-0.5">
          <span className="font-semibold text-[10px] text-[var(--whatsapp-green)]">
            {msg.senderUsername || "Sender"}
          </span>
          <span className="text-[9px] text-[var(--text-secondary)]">
            {fmt(msg.createdAt)}
          </span>
        </div>
        {msg.mediaUrl && (
          <a href={msg.mediaUrl} target="_blank" rel="noreferrer"
            className="block mb-1 text-[10px] underline opacity-70">📎 Attachment</a>
        )}
        <p className="whitespace-pre-wrap break-words">{msg.text || msg.content}</p>
      </div>

      {hovered && (
        <button
          onClick={() => onDelete(msg._id)}
          title="Delete this message silently (admin)"
          className="self-center ml-2 w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 flex items-center justify-center transition"
        >
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
          </svg>
        </button>
      )}
    </div>
  );
};

// ── Members List Modal ──
const MembersModal = ({ isOpen, onClose, title, members, onKick, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
      <div className="bg-[var(--bg-sidebar)] border border-[var(--border-light)] rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] shadow-2xl">
        <div className="p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-black/10">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">{title}</h3>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition text-xs font-semibold">✕ Close</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center text-xs text-[var(--text-secondary)] py-6">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="text-center text-xs text-[var(--text-secondary)] py-6">No members found.</div>
          ) : (
            members.map(m => (
              <div key={m.userId} className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-input)]/30 border border-[var(--border-light)]/40">
                <div className="flex items-center gap-3">
                  <Avatar name={m.username} url={m.profilePicture} size="w-8 h-8" />
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      {m.username}
                      {m.isAdmin && <span className="bg-[var(--whatsapp-teal)]/20 text-[var(--whatsapp-green)] text-[9px] px-1.5 py-0.5 rounded-full font-bold">Admin</span>}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)]">{m.email}</div>
                  </div>
                </div>
                {!m.isAdmin && m.role !== "admin" && (
                  <button
                    onClick={() => onKick(m.userId)}
                    className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition text-[10px] font-bold"
                  >
                    Kick
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminGroupThread({ activeItem, activeTab, onRefreshList }) {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // Members Modal
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [membersList, setMembersList] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const loadMessages = async () => {
    if (!activeItem) return;
    setLoadingMessages(true);
    try {
      const isGroup = activeTab === "groups";
      const path = isGroup
        ? `/admin/groups/${activeItem.groupId}/messages`
        : `/admin/channels/${activeItem.channelId}/messages`;
      const r = await api.get(path);
      setMessages(r.data || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeItem) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [activeItem]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to permanently delete this message silently?")) return;
    try {
      await api.delete(`/admin/messages/${messageId}`);
      setMessages(prev => prev.filter(m => m._id !== messageId));
    } catch (err) {
      alert("Failed to delete message: " + (err.response?.data?.error || err.message));
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm(`Are you sure you want to delete ALL messages in this ${activeTab === "groups" ? "group" : "channel"}?`)) return;
    try {
      for (const msg of messages) {
        await api.delete(`/admin/messages/${msg._id}`);
      }
      setMessages([]);
    } catch (err) {
      alert("Failed to delete all messages: " + err.message);
    }
  };

  const handleOpenMembers = async () => {
    if (!activeItem) return;
    setMembersModalOpen(true);
    setLoadingMembers(true);
    try {
      const isGroup = activeTab === "groups";
      const path = isGroup
        ? `/admin/groups/${activeItem.groupId}/members`
        : `/admin/channels/${activeItem.channelId}/followers`;
      const r = await api.get(path);
      setMembersList(r.data || []);
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleKickMember = async (userId) => {
    if (!activeItem) return;
    const itemType = activeTab === "groups" ? "group" : "channel";
    if (!window.confirm(`Are you sure you want to silently kick this user from this ${itemType}?`)) return;
    
    try {
      const isGroup = activeTab === "groups";
      const path = isGroup
        ? `/admin/groups/${activeItem.groupId}/members/${userId}`
        : `/admin/channels/${activeItem.channelId}/followers/${userId}`;
      await api.delete(path);
      setMembersList(prev => prev.filter(m => m.userId !== userId));
      onRefreshList?.();
    } catch (err) {
      alert("Failed to kick user: " + (err.response?.data?.error || err.message));
    }
  };

  if (!activeItem) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
        <div className="w-16 h-16 rounded-full bg-[var(--whatsapp-teal)]/10 text-[var(--whatsapp-green)] flex items-center justify-center text-2xl">
          🛡️
        </div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Admin Moderation Pane</h3>
        <p className="text-xs text-[var(--text-secondary)] max-w-xs">
          Select a group, community chat, or channel from the side list to monitor messages, view members, delete content silently, or manage users.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col text-[var(--text-primary)] bg-[var(--bg-sidebar)]">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-black/10 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <Avatar name={activeItem.name} url={activeItem.avatarUrl} size="w-10 h-10" />
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{activeItem.name}</h3>
              <p className="text-[10px] text-[var(--text-secondary)]">
                {activeTab === "groups"
                  ? `${activeItem.memberCount} members · Group Monitoring`
                  : `${activeItem.followerCount} followers · Channel Monitoring`}
              </p>
            </div>
          </div>
          
          <KebabMenu
            items={[
              {
                label: activeTab === "groups" ? "View Members" : "View Followers",
                icon: "👥",
                onClick: handleOpenMembers,
              },
              {
                label: "Clear All Messages",
                icon: "🧹",
                danger: true,
                onClick: handleClearChat,
              }
            ]}
          />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[var(--bg-chat)]/30">
          {loadingMessages ? (
            <div className="h-full flex items-center justify-center text-xs text-[var(--text-secondary)]">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[var(--text-secondary)]">No message history.</div>
          ) : (
            messages.map(msg => (
              <MsgBubble
                key={msg._id}
                msg={msg}
                onDelete={handleDeleteMessage}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Members Modal */}
      <MembersModal
        isOpen={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        title={activeTab === "groups" ? `Group Members (${membersList.length})` : `Channel Followers (${membersList.length})`}
        members={membersList}
        loading={loadingMembers}
        onKick={handleKickMember}
      />
    </div>
  );
}
