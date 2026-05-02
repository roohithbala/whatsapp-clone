import React, { useState, useRef } from 'react';
import userService from '../../../services/userService';

const SidebarProfile = ({ currentUser, onUpdateProfile }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [name, setName] = useState(currentUser?.username || "");
  const [about, setAbout] = useState(currentUser?.status || "Available");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const saveProfile = async (updates) => {
    try {
      await userService.updateProfile(currentUser.userId, updates);
      if (onUpdateProfile) onUpdateProfile(updates);
    } catch (e) {
      console.error("Failed to save profile", e);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const data = await userService.uploadFile(file);
      // The API returns { url: "/uploads/filename.jpg" }
      // In production, you might prefix this with the API base URL depending on your setup.
      // For local dev, assuming frontend and backend are on same domain/proxy.
      const avatarUrl = `http://localhost:5000${data.url}`;
      await saveProfile({ profilePicture: avatarUrl });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="sidebar-content-view">
      <div className="sidebar-view-header">
        <h2>Profile</h2>
      </div>

      <div className="profile-scroll-content">
        <div className="profile-avatar-section">
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*" 
            onChange={handleFileChange} 
          />
          <div 
            className="profile-avatar-large" 
            style={{ 
              cursor: 'pointer', 
              backgroundImage: currentUser?.profilePicture ? `url(${currentUser.profilePicture})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: isUploading ? 0.5 : 1
            }}
            onClick={handleAvatarClick}
            title="Change Profile Photo"
          >
            {!currentUser?.profilePicture && currentUser?.username?.charAt(0).toUpperCase()}
            <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.5)', width: '160px', height: '160px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }} className="avatar-overlay">
              <span style={{ color: 'white', fontSize: '14px' }}>CHANGE</span>
            </div>
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
                  onBlur={() => { setIsEditingName(false); saveProfile({ username: name }); }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingName(false);
                      saveProfile({ username: name });
                    }
                  }}
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
                  onBlur={() => { setIsEditingAbout(false); saveProfile({ status: about }); }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingAbout(false);
                      saveProfile({ status: about });
                    }
                  }}
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
