import React, { useState } from 'react';

const SidebarProfile = ({ currentUser }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [name, setName] = useState(currentUser?.username || "");
  const [about, setAbout] = useState(currentUser?.status || "Available");

  return (
    <div className="sidebar-content-view">
      <div className="sidebar-view-header">
        <h2>Profile</h2>
      </div>

      <div className="profile-scroll-content">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            {currentUser?.username?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="profile-details-list">
          <div className="profile-section">
            <label className="profile-label">Your name</label>
            <div className="profile-editable-field">
              {isEditingName ? (
                <input 
                  className="profile-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  autoFocus
                />
              ) : (
                <div className="profile-value-display">{name}</div>
              )}
              <button className="profile-edit-btn" onClick={() => setIsEditingName(!isEditingName)}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3.95 16.7L4 20l3.3.05L17.1 10.2l-3.3-3.3L3.95 16.7zM19.7 7.6c.4-.4.4-1 0-1.4l-1.9-1.9c-.4-.4-1-.4-1.4 0L15 5.7l3.3 3.3 1.4-1.4z"/></svg>
              </button>
            </div>
            <p className="profile-info-text">
              This is not your username or pin. This name will be visible to your WhatsApp contacts.
            </p>
          </div>

          <div className="profile-section">
            <label className="profile-label">About</label>
            <div className="profile-editable-field">
              {isEditingAbout ? (
                <input 
                  className="profile-input" 
                  value={about} 
                  onChange={(e) => setAbout(e.target.value)}
                  onBlur={() => setIsEditingAbout(false)}
                  onKeyPress={(e) => e.key === 'Enter' && setIsEditingAbout(false)}
                  autoFocus
                />
              ) : (
                <div className="profile-value-display">{about}</div>
              )}
              <button className="profile-edit-btn" onClick={() => setIsEditingAbout(!isEditingAbout)}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3.95 16.7L4 20l3.3.05L17.1 10.2l-3.3-3.3L3.95 16.7zM19.7 7.6c.4-.4.4-1 0-1.4l-1.9-1.9c-.4-.4-1-.4-1.4 0L15 5.7l3.3 3.3 1.4-1.4z"/></svg>
              </button>
            </div>
          </div>

          <div className="profile-section">
            <label className="profile-label">Email</label>
            <div className="profile-value-display static">{currentUser?.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarProfile;
