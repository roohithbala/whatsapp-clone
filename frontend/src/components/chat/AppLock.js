import React, { useState, useEffect } from 'react';
import './AppLock.css';
import userService from '../../services/userService';

const AppLock = ({ onUnlock, currentUser }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [mode, setMode] = useState('unlock'); // 'unlock' or 'setup'
  const [setupStep, setSetupStep] = useState(1);
  const [tempPin, setTempPin] = useState('');

  useEffect(() => {
    if (currentUser && !currentUser.hasPin) {
      setMode('setup');
    }
  }, [currentUser]);

  const handleAction = async () => {
    if (mode === 'unlock') {
      try {
        await userService.verifyPin(currentUser.userId, pin);
        onUnlock();
      } catch (err) {
        triggerError();
      }
    } else if (mode === 'setup') {
      if (pin.length < 4) return;
      if (setupStep === 1) {
        setTempPin(pin);
        setSetupStep(2);
        setPin('');
      } else {
        if (pin === tempPin) {
          try {
            await userService.updateSettings(currentUser.userId, { appPin: pin, isAppLocked: false });
            onUnlock();
          } catch (err) {
            console.error("Failed to save PIN", err);
            triggerError();
          }
        } else {
          triggerError();
          setSetupStep(1);
          setPin('');
        }
      }
    }
  };

  const triggerError = () => {
    setError(true);
    setPin('');
    setTimeout(() => setError(false), 500);
  };

  const title = mode === 'setup' 
    ? (setupStep === 1 ? 'Set a PIN' : 'Confirm PIN') 
    : 'WhatsApp is Locked';
  
  const subtitle = mode === 'setup'
    ? 'Enter a 4-digit PIN for extra security'
    : 'Enter your PIN to continue';

  return (
    <div className="app-lock-overlay">
      <div className={`app-lock-container ${error ? 'shake' : ''}`}>
        <div className="lock-icon">{mode === 'setup' ? '🛡️' : '🔒'}</div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
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
        <button className="unlock-btn" onClick={handleAction}>
          {mode === 'setup' ? (setupStep === 1 ? 'Next' : 'Setup') : 'Unlock'}
        </button>
      </div>
    </div>
  );
};

export default AppLock;
