import React, { useState, useEffect } from 'react';

const StoryViewer = ({ status, onClose }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { onClose(); return 100; }
        return p + 1;
      });
    }, 50); // 5 seconds total
    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div className="story-viewer-overlay">
      <div className="story-viewer-bg" style={{ backgroundImage: `url(${status.mediaUrl})` }} />
      <div className="story-viewer-content">
        <div className="story-header">
          <div className="story-progress-container">
            <div className="story-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="story-user-info">
            <div className="story-avatar">👤</div>
            <div className="story-name">User {status.userId?.substring(0, 5)}</div>
            <button className="story-close" onClick={onClose}>&times;</button>
          </div>
        </div>
        
        <div className="story-media-container">
          {status.mediaUrl ? (
            <img src={status.mediaUrl} alt="status" className="story-img" />
          ) : (
            <div className="story-text-content">{status.text}</div>
          )}
        </div>

        <div className="story-footer">
          <input type="text" placeholder="Type a reply..." className="story-reply-input" />
          <button className="story-send">➤</button>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
