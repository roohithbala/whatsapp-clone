import React, { useState } from 'react';
import userService from '../../../services/userService';
import SettingsPrivacy from './settings/SettingsPrivacy';
import SettingsBlocked from './settings/SettingsBlocked';
import SettingsNotifications from './settings/SettingsNotifications';
import SettingsSecurity from './settings/SettingsSecurity';
import SettingsSessions from './settings/SettingsSessions';
import AdminDashboard from './settings/AdminDashboard';

const SidebarSettings = ({ setRailMode, theme, setTheme, currentUser, onUpdateSettings, users, onLogout }) => {
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
      <SettingsPrivacy 
        onBack={() => setActiveView("main")}
        readReceipts={readReceipts}
        setReadReceipts={setReadReceipts}
        disappearing={disappearing}
        setDisappearing={setDisappearing}
        blockedCount={currentUser?.blockedUsers?.length || 0}
        onViewBlocked={() => setActiveView("blocked")}
        savePrivacySetting={savePrivacySetting}
        saveSetting={saveSetting}
      />
    );
  }

  if (activeView === "blocked") {
    return (
      <SettingsBlocked 
        onBack={() => setActiveView("privacy")}
        currentUser={currentUser}
        users={users}
        onUpdateSettings={onUpdateSettings}
      />
    );
  }

  if (activeView === "notifications") {
    return (
      <SettingsNotifications 
        onBack={() => setActiveView("main")}
        notifications={notifications}
        onToggle={handleNotificationToggle}
      />
    );
  }

  if (activeView === "security") {
    return (
      <SettingsSecurity 
        onBack={() => setActiveView("main")}
        currentUser={currentUser}
        onUpdateSettings={onUpdateSettings}
      />
    );
  }

  if (activeView === "sessions") {
    return (
      <SettingsSessions 
        onBack={() => setActiveView("main")}
        currentUser={currentUser}
        onLogout={onLogout}
      />
    );
  }

  if (activeView === "admin") {
    return (
      <AdminDashboard 
        onBack={() => setActiveView("main")}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-sidebar)]">
      <div className="p-5 border-b border-[var(--border-light)] flex items-center gap-3 text-left bg-[var(--bg-sidebar-alt)]">
        {setRailMode && (
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer transition duration-200" 
            onClick={() => setRailMode("messages")}
            title="Back to Chats"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
        )}
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Settings</h2>
      </div>

      <div 
        className="flex items-center p-4 cursor-pointer border-b border-[var(--border-light)] mb-2 bg-white/[0.03] hover:bg-white/[0.05] transition"
        onClick={() => setRailMode("profile")} 
      >
        <div className="w-14 h-14 rounded-full bg-[var(--whatsapp-green)] text-white grid place-items-center text-2xl font-bold mr-4 shrink-0 shadow-sm">
          {currentUser?.username?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-lg font-semibold text-[var(--text-primary)] truncate">
            {currentUser?.username || "User"}
          </div>
          <div className="text-sm text-[var(--text-secondary)] truncate">
            {currentUser?.status || "Hey there! I am using WhatsApp."}
          </div>
        </div>
        <div className="text-[var(--text-muted)] text-xl">›</div>
      </div>
      
      <div className="settings-list flex-1 overflow-y-auto">
        <div className="settings-item flex items-center gap-4 p-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] cursor-pointer transition text-left" onClick={() => setRailMode("profile")}>
          <div className="settings-item-icon w-10 h-10 rounded-xl bg-[var(--bg-input)] flex items-center justify-center text-xl shrink-0">👤</div>
          <div className="settings-item-text flex-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Profile</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Name, about, profile photo</p>
          </div>
        </div>
        <div className="settings-item flex items-center gap-4 p-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] cursor-pointer transition text-left" onClick={() => setActiveView("privacy")}>
          <div className="settings-item-icon w-10 h-10 rounded-xl bg-[var(--bg-input)] flex items-center justify-center text-xl shrink-0">🔒</div>
          <div className="settings-item-text flex-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Privacy</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Block contacts, read receipts</p>
          </div>
        </div>
        <div className="settings-item flex items-center gap-4 p-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] cursor-pointer transition text-left" onClick={() => setActiveView("notifications")}>
          <div className="settings-item-icon w-10 h-10 rounded-xl bg-[var(--bg-input)] flex items-center justify-center text-xl shrink-0">🔔</div>
          <div className="settings-item-text flex-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Message, group & call tones</p>
          </div>
        </div>
        <div className="settings-item flex items-center gap-4 p-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] cursor-pointer transition text-left" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <div className="settings-item-icon w-10 h-10 rounded-xl bg-[var(--bg-input)] flex items-center justify-center text-xl shrink-0">{theme === "dark" ? "☀️" : "🌙"}</div>
          <div className="settings-item-text flex-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Theme</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Switch to {theme === "dark" ? "light" : "dark"} mode</p>
          </div>
        </div>
        <div className="settings-item flex items-center gap-4 p-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] cursor-pointer transition text-left" onClick={() => setActiveView("security")}>
          <div className="settings-item-icon w-10 h-10 rounded-xl bg-[var(--bg-input)] flex items-center justify-center text-xl shrink-0">🛡️</div>
          <div className="settings-item-text flex-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Security</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Two-step verification, PIN setup</p>
          </div>
        </div>
        <div className="settings-item flex items-center gap-4 p-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] cursor-pointer transition text-left" onClick={() => setActiveView("sessions")}>
          <div className="settings-item-icon w-10 h-10 rounded-xl bg-[var(--bg-input)] flex items-center justify-center text-xl shrink-0">💻</div>
          <div className="settings-item-text flex-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Devices & Sessions</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Manage your active login sessions</p>
          </div>
        </div>
        {currentUser?.role === "admin" && (
          <div className="settings-item flex items-center gap-4 p-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] cursor-pointer transition text-left" onClick={() => setActiveView("admin")}>
            <div className="settings-item-icon w-10 h-10 rounded-xl bg-[var(--bg-input)] flex items-center justify-center text-xl shrink-0">⚙️</div>
            <div className="settings-item-text flex-1">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">Admin Dashboard</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Manage reports & ban users</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarSettings;
