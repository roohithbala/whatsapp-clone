import React, { useState, useEffect, useCallback } from 'react';
import './StoryViewer.css';
import api from '../../../services/api';
import statusService from '../../../services/statusService';

const StoryViewer = ({ status, onClose }) => {
  const { user, stories } = status;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentStory = stories[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  useEffect(() => {
    if (!currentStory) return;
    
    // Mark as viewed
    statusService.markStatusAsViewed(currentStory._id).catch(err => console.error("Error marking viewed:", err));

    const duration = currentStory.type === 'video' ? 10000 : 5000; // 10s for video, 5s for text/image
    const step = 100 / (duration / 50);
    
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          handleNext();
          return 0;
        }
        return p + step;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [currentStory, handleNext]);

  const [replyText, setReplyText] = useState("");

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    try {
      await api.post("/messages", {
        receiverId: user.userId,
        text: `Replying to status: ${replyText}`,
        messageType: 'text'
      });
      setReplyText("");
      onClose();
      alert("Reply sent!");
    } catch (e) {
      console.error("Reply failed", e);
    }
  };

  const handleReaction = async (emoji) => {
    try {
       await api.post("/messages", {
         receiverId: user.userId,
         text: emoji,
         messageType: 'text'
       });
       onClose();
       alert(`Reacted with ${emoji}`);
    } catch (e) { console.error("Reaction failed", e); }
  };

  if (!currentStory) return null;

  return (
    <div className="story-viewer-overlay">
      <div className="story-viewer-content">
        <div className="story-header">
          <div className="story-progress-container">
            {stories.map((_, idx) => (
              <div key={idx} className="story-progress-track">
                <div 
                  className="story-progress-bar" 
                  style={{ 
                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                  }} 
                />
              </div>
            ))}
          </div>
          <div className="story-user-info">
            <div className="story-avatar">{user?.username?.[0].toUpperCase()}</div>
            <div className="story-name">
              <div style={{ fontWeight: 600 }}>{user?.username}</div>
              <div className="story-time">{new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <button className="story-close" onClick={onClose}>&times;</button>
          </div>
        </div>
        
        <div className="story-media-container" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x < rect.width / 3) handlePrev();
          else handleNext();
        }}>
          {currentStory.type === 'image' && <img src={currentStory.mediaUrl} alt="status" className="story-img" />}
          {currentStory.type === 'video' && <video src={currentStory.mediaUrl} autoPlay muted className="story-video" />}
          {currentStory.type === 'text' && (
            <div className="story-text-content" style={{ 
              background: currentStory.backgroundColor || 'var(--whatsapp-green)', 
              fontFamily: currentStory.fontFamily || 'inherit',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', textAlign: 'center', padding: '40px', width: '100%', height: '100%' 
            }}>
              {currentStory.text}
            </div>
          )}
          <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '12px', pointerEvents: 'none' }}>
             ▲ Swipe up to reply
          </div>
        </div>

        <div className="story-footer">
          <div className="story-reactions">
            {['❤️', '😂', '😮', '😢', '🙏', '🔥'].map(emoji => (
              <button key={emoji} onClick={() => handleReaction(emoji)} className="reaction-btn">{emoji}</button>
            ))}
          </div>
          <div className="story-reply-box">
            <input 
              type="text" 
              placeholder="Reply..." 
              className="story-reply-input" 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <button className="story-send" onClick={handleSendReply}>➤</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
