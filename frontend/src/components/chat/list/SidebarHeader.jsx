import React from 'react';

const SidebarHeader = ({ 
  railMode, showNewChatMenu, setShowNewChatMenu, 
  showMainMenu, setShowMainMenu, newChatMenuRef, mainMenuRef,
  handleNewChat, handleCreateGroup,
  handleLogoutFromMenu,
  setListScope, setQuickFilter, handleNewBroadcast, setRailMode
}) => {
  const getTitle = () => {
    switch(railMode) {
      case "messages": return "Chats";
      case "archived": return "Archived";
      case "locked": return "Locked";
      default: return "Chats";
    }
  };

  return (
    <div className="px-4 pt-4 pb-2 flex items-center justify-between bg-transparent shrink-0">
      <div className="flex items-center gap-3">
        {railMode !== "messages" && (
          <button 
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition border-none bg-transparent shrink-0"
            onClick={() => setRailMode("messages")}
            title="Back to Chats"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
        )}
        <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight leading-none">{getTitle()}</h2>
      </div>
      <div className="flex items-center gap-1">
        {(railMode === "messages" || railMode === "archived") && (
          <>
            <div className="relative" ref={newChatMenuRef}>
              <button 
                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-0 bg-transparent" 
                onClick={() => { setShowNewChatMenu(!showNewChatMenu); setShowMainMenu(false); }}
                title="New Chat / Group"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              </button>
              {showNewChatMenu && (
                <div className="absolute top-full right-0 bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border-light)] rounded-2xl p-1.5 min-w-[170px] flex flex-col shadow-2xl z-[1002] mt-2" style={{animation: 'slideDown 0.15s ease'}}>
                  <button className="w-full flex items-center gap-3 text-left px-3 py-2 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition cursor-pointer border-0 bg-transparent font-medium" onClick={handleNewChat}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="12" y1="7" x2="12" y2="13"/><line x1="9" y1="10" x2="15" y2="10"/></svg>
                    <span>New chat</span>
                  </button>
                  <button className="w-full flex items-center gap-3 text-left px-3 py-2 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition cursor-pointer border-0 bg-transparent font-medium" onClick={handleCreateGroup}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span>New group</span>
                  </button>
                  <button className="w-full flex items-center gap-3 text-left px-3 py-2 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition cursor-pointer border-0 bg-transparent font-medium" onClick={handleNewBroadcast}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
                    <span>New broadcast</span>
                  </button>
                </div>
              )}
            </div>
            <div className="relative" ref={mainMenuRef}>
              <button 
                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-0 bg-transparent" 
                onClick={() => { setShowMainMenu(!showMainMenu); setShowNewChatMenu(false); }}
                title="Menu"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </button>
              {showMainMenu && (
                <div className="absolute top-full right-0 bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border-light)] rounded-2xl p-1.5 min-w-[190px] flex flex-col shadow-2xl z-[1002] mt-2" style={{animation: 'slideDown 0.15s ease'}}>
                  <button className="w-full flex items-center gap-3 text-left px-3 py-2 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition cursor-pointer border-0 bg-transparent font-medium" onClick={() => { setListScope("groups"); setShowMainMenu(false); }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span>Groups</span>
                  </button>
                  <button className="w-full flex items-center gap-3 text-left px-3 py-2 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition cursor-pointer border-0 bg-transparent font-medium" onClick={() => { setQuickFilter("favorites"); setShowMainMenu(false); }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <span>Favorite contacts</span>
                  </button>
                  <button className="w-full flex items-center gap-3 text-left px-3 py-2 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition cursor-pointer border-0 bg-transparent font-medium" onClick={() => { setRailMode("starred"); setShowMainMenu(false); }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    <span>Starred messages</span>
                  </button>
                  <button className="w-full flex items-center gap-3 text-left px-3 py-2 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition cursor-pointer border-0 bg-transparent font-medium" onClick={() => { setRailMode("feedback"); setShowMainMenu(false); }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-75"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span>Feedback</span>
                  </button>
                  <div className="h-px bg-[var(--border-light)] my-1" />
                  <button className="w-full flex items-center gap-3 text-left px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer border-0 bg-transparent font-semibold" onClick={handleLogoutFromMenu}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SidebarHeader;
