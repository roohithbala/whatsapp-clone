import React from 'react';

const SidebarHeader = ({ 
  railMode, filteredUsersCount, showNewChatMenu, setShowNewChatMenu, 
  showMainMenu, setShowMainMenu, newChatMenuRef, mainMenuRef,
  handleNewChat, handleCreateGroup, handleSelectChatsToggle,
  handleMarkAllAsRead, setAppLocked, handleLogoutFromMenu,
  setListScope, setQuickFilter, handleNewBroadcast
}) => {
  const getTitle = () => {
    switch(railMode) {
      case "messages": return "Chats";
      case "calls": return "Calls";
      case "status": return "Status";
      case "archived": return "Archived";
      case "meta": return "Meta AI";
      case "feedback": return "Feedback";
      case "settings": return "Settings";
      case "profile": return "Profile";
      case "channels": return "Channels";
      case "community": return "Communities";
      default: return "Chats";
    }
  };

  return (
    <div className="chat-sidebar-header">
      <div className="chat-sidebar-header-top">
        <h2>{getTitle()}</h2>
        <div className="chat-sidebar-header-actions">
          {(railMode === "messages" || railMode === "archived") && (
            <>
              <div className="chat-header-more-wrap" ref={newChatMenuRef}>
                <button className="chat-header-icon-btn" onClick={() => { setShowNewChatMenu(!showNewChatMenu); setShowMainMenu(false); }}>
                  <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                </button>
                {showNewChatMenu && (
                  <div className="chat-more-menu compact">
                    <button onClick={handleNewChat}>New chat</button>
                    <button onClick={handleCreateGroup}>New group</button>
                    <button onClick={handleNewBroadcast}>New broadcast</button>
                  </div>
                )}
              </div>
              <div className="chat-header-more-wrap" ref={mainMenuRef}>
                <button className="chat-header-icon-btn" onClick={() => { setShowMainMenu(!showMainMenu); setShowNewChatMenu(false); }}>
                  <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                </button>
                {showMainMenu && (
                  <div className="chat-more-menu">
                    <button onClick={() => { setListScope("groups"); setShowMainMenu(false); }}>Groups</button>
                    <button onClick={() => { setQuickFilter("favorites"); setShowMainMenu(false); }}>Starred</button>
                    <button onClick={() => { setAppLocked(true); setShowMainMenu(false); }}>App lock</button>
                    <button onClick={handleLogoutFromMenu}>Log out</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {(railMode === "messages" || railMode === "archived") && (
        <span>{filteredUsersCount} contacts</span>
      )}
    </div>
  );
};

export default SidebarHeader;
