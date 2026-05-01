import React from 'react';

const SidebarSettings = ({ setRailMode, setAppLocked, theme, setTheme }) => {
  return (
    <div className="sidebar-content-view">
      <div className="settings-view-header">
        <h3>Settings</h3>
      </div>
      <div className="settings-list">
        <div className="settings-item" onClick={() => setRailMode("profile")}>
          <div className="settings-item-icon">👤</div>
          <div className="settings-item-text">
            <h4>Account</h4>
            <p>Security, change number</p>
          </div>
        </div>
        <div className="settings-item">
          <div className="settings-item-icon">🔒</div>
          <div className="settings-item-text">
            <h4>Privacy</h4>
            <p>Block contacts, disappearing messages</p>
          </div>
        </div>
        <div className="settings-item" onClick={() => alert("Backing up to cloud...")}>
          <div className="settings-item-icon">☁️</div>
          <div className="settings-item-text">
            <h4>Backup</h4>
            <p>Chat history, media backup</p>
          </div>
        </div>
        <div className="settings-item" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <div className="settings-item-icon">{theme === "dark" ? "☀️" : "🌙"}</div>
          <div className="settings-item-text">
            <h4>Theme</h4>
            <p>Switch to {theme === "dark" ? "light" : "dark"} mode</p>
          </div>
        </div>
        <div className="settings-item" onClick={() => setAppLocked(true)}>
          <div className="settings-item-icon">🔑</div>
          <div className="settings-item-text">
            <h4>App Lock</h4>
            <p>Require password to open</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarSettings;
