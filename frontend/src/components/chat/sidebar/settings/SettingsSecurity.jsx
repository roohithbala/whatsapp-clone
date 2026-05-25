import React, { useState } from 'react';
import userService from '../../../../services/userService';

const SettingsSecurity = ({ onBack, currentUser, onUpdateSettings }) => {
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const handleSavePin = async () => {
    try {
      await userService.updateSettings(currentUser.userId, { appPin: pin });
      setPin("");
      setPinError("");
      if (onUpdateSettings) await onUpdateSettings();
      alert("PIN updated successfully!");
      onBack();
    } catch (e) {
      setPinError("Failed to update PIN");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-sidebar)]">
      <div className="p-5 border-b border-[var(--border-light)] flex items-center gap-3 text-left bg-[var(--bg-sidebar-alt)]">
        <button 
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer transition duration-200" 
          onClick={onBack}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Two-step verification</h2>
      </div>
      <div className="p-6 px-4 text-left flex flex-col gap-4">
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          For added security, enable two-step verification, which will require a PIN when accessing locked chats.
        </p>
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{currentUser.hasPin ? "Change PIN" : "Set PIN"}</h4>
          <div className="flex gap-2.5">
            <input 
              type="password" 
              maxLength="4" 
              placeholder="4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="bg-[var(--bg-input)] border border-[var(--border-light)] text-[var(--text-primary)] p-3 rounded-lg w-[120px] text-lg tracking-[4px] text-center outline-none focus:border-[var(--whatsapp-green)] focus:ring-1 focus:ring-[var(--whatsapp-green)] transition"
            />
            <button 
              className="px-5 py-2.5 bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white text-sm font-semibold rounded-full shadow-md transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={pin.length < 4}
              onClick={handleSavePin}
            >Save</button>
          </div>
          {pinError && <p className="text-red-500 text-xs mt-1">{pinError}</p>}
        </div>
      </div>
    </div>
  );
};

export default SettingsSecurity;
