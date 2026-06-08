import React from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const SidebarRail = ({ 
  railMode, 
  setRailMode, 
  onLogout, 
  unreadCount = 0,
  currentUser,
  theme,
  setTheme,
  onLockTrigger
}) => {
  const RailButton = ({ type, icon, label, badgeCount, isActive, onClickCustom }) => {
    const active = isActive !== undefined ? isActive : railMode === type;
    return (
      <button
        className={`w-10 h-10 rounded-lg border-0 bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer flex items-center justify-center transition-all duration-200 relative group ${active ? '!bg-[var(--bg-hover)] !text-whatsapp-green' : ''}`}
        onClick={onClickCustom || (() => setRailMode(type))}
        title={label}
      >
        <span className="flex items-center justify-center">{icon}</span>
        {badgeCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-whatsapp-green text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
            {badgeCount}
          </span>
        )}
        <span className="absolute left-14 bg-[var(--bg-sidebar)] border border-[var(--border-light)] text-[var(--text-primary)] text-[11px] rounded-md px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition duration-200 z-50 whitespace-nowrap shadow-lg">
          {label}
        </span>
      </button>
    );
  };

  const icons = {
    messages: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z"/></svg>,
    status: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" strokeDasharray="4 2"/></svg>,
    channels: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>,
    communities: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
    meta: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>,
    locked: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>,
    settings: <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  };

  return (
    <div className="w-[64px] bg-[var(--glass-bg)] backdrop-blur-[24px] border border-[var(--border-light)] shadow-xl rounded-2xl flex flex-col justify-between items-center py-4 shrink-0 h-full select-none relative z-20">
      <div className="flex flex-col items-center gap-2 w-full">
        {/* WhatsApp brand logo */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--whatsapp-teal)] to-[var(--whatsapp-green)] text-white flex items-center justify-center mb-4 shrink-0 shadow-[0_4px_12px_rgba(0,217,166,0.25)] hover:scale-105 active:scale-95 transition-all duration-300">
          <svg viewBox="0 0 16 16" width="20" height="20" fill="white">
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
          </svg>
        </div>
 
        <RailButton type="messages" icon={icons.messages} label="Chats" badgeCount={unreadCount} isActive={railMode === "messages" || railMode === "starred" || railMode === "archived" || railMode === "locked"} />
        <RailButton type="status" icon={icons.status} label="Status" />
        <RailButton type="channels" icon={icons.channels} label="Channels" />
        <RailButton type="communities" icon={icons.communities} label="Communities" />
        <RailButton type="calls" icon={
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.27 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        } label="Calls" />
        <RailButton type="meta" icon={icons.meta} label="Meta AI" />
        <RailButton type="locked" icon={icons.locked} label="Locked Chats" onClickCustom={() => onLockTrigger ? onLockTrigger('locked') : setRailMode('locked')} />
      </div>
 
      <div className="flex flex-col items-center gap-3 w-full">
        <RailButton type="settings" icon={icons.settings} label="Settings" />
        {currentUser && (
          <div
            className={`w-9 h-9 rounded-full bg-[var(--avatar-bg)] text-white flex items-center justify-center text-sm font-semibold cursor-pointer border-2 hover:border-[var(--whatsapp-green)]/70 hover:scale-105 transition-all shrink-0 select-none overflow-hidden relative ${
              railMode === 'profile' ? 'border-[var(--whatsapp-green)]' : 'border-transparent'
            }`}
            onClick={() => setRailMode("profile")}
            title={`${currentUser.username} (You)`}
          >
            <span>{currentUser.username?.[0]?.toUpperCase()}</span>
            {(() => {
              const pic = currentUser.profilePicture;
              const url = pic ? (pic.startsWith('http') ? pic : `${API_BASE}${pic}`) : null;
              return url && (
                <img src={url} alt={currentUser.username} className="w-full h-full object-cover absolute inset-0 transition-transform duration-300 hover:scale-110" onError={e => { e.target.style.display='none'; }} />
              );
            })()}
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00d9a6] border-2 border-[var(--bg-sidebar)] rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarRail;
