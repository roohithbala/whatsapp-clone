import React, { useState } from 'react';
import userService from '../../../services/userService';

const SidebarSettings = ({ setRailMode, setAppLocked, theme, setTheme, currentUser, onUpdateSettings }) => {
  const [activeView, setActiveView] = useState("main");
  const [readReceipts, setReadReceipts] = useState(currentUser?.privacy?.readReceipts ?? true);
  const [notifications, setNotifications] = useState(currentUser?.privacy?.notifications ?? true);
  const [disappearing, setDisappearing] = useState(currentUser?.disappearingMessages ?? false);

  const savePrivacySetting = async (key, value) => {
    try {
      await userService.updateProfile(currentUser.userId, { privacy: { ...currentUser.privacy, [key]: value } });
      if (onUpdateSettings) onUpdateSettings({ privacy: { ...currentUser.privacy, [key]: value } });
    } catch (e) {
      console.error("Failed to save privacy setting", e);
    }
  };

  const saveSetting = async (key, value) => {
    try {
      await userService.updateSettings(currentUser.userId, { [key]: value });
      if (onUpdateSettings) onUpdateSettings({ [key]: value });
    } catch (e) {
      console.error("Failed to save setting", e);
    }
  };

  const handleNotificationToggle = async () => {
    const newVal = !notifications;
    setNotifications(newVal);
    savePrivacySetting("notifications", newVal);
    if (newVal && Notification.permission !== "granted") {
      await Notification.requestPermission();
    }
  };

  if (activeView === "privacy") {
    return (
      <div className="sidebar-content-view">
        <div className="sidebar-view-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="icon-button" onClick={() => setActiveView("main")}>←</button>
          <h2>Privacy</h2>
        </div>
        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-item-text">
              <h4>Read receipts</h4>
              <p>If turned off, you won't send or receive read receipts. Read receipts are always sent for group chats.</p>
            </div>
            <button className={`settings-toggle ${readReceipts ? 'on' : ''}`} onClick={() => { setReadReceipts(!readReceipts); savePrivacySetting("readReceipts", !readReceipts); }}></button>
          </div>
          <div className="settings-item">
            <div className="settings-item-text">
              <h4>Disappearing messages</h4>
              <p>Make new chats disappear after 7 days</p>
            </div>
            <button className={`settings-toggle ${disappearing ? 'on' : ''}`} onClick={() => { setDisappearing(!disappearing); saveSetting("disappearingMessages", !disappearing); }}></button>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === "notifications") {
    return (
      <div className="sidebar-content-view">
        <div className="sidebar-view-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="icon-button" onClick={() => setActiveView("main")}>←</button>
          <h2>Notifications</h2>
        </div>
        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-item-text">
              <h4>Desktop notifications</h4>
              <p>Receive push notifications when the app is in the background</p>
            </div>
            <button className={`settings-toggle ${notifications ? 'on' : ''}`} onClick={handleNotificationToggle}></button>
          </div>
        </div>
      </div>
    );
  }

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
            <p>Security, profile information</p>
          </div>
        </div>
        <div className="settings-item" onClick={() => setActiveView("privacy")}>
          <div className="settings-item-icon">🔒</div>
          <div className="settings-item-text">
            <h4>Privacy</h4>
            <p>Block contacts, read receipts</p>
          </div>
        </div>
        <div className="settings-item" onClick={() => setActiveView("notifications")}>
          <div className="settings-item-icon">🔔</div>
          <div className="settings-item-text">
            <h4>Notifications</h4>
            <p>Message, group & call tones</p>
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
