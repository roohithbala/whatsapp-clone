import React from 'react';
import './ReactionInfoModal.css';

const ReactionInfoModal = ({ reactions, users, onClose }) => {
  const getUsername = (userId) => {
    const user = users.find(u => u.userId === userId);
    return user ? user.username : "Unknown User";
  };

  return (
    <div className="whatsapp-modal-overlay" onClick={onClose}>
      <div className="whatsapp-modal reaction-info-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Reactions</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="reaction-tabs">
          <div className="reaction-tab active">All {reactions.length}</div>
        </div>
        <div className="reaction-list">
          {reactions.map((r, i) => (
            <div key={i} className="reaction-item">
              <div className="reaction-user-info">
                <div className="reaction-avatar">
                  {getUsername(r.userId).charAt(0).toUpperCase()}
                </div>
                <div className="reaction-username">{getUsername(r.userId)}</div>
              </div>
              <div className="reaction-emoji">{r.emoji}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReactionInfoModal;
