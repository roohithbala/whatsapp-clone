import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { fetchStarredMessages, decryptIncomingMessage } from '../../../services/messageService';

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

  /**
   * Navigate to the exact chat and scroll to the starred message.
   * Works like WhatsApp: opens the right chat, then jumps to the message.
   */
  const handleGoToMessage = (msg) => {
    if (!setSelectedUser || !users) return;

    // Determine chat partner: the other user in the conversation
    const peerId = msg.senderId === currentUser.userId ? msg.receiverId : msg.senderId;
    const peerGroupId = msg.groupId;

    let targetUser = null;

    if (peerGroupId) {
      // It's a group message
      targetUser = users.find(u => u.groupId === peerGroupId || u.userId === peerGroupId);
    } else {
      // It's a DM
      targetUser = users.find(u => u.userId === peerId);
    }

    if (!targetUser) return;

    setNavigatingTo(msg._id);

    // Switch to the chat
    setSelectedUser(targetUser);
    // Switch back to messages rail
    if (setRailMode) setRailMode("messages");

    // After the chat loads, scroll to the message
    const scrollToMsg = (attempts = 0) => {
      const el = document.querySelector(`[data-message-id="${msg._id}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Flash highlight like WhatsApp
        el.style.transition = "background 0.3s ease";
        el.style.background = "rgba(0, 217, 166, 0.18)";
        setTimeout(() => {
          el.style.background = "";
          setNavigatingTo(null);
        }, 1800);
      } else if (attempts < 12) {
        // Retry up to 12 times (600ms) while the chat is loading
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
            {starredMessages.map(msg => {
              const isNavigating = navigatingTo === msg._id;
              const chatName = getChatName(msg);
              const preview = getPreview(msg);
              const avatarLetter = chatName?.[0]?.toUpperCase() || "?";
              const pic = msg.senderProfilePicture;
              const picUrl = getAvatarUrl(pic);

              return (
                <div
                  key={msg._id}
                  className={`group flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all duration-200 relative select-none ${
                    isNavigating
                      ? "bg-[var(--whatsapp-green)]/10"
                      : "hover:bg-[var(--bg-hover)]"
                  }`}
                  onClick={() => handleGoToMessage(msg)}
                  title="Click to go to this message"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--whatsapp-green)] to-[var(--whatsapp-teal)] flex items-center justify-center font-bold text-sm text-white shrink-0 overflow-hidden shadow-sm">
                    {picUrl ? (
                      <img src={picUrl} alt={chatName} className="w-full h-full object-cover" onError={e => { e.target.style.display = "none"; }} />
                    ) : (
                      avatarLetter
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[13.5px] font-semibold text-[var(--text-primary)] truncate">
                        {chatName}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] shrink-0">
                        {new Date(msg.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[12.5px] text-[var(--text-secondary)] line-clamp-2 leading-snug">
                      {preview}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-center">
                    {isNavigating ? (
                      <div className="w-4 h-4 border-2 border-[var(--whatsapp-green)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {/* Go to chat arrow */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full text-[var(--whatsapp-green)]">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                        {/* Unstar button */}
                        <button
                          onClick={(e) => handleUnstar(msg._id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-none text-yellow-500 hover:text-[var(--text-muted)] cursor-pointer p-1 rounded-full hover:bg-[var(--bg-hover)] flex items-center justify-center"
                          title="Unstar message"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarStarred;
