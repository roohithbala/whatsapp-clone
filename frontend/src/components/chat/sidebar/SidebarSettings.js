import React, { useState } from 'react';
import userService from '../../../services/userService';

const SidebarSettings = ({ setRailMode, setAppLocked, theme, setTheme, currentUser, onUpdateSettings, users }) => {
  const [activeView, setActiveView] = useState("main");
  const [readReceipts, setReadReceipts] = useState(currentUser?.privacy?.readReceipts ?? true);
  const [notifications, setNotifications] = useState(currentUser?.privacy?.notifications ?? true);
  const [disappearing, setDisappearing] = useState(currentUser?.disappearingMessages ?? false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

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
            <button className={`settings-toggle ${disappearing ? 'on' : ''}`} onClick={() => { 
              const newVal = !disappearing;
              setDisappearing(newVal); 
              saveSetting("disappearingMessages", newVal ? "7d" : "off"); 
            }}></button>
          </div>
          <div className="settings-item" onClick={() => setActiveView("blocked")}>
            <div className="settings-item-text">
              <h4>Blocked contacts</h4>
              <p>{currentUser?.blockedUsers?.length || 0} contacts</p>
            </div>
            <div className="settings-item-icon">›</div>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === "blocked") {
    return (
      <div className="sidebar-content-view">
        <div className="sidebar-view-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="icon-button" onClick={() => setActiveView("privacy")}>←</button>
          <h2>Blocked</h2>
        </div>
        <div className="settings-list">
          {currentUser?.blockedUsers?.map(userId => {
             const user = users?.find(u => String(u.userId) === String(userId));
             return (
               <div key={userId} className="settings-item">
                 <div className="settings-item-text">
                   <h4>{user?.username || userId}</h4>
                 </div>
                 <button className="text-button" style={{ color: 'var(--whatsapp-green)' }} onClick={async () => {
                    try {
                      await userService.unblockUser(userId);
                      if (onUpdateSettings) onUpdateSettings({ blockedUsers: currentUser.blockedUsers.filter(id => id !== userId) });
                    } catch (e) { alert("Failed to unblock"); }
                 }}>Unblock</button>
               </div>
             );
          })}
          {(!currentUser?.blockedUsers || currentUser.blockedUsers.length === 0) && (
            <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No blocked contacts</p>
          )}
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
  }  if (activeView === "security") {
    return (
      <div className="sidebar-content-view">
        <div className="sidebar-view-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="icon-button" onClick={() => setActiveView("main")}>←</button>
          <h2>Two-step verification</h2>
        </div>
        <div style={{ padding: '24px 16px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            For added security, enable two-step verification, which will require a PIN when accessing locked chats.
          </p>
          <div className="settings-item-text" style={{ marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '8px' }}>{currentUser.hasPin ? "Change PIN" : "Set PIN"}</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="password" 
                maxLength="4" 
                placeholder="4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                style={{ 
                  background: 'var(--bg-light)', 
                  border: '1px solid var(--border-light)', 
                  color: 'var(--text-primary)',
                  padding: '12px',
                  borderRadius: '8px',
                  width: '120px',
                  fontSize: '18px',
                  letterSpacing: '4px',
                  textAlign: 'center'
                }}
              />
              <button 
                className="professional-button"
                disabled={pin.length < 4}
                onClick={async () => {
                  try {
                    await userService.updateSettings(currentUser.userId, { appPin: pin });
                    setPin("");
                    setPinError("");
                    if (onUpdateSettings) await onUpdateSettings();
                    alert("PIN updated successfully!");
                    setActiveView("main");
                  } catch (e) { setPinError("Failed to update PIN"); }
                }}
              >Save</button>
            </div>
            {pinError && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{pinError}</p>}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="sidebar-content-view">
      <div className="settings-profile-header" onClick={() => setRailMode("profile")} style={{ display: 'flex', alignItems: 'center', padding: '16px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', marginBottom: '8px', background: 'rgba(255, 255, 255, 0.03)' }}>
        <div className="settings-avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--whatsapp-green)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '24px', fontWeight: 700, marginRight: '16px', flexShrink: 0 }}>
          {currentUser?.username?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="settings-profile-info" style={{ flex: 1, minWidth: 0 }}>
          <div className="settings-profile-name" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.username || "User"}
          </div>
          <div className="settings-profile-status" style={{ fontSize: '14px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.status || "Hey there! I am using WhatsApp."}
          </div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '20px' }}>›</div>
      </div>
      <div className="settings-list">
        <div className="settings-item" onClick={() => setRailMode("profile")}>
          <div className="settings-item-icon">👤</div>
          <div className="settings-item-text">
            <h4>Profile</h4>
            <p>Name, about, profile photo</p>
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
        <div className="settings-item" onClick={() => setActiveView("security")}>
          <div className="settings-item-icon">🛡️</div>
          <div className="settings-item-text">
            <h4>Security</h4>
            <p>Two-step verification, PIN setup</p>
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
