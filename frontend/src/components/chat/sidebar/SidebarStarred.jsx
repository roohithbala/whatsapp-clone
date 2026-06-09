import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import { fetchStarredMessages, decryptIncomingMessage } from "../../../services/messageService";
import StarredMessageRow from "./starred/StarredMessageRow";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const SidebarStarred = ({ currentUser, setRailMode, users = [], setSelectedUser }) => {
  const [starredMessages, setStarredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navigatingTo, setNavigatingTo] = useState(null);

  useEffect(() => {
    const loadStarred = async () => {
      try {
        const msgs = await fetchStarredMessages();
        const decrypted = await Promise.all(msgs.map(m => 
          decryptIncomingMessage(m, currentUser.userId, m.senderId === currentUser.userId ? m.receiverId : m.senderId)
        ));
        setStarredMessages(decrypted);
      } catch (err) {
        console.error("Failed to fetch starred messages", err);
      } finally {
        setLoading(false);
      }
    };
    loadStarred();
  }, [currentUser.userId]);

  const handleUnstar = async (msgId, e) => {
    e.stopPropagation();
    try {
      await api.post(`/messages/toggle-star/${msgId}`);
      setStarredMessages(prev => prev.filter(m => m._id !== msgId));
    } catch (e) {
      console.error("Unstar failed", e);
    }
  };

  const handleGoToMessage = (msg) => {
    if (!setSelectedUser || !users) return;

    const peerId = msg.senderId === currentUser.userId ? msg.receiverId : msg.senderId;
    const peerGroupId = msg.groupId;

    let targetUser = null;

    if (peerGroupId) {
      targetUser = users.find(u => u.groupId === peerGroupId || u.userId === peerGroupId);
    } else {
      targetUser = users.find(u => u.userId === peerId);
    }

    if (!targetUser) return;

    setNavigatingTo(msg._id);
    setSelectedUser(targetUser);
    if (setRailMode) setRailMode("messages");

    const scrollToMsg = (attempts = 0) => {
      const el = document.querySelector(`[data-message-id="${msg._id}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.transition = "background 0.3s ease";
        el.style.background = "rgba(0, 217, 166, 0.18)";
        setTimeout(() => {
          el.style.background = "";
          setNavigatingTo(null);
        }, 1800);
      } else if (attempts < 12) {
        setTimeout(() => scrollToMsg(attempts + 1), 120);
      } else {
        setNavigatingTo(null);
      }
    };

    setTimeout(() => scrollToMsg(), 200);
  };

  const getAvatarUrl = (pic) => {
    if (!pic) return null;
    return pic.startsWith("http") ? pic : `${API_BASE}${pic}`;
  };

  const getPreview = (msg) => {
    if (msg.messageType === "image") return "📷 Photo";
    if (msg.messageType === "video") return "🎥 Video";
    if (msg.messageType === "audio") return "🎤 Voice Message";
    if (msg.messageType === "document") return `📄 ${msg.text || "Document"}`;
    if (msg.messageType === "poll") {
      try { return `📊 Poll: ${JSON.parse(msg.text).question}`; } catch { return "📊 Poll"; }
    }
    if (msg.messageType === "sticker") return "🎭 Sticker";
    return msg.text || "[Media]";
  };

  const getChatName = (msg) => {
    if (msg.senderUsername) return msg.senderUsername;
    const peerId = msg.senderId === currentUser.userId ? msg.receiverId : msg.senderId;
    const peer = users.find(u => u.userId === peerId);
    return peer?.username || peer?.name || "Unknown";
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-sidebar)]">
      <div className="px-5 py-4 border-b border-[var(--border-light)] flex items-center gap-3 text-left bg-[var(--bg-sidebar-alt)] shrink-0">
        {setRailMode && (
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer transition duration-200 shrink-0 border-0 bg-transparent" 
            onClick={() => setRailMode("messages")}
            title="Back to Chats"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
        )}
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Starred Messages</h2>
        {!loading && starredMessages.length > 0 && (
          <span className="ml-auto text-[11px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-input)] px-2 py-0.5 rounded-full">
            {starredMessages.length}
          </span>
        )}
      </div>

      <div className="flex-grow overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3">
            <div className="w-6 h-6 border-2 border-[var(--whatsapp-green)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--text-secondary)]">Loading starred messages...</span>
          </div>
        ) : starredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-[var(--text-secondary)] h-full gap-4">
            <div className="text-5xl">⭐</div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">No starred messages</h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-[280px] leading-relaxed">
              Star important messages to find them quickly. Tap ⋮ on any message and choose <em>Star</em>.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--border-light)]">
            {starredMessages.map(msg => (
              <StarredMessageRow
                key={msg._id}
                msg={msg}
                isNavigating={navigatingTo === msg._id}
                chatName={getChatName(msg)}
                preview={getPreview(msg)}
                avatarLetter={getChatName(msg)?.[0]?.toUpperCase() || "?"}
                picUrl={getAvatarUrl(msg.senderProfilePicture)}
                handleGoToMessage={handleGoToMessage}
                handleUnstar={handleUnstar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarStarred;
