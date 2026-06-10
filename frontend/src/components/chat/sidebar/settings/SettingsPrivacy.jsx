import React from 'react';

const SettingsPrivacy = ({
  onBack,
  readReceipts,
  setReadReceipts,
  disappearing,
  setDisappearing,
  lastSeen,
  setLastSeen,
  profilePhoto,
  setProfilePhoto,
  about,
  setAbout,
  blockedCount,
  onViewBlocked,
  savePrivacySetting,
  saveSetting
}) => {
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
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Privacy</h2>
      </div>
      <div className="settings-list flex-1 overflow-y-auto">
        {/* Last Seen Dropdown */}
        <div className="settings-item flex items-center justify-between p-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition select-none text-left">
          <div className="settings-item-text flex-1 pr-3">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Last seen</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Choose who can see when you are online and last seen</p>
          </div>
          <select 
            className="bg-[var(--bg-sidebar-alt)] text-[var(--text-primary)] border border-[var(--border-light)] rounded-lg p-2 text-xs outline-none cursor-pointer focus:border-[var(--whatsapp-green)] shrink-0 w-28"
            value={lastSeen}
            onChange={(e) => {
              const val = e.target.value;
              setLastSeen(val);
              savePrivacySetting("lastSeen", val);
            }}
          >
            <option value="everyone">Everyone</option>
            <option value="contacts">My contacts</option>
            <option value="nobody">Nobody</option>
          </select>
        </div>

        {/* Profile Photo Dropdown */}
        <div className="settings-item flex items-center justify-between p-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition select-none text-left">
          <div className="settings-item-text flex-1 pr-3">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Profile photo</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Choose who can see your profile photo</p>
          </div>
          <select 
            className="bg-[var(--bg-sidebar-alt)] text-[var(--text-primary)] border border-[var(--border-light)] rounded-lg p-2 text-xs outline-none cursor-pointer focus:border-[var(--whatsapp-green)] shrink-0 w-28"
            value={profilePhoto}
            onChange={(e) => {
              const val = e.target.value;
              setProfilePhoto(val);
              savePrivacySetting("profilePhoto", val);
            }}
          >
            <option value="everyone">Everyone</option>
            <option value="contacts">My contacts</option>
            <option value="nobody">Nobody</option>
          </select>
        </div>

        {/* About Dropdown */}
        <div className="settings-item flex items-center justify-between p-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition select-none text-left">
          <div className="settings-item-text flex-1 pr-3">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">About</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Choose who can see your status details</p>
          </div>
          <select 
            className="bg-[var(--bg-sidebar-alt)] text-[var(--text-primary)] border border-[var(--border-light)] rounded-lg p-2 text-xs outline-none cursor-pointer focus:border-[var(--whatsapp-green)] shrink-0 w-28"
            value={about}
            onChange={(e) => {
              const val = e.target.value;
              setAbout(val);
              savePrivacySetting("about", val);
            }}
          >
            <option value="everyone">Everyone</option>
            <option value="contacts">My contacts</option>
            <option value="nobody">Nobody</option>
          </select>
        </div>

        {/* Read Receipts Toggle */}
        <div className="settings-item flex items-center justify-between p-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition select-none text-left">
          <div className="settings-item-text flex-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Read receipts</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">If turned off, you won't send or receive read receipts. Read receipts are always sent for group chats.</p>
          </div>
          <button className={`settings-toggle ${readReceipts ? 'on' : ''}`} onClick={() => { setReadReceipts(!readReceipts); savePrivacySetting("readReceipts", !readReceipts); }}></button>
        </div>

        {/* Disappearing Messages Toggle */}
        <div className="settings-item flex items-center justify-between p-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition select-none text-left">
          <div className="settings-item-text flex-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Disappearing messages</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Make new chats disappear after 7 days</p>
          </div>
          <button className={`settings-toggle ${disappearing ? 'on' : ''}`} onClick={() => { 
            const newVal = !disappearing;
            setDisappearing(newVal); 
            saveSetting("disappearingMessages", newVal ? "7d" : "off"); 
          }}></button>
        </div>

        {/* Blocked Contacts */}
        <div className="settings-item flex items-center justify-between p-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition select-none cursor-pointer text-left" onClick={onViewBlocked}>
          <div className="settings-item-text flex-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Blocked contacts</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{blockedCount} contacts</p>
          </div>
          <div className="text-[var(--text-muted)] text-xl">›</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPrivacy;
