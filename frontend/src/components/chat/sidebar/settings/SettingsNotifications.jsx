import React from 'react';

const SettingsNotifications = ({ onBack, notifications, onToggle }) => {
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
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Notifications</h2>
      </div>
      <div className="settings-list flex-1 overflow-y-auto">
        <div className="settings-item flex items-center justify-between p-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition select-none text-left">
          <div className="settings-item-text flex-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Desktop notifications</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Receive push notifications when the app is in the background</p>
          </div>
          <button className={`settings-toggle ${notifications ? 'on' : ''}`} onClick={onToggle}></button>
        </div>
      </div>
    </div>
  );
};

export default SettingsNotifications;
