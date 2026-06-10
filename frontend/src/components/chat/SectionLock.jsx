import React, { useState, useRef, useEffect } from 'react';
import userService from '../../services/userService';

const SectionLock = ({ onUnlock, onCancel, onGoToSettings, title = "Locked Section", currentUser }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  const handleAction = async (pinValue = pin) => {
    if (!currentUser?.hasPin || !pinValue) return;
    try {
      await userService.verifyAppPin(pinValue);
      onUnlock();
    } catch (err) {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 500);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      handleAction(pin);
    }
  }, [pin]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10000]" onClick={onCancel}>
      <div className={`bg-[var(--bg-sidebar)] p-6 rounded-3xl text-center w-[90%] max-w-[320px] shadow-2xl border border-[var(--border-light)] flex flex-col items-center gap-4 ${error ? 'animate-pulse' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="text-4xl">{currentUser?.hasPin ? "🔒" : "🛡️"}</div>
        <h3 className="text-[var(--text-primary)] text-xl font-bold m-0">{title}</h3>
        
        {currentUser?.hasPin ? (
          <>
            <p className="text-[var(--text-secondary)] text-[14px] m-0">Enter PIN to continue</p>
            <div 
              className="flex justify-center gap-3 py-1 cursor-pointer" 
              onClick={() => inputRef.current?.focus()}
            >
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${pin.length > i ? 'bg-[var(--whatsapp-green)] border-[var(--whatsapp-green)] scale-110' : 'border-[var(--border-light)]'}`} />
              ))}
            </div>
            <input
              ref={inputRef}
              type="password"
              maxLength={4}
              pattern="\d*"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g,''))}
              onKeyUp={(e) => e.key === 'Enter' && handleAction()}
              autoFocus
              className="sr-only"
            />
            <div className="flex w-full gap-3 mt-2 items-center justify-center">
              <button className="flex-1 py-2.5 px-3 rounded-xl border border-[var(--border-light)] font-semibold cursor-pointer transition-colors bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]" onClick={onCancel}>Cancel</button>
              <button className="flex-1 py-2.5 px-3 rounded-xl border border-transparent font-semibold cursor-pointer transition-colors bg-[var(--whatsapp-green)] text-white hover:bg-[var(--whatsapp-dark-green)] disabled:opacity-50" onClick={() => handleAction()} disabled={pin.length < 4}>Unlock</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[var(--text-secondary)] text-[14px] m-0 leading-relaxed">
              Two-step verification is not enabled. Please set a PIN in Settings to access this section.
            </p>
            <div className="flex gap-3 justify-center w-full mt-2">
              <button className="w-full py-2.5 px-4 bg-[var(--whatsapp-green)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--whatsapp-dark-green)] transition-all border border-transparent cursor-pointer" onClick={onGoToSettings}>Go to Settings</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SectionLock;
