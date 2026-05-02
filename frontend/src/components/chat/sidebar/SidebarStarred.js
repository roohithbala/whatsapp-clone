import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { fetchStarredMessages, decryptIncomingMessage } from '../../../services/messageService';

const SidebarStarred = ({ currentUser }) => {
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
    <div className="sidebar-content-view">
      <div className="chat-sidebar-header">
        <h2>Starred Messages</h2>
      </div>
      <div className="sidebar-scrollable">
        {loading ? (
          <div className="empty-state-centered">Loading...</div>
        ) : starredMessages.length === 0 ? (
          <div className="empty-state-centered" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', color: 'var(--icon-color)', marginBottom: '16px' }}>⭐</div>
            <h4 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>No starred messages</h4>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
              Tap and hold on any message to star it, so you can easily find it later.
            </p>
          </div>
        ) : (
          starredMessages.map(msg => (
            <div key={msg._id} className="starred-message-item" style={{ 
              padding: '12px 16px', borderBottom: '1px solid var(--border-light)', position: 'relative', transition: '0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span className="starred-msg-sender" style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {msg.senderUsername || "User"}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <span className="starred-msg-time" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                     {new Date(msg.createdAt).toLocaleDateString()}
                   </span>
                   <button 
                     onClick={() => handleUnstar(msg._id)}
                     style={{ background: 'none', border: 'none', color: 'var(--icon-color)', cursor: 'pointer', padding: '4px' }}
                     title="Unstar"
                   >
                     ⭐
                   </button>
                </div>
              </div>
              <div className="starred-msg-text" style={{ fontSize: '14px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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
