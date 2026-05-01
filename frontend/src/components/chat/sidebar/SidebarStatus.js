import React, { useState } from 'react';
import './SidebarStatus.css';

const SidebarStatus = ({ currentUser, onViewStory }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [myStatuses, setMyStatuses] = useState([]);

  const handlePostStatus = () => {
    if (!statusText.trim()) return;
    const newStatus = {
      id: Date.now(),
      text: statusText,
      timestamp: new Date(),
      type: 'text'
    };
    setMyStatuses([newStatus, ...myStatuses]);
    setStatusText("");
    setIsCreating(false);
  };

  return (
    <div className="sidebar-content-view">
      <div className="chat-sidebar-header">
        <h2>Status</h2>
      </div>

      <div className="sidebar-status-container">
        <div className="status-my-status">
          <div className="status-avatar-ring" onClick={() => myStatuses.length > 0 && onViewStory({ user: currentUser, stories: myStatuses })}>
            <div className="status-avatar">{currentUser?.username?.[0] || 'U'}</div>
            <div className="status-add-icon" onClick={(e) => { e.stopPropagation(); setIsCreating(true); }}>+</div>
          </div>
          <div className="status-info" onClick={() => setIsCreating(true)}>
            <div className="status-name">My Status</div>
            <div className="status-time">
              {myStatuses.length > 0 ? `Today at ${myStatuses[0].timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Tap to add status update"}
            </div>
          </div>
        </div>
        
        {isCreating && (
          <div className="status-creator-panel">
            <textarea 
              className="whatsapp-input" 
              placeholder="Type a status..." 
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              style={{ height: '100px', margin: '16px 0' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="professional-button" onClick={handlePostStatus}>Post Status</button>
              <button className="text-button" onClick={() => setIsCreating(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="status-section-title">RECENT UPDATES</div>
        
        <div className="status-list">
          <div className="status-empty-message">
            <p>No recent updates from your contacts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarStatus;
