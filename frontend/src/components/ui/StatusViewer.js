import React, { useState, useEffect } from 'react';
import './StatusViewer.css';

const StatusViewer = ({ statuses, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!statuses || statuses.length === 0) return;

    const timer = setTimeout(() => {
      if (currentIndex < statuses.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onClose();
      }
    }, 5000); // 5 seconds per status

    return () => clearTimeout(timer);
  }, [currentIndex, statuses, onClose]);

  if (!statuses || statuses.length === 0) return null;

  const currentStatus = statuses[currentIndex];

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="status-viewer-overlay">
      <div className="status-viewer-header">
        <div className="status-progress-bars">
          {statuses.map((s, i) => (
            <div key={i} className="status-progress-bar-container">
              <div 
                className={`status-progress-bar ${i < currentIndex ? 'completed' : i === currentIndex ? 'active' : ''}`}
                style={{ animationDuration: i === currentIndex ? '5s' : '0s' }}
              ></div>
            </div>
          ))}
        </div>
        <div className="status-viewer-top-bar">
          <button onClick={onClose} className="status-close-btn">&times;</button>
        </div>
      </div>
      
      <div className="status-content" onClick={handleNext}>
        {currentStatus.mediaUrl && <img src={currentStatus.mediaUrl} alt="Status" className="status-media" />}
        {currentStatus.text && <div className="status-text">{currentStatus.text}</div>}
      </div>

      <button className="status-nav-left" onClick={(e) => { e.stopPropagation(); handlePrev(); }}>
        &#10094;
      </button>
      <button className="status-nav-right" onClick={(e) => { e.stopPropagation(); handleNext(); }}>
        &#10095;
      </button>
    </div>
  );
};

export default StatusViewer;
