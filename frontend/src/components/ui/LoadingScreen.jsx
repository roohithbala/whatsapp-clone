import React from 'react';

const LoadingScreen = ({ progress }) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <svg viewBox="0 0 24 24" width="80" height="80">
            <path fill="#cbd5e0" d="M12.011 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.761.459 3.413 1.258 4.854L2 22l5.305-1.391c1.401.745 2.991 1.171 4.679 1.171 5.513 0 10.016-4.49 10.016-10.003C22 6.476 17.525 2 12.011 2zm6.275 14.15c-.27.76-1.353 1.392-2.181 1.575-.572.127-1.316.226-3.83-.807-3.216-1.319-5.281-4.595-5.441-4.81-.16-.214-1.288-1.716-1.288-3.274 0-1.558.815-2.324 1.103-2.628.288-.304.63-.38.839-.38.21 0 .42.002.602.01.189.01.442-.07.693.535.252.606.862 2.096.936 2.247.075.15.126.326.026.526-.1.2-.149.324-.298.5-.149.176-.312.392-.444.526-.149.15-.306.314-.131.614.175.3.778 1.284 1.67 2.079.948.847 1.75 1.11 2.051 1.26.3.15.474.126.651-.075.176-.201.753-.876.953-1.178.2-.301.4-.251.676-.15.276.1.1.201 1.754.876.15.075.25.126.35.3.1.175.1.876-.171 1.636z"/>
          </svg>
        </div>
        <div className="loading-text">WhatsApp</div>
        <div className="loading-progress-container">
          <div className="loading-progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="loading-encryption">
          <svg viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
          End-to-end encrypted
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
