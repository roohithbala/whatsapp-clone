import React, { useState, useRef } from 'react';
import userService from '../../../services/userService';

const SidebarProfile = ({ currentUser, onUpdateProfile, setRailMode }) => {
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
      const avatarUrl = `http://localhost:5000${data.url}`;
      await saveProfile({ profilePicture: avatarUrl });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

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
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Profile</h2>
      </div>

      <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6 text-left">
        {/* Avatar Section */}
        <div className="flex flex-col items-center py-4 relative">
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*" 
            onChange={handleFileChange} 
          />
          <div 
            className="w-40 h-40 rounded-full bg-[var(--whatsapp-green)] text-white text-5xl font-bold flex items-center justify-center relative overflow-hidden cursor-pointer shadow-md select-none border-2 border-[var(--border-light)] group"
            style={{ 
              backgroundImage: currentUser?.profilePicture ? `url(${currentUser.profilePicture})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: isUploading ? 0.5 : 1
            }}
            onClick={handleAvatarClick}
            title="Change Profile Photo"
          >
            {!currentUser?.profilePicture && currentUser?.username?.charAt(0).toUpperCase()}
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center p-2">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white mb-1">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span className="text-white text-[10px] font-bold uppercase tracking-wider">Change Photo</span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--whatsapp-green)] tracking-wider uppercase">Your Name</label>
            <div className="flex items-center justify-between border-b border-[var(--border-light)] py-2 gap-2">
              {isEditingName ? (
                <input 
                  className="bg-transparent text-sm text-[var(--text-primary)] border-none outline-none focus:ring-0 w-full" 
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
                <div className="text-sm font-medium text-[var(--text-primary)] break-all">{name}</div>
              )}
              <button 
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition duration-200 shrink-0 cursor-pointer p-1 rounded-full hover:bg-[var(--bg-hover)]" 
                onClick={() => setIsEditingName(!isEditingName)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
              This is not your username or pin. This name will be visible to your WhatsApp contacts.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--whatsapp-green)] tracking-wider uppercase">About</label>
            <div className="flex items-center justify-between border-b border-[var(--border-light)] py-2 gap-2">
              {isEditingAbout ? (
                <input 
                  className="bg-transparent text-sm text-[var(--text-primary)] border-none outline-none focus:ring-0 w-full" 
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
                <div className="text-sm font-medium text-[var(--text-primary)] break-all">{about}</div>
              )}
              <button 
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition duration-200 shrink-0 cursor-pointer p-1 rounded-full hover:bg-[var(--bg-hover)]" 
                onClick={() => setIsEditingAbout(!isEditingAbout)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--whatsapp-green)] tracking-wider uppercase">Email</label>
            <div className="text-sm text-[var(--text-secondary)] py-2 border-b border-[var(--border-light)]">{currentUser?.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarProfile;
