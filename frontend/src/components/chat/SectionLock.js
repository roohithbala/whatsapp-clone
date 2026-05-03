import React, { useState } from 'react';
import userService from '../../services/userService';
import './SectionLock.css';

const SectionLock = ({ onUnlock, onCancel, title = "Locked Section", currentUser }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleAction = async () => {
    if (!currentUser?.hasPin) return;
    try {
      await userService.verifyAppPin(pin);
      onUnlock();
    } catch (err) {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="section-lock-overlay" onClick={onCancel}>
      <div className={`section-lock-container ${error ? 'shake' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="lock-icon">{currentUser?.hasPin ? "🔒" : "🛡️"}</div>
        <h3>{title}</h3>
        
        {currentUser?.hasPin ? (
          <>
            <p>Enter PIN to continue</p>
            <div className="pin-input-row">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`pin-dot ${pin.length > i ? 'filled' : ''}`} />
              ))}
            </div>
            <input
              type="password"
              maxLength={4}
              pattern="\d*"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g,''))}
              onKeyUp={(e) => e.key === 'Enter' && handleAction()}
              autoFocus
              className="hidden-pin-input"
            />
            <div className="lock-actions">
              <button className="cancel-btn" onClick={onCancel}>Cancel</button>
              <button className="unlock-btn" onClick={handleAction} disabled={pin.length < 4}>Unlock</button>
            </div>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Two-step verification is not enabled. Please set a PIN in Settings to access this section.
            </p>
            <div className="lock-actions" style={{ justifyContent: 'center' }}>
              <button className="professional-button" onClick={onCancel}>Go to Settings</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SectionLock;
