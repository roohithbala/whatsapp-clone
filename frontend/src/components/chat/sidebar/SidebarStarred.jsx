import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { fetchStarredMessages, decryptIncomingMessage } from '../../../services/messageService';

const SidebarStarred = ({ currentUser, setRailMode }) => {
  const [starredMessages, setStarredMessages] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleUnstar = async (msgId) => {
    try {
      await api.post(`/messages/toggle-star/${msgId}`);
      setStarredMessages(prev => prev.filter(m => m._id !== msgId));
    } catch (e) {
      console.error("Unstar failed", e);
    }
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
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
        )}
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Starred Messages</h2>
      </div>
      <div className="flex-grow overflow-y-auto">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-sm text-[var(--text-secondary)]">Loading...</div>
        ) : starredMessages.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-12 text-center text-[var(--text-secondary)] h-full">
            <div className="text-5xl mb-4">⭐</div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">No starred messages</h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-[280px] leading-relaxed">
              Tap and hold on any message to star it, so you can easily find it later.
            </p>
          </div>
        ) : (
          starredMessages.map(msg => (
            <div key={msg._id} className="p-4 border-b border-[var(--border-light)] hover:bg-white/[0.02] relative transition duration-200 text-left">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {msg.senderUsername || "User"}
                </span>
                <div className="flex items-center gap-2">
                   <span className="text-xs text-[var(--text-muted)]">
                     {new Date(msg.createdAt).toLocaleDateString()}
                   </span>
                   <button 
                     onClick={() => handleUnstar(msg._id)}
                     className="bg-transparent border-none text-[var(--text-secondary)] hover:text-yellow-500 cursor-pointer p-1 transition"
                     title="Unstar"
                   >
                     ⭐
                   </button>
                </div>
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                {msg.text || (msg.mediaUrl ? '📷 Media' : 'Voice Message')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SidebarStarred;
