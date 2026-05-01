import React from 'react';

const StatusPlaceholder = () => {
  return (
    <div className="status-placeholder">
      <div className="status-placeholder-content">
        <div className="status-placeholder-icon">
          <svg viewBox="0 0 24 24" width="100" height="100">
            <path fill="#d1d7db" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.5-9h-9c-.28 0-.5.22-.5.5s.22.5.5.5h9c.28 0 .5-.22.5-.5s-.22-.5-.5-.5z"/>
          </svg>
        </div>
        <h2>Share status updates</h2>
        <p>Share photos, videos and text that disappear after 24 hours.</p>
      </div>
    </div>
  );
};

export default StatusPlaceholder;
