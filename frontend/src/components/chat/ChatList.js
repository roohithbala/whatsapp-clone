import React, { useRef } from "react";
import api from "../../services/api";
import SidebarHeader from "./list/SidebarHeader";
import SidebarFilters from "./list/SidebarFilters";
import ChatItem from "./list/ChatItem";
import NewChatModal from "./list/NewChatModal";
import NewGroupModal from "./list/NewGroupModal";
import SidebarProfile from "./sidebar/SidebarProfile";
import SidebarFeedback from "./sidebar/SidebarFeedback";
import SidebarSettings from "./sidebar/SidebarSettings";
import SidebarStatus from "./sidebar/SidebarStatus";
import SidebarMetaAI from "./sidebar/SidebarMetaAI";
import SidebarChannels from "./sidebar/SidebarChannels";
import SidebarCommunities from "./sidebar/SidebarCommunities";
import SidebarCalls from "./sidebar/SidebarCalls";
import SidebarMedia from "./sidebar/SidebarMedia";
import SidebarStarred from "./sidebar/SidebarStarred";
import { toDisplayName } from "../../utils/formatters";
import { useChatList } from "../../hooks/useChatList";

export default function ChatList({ 
  users, activeChat, setActiveChat, currentUser, onLogout, onViewStory, 
  railMode, setRailMode, theme, setTheme, setAppLocked,
  conversationMeta = {}, refreshUserData, onLockTrigger
}) {
  const {
    searchTerm, setSearchTerm, quickFilter, setQuickFilter,
    setListScope, showNewChatMenu, setShowNewChatMenu, 
    showMainMenu, setShowMainMenu, isNewChatModalOpen, setIsNewChatModalOpen, 
    isNewGroupModalOpen, setIsNewGroupModalOpen, isBroadcastModalOpen, setIsBroadcastModalOpen,
    newGroupName, setNewGroupName, modalError, modalLoading, 
    filteredUsers
  } = useChatList(users, conversationMeta, railMode, currentUser, activeChat);

  const newChatMenuRef = useRef(null);
  const mainMenuRef = useRef(null);

  return (
    <div className="chat-sidebar-main">
      <SidebarHeader 
        railMode={railMode} filteredUsersCount={filteredUsers.length}
        showNewChatMenu={showNewChatMenu} setShowNewChatMenu={setShowNewChatMenu}
        showMainMenu={showMainMenu} setShowMainMenu={setShowMainMenu}
        newChatMenuRef={newChatMenuRef} mainMenuRef={mainMenuRef}
        handleLogoutFromMenu={onLogout} setListScope={setListScope}
        setQuickFilter={setQuickFilter} setAppLocked={setAppLocked}
        handleNewChat={() => setIsNewChatModalOpen(true)}
        handleCreateGroup={() => setIsNewGroupModalOpen(true)}
        handleNewBroadcast={() => setIsBroadcastModalOpen(true)}
        setRailMode={setRailMode}
      />
      <div className="chat-sidebar-list" style={{ overflowY: 'auto', flexGrow: 1 }}>
        {railMode === "profile" && <SidebarProfile currentUser={currentUser} />}
        {railMode === "settings" && (
          <SidebarSettings 
            setRailMode={setRailMode} 
            setAppLocked={setAppLocked} 
            theme={theme} 
            setTheme={setTheme} 
            currentUser={currentUser} 
            users={users}
            onUpdateSettings={refreshUserData}
          />
        )}
        {railMode === "status" && <SidebarStatus currentUser={currentUser} onViewStory={onViewStory} users={users} />}
        {railMode === "calls" && <SidebarCalls />}
        {railMode === "meta" && <SidebarMetaAI />}
        {railMode === "feedback" && <SidebarFeedback />}
        {railMode === "channels" && <SidebarChannels currentUser={currentUser} />}
        {railMode === "media" && <SidebarMedia currentUser={currentUser} activeChat={activeChat} />}
        {railMode === "communities" && <SidebarCommunities currentUser={currentUser} setSelectedUser={setActiveChat} users={users} />}
        {railMode === "starred" && <SidebarStarred currentUser={currentUser} />}
        {(railMode === "messages" || railMode === "archived" || railMode === "locked") && (
          <>
            {railMode === "messages" && currentUser?.lockedChats && currentUser.lockedChats.length > 0 && (
              <div className="chat-list-item clickable special-list-entry" onClick={() => {
                onLockTrigger('locked');
              }}>
                <div className="chat-list-avatar-wrap">
                  <div className="chat-list-avatar special-avatar" style={{ background: 'transparent', boxShadow: 'none' }}>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="var(--whatsapp-green)"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>
                  </div>
                </div>
                <div className="chat-list-meta">
                  <div className="chat-list-name" style={{ color: 'var(--whatsapp-green)' }}>Locked Chats</div>
                  <div className="chat-list-preview">Locked and hidden</div>
                </div>
              </div>
            )}
            {railMode === "messages" && currentUser?.archivedChats && currentUser.archivedChats.length > 0 && (
              <div className="chat-list-item clickable special-list-entry" onClick={() => setRailMode('archived')}>
                <div className="chat-list-avatar-wrap">
                  <div className="chat-list-avatar special-avatar" style={{ background: 'transparent', boxShadow: 'none' }}>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="var(--whatsapp-green)"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.47 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12.06l.87 1H5.12z"/></svg>
                  </div>
                </div>
                <div className="chat-list-meta">
                  <div className="chat-list-name">Archived</div>
                  <div className="chat-list-preview">{currentUser.archivedChats.length} conversation{currentUser.archivedChats.length > 1 ? 's' : ''}</div>
                </div>
              </div>
            )}
            {railMode !== "messages" && (
              <div className="chat-list-item clickable special-list-entry" onClick={() => setRailMode('messages')} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <div className="chat-list-avatar-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="chat-list-avatar special-avatar" style={{ background: 'transparent', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="var(--text-secondary)"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                  </div>
                </div>
                <div className="chat-list-meta">
                  <div className="chat-list-name" style={{ fontWeight: 700 }}>{railMode === 'locked' ? 'Locked Chats' : 'Archived'}</div>
                  <div className="chat-list-preview">Back to all chats</div>
                </div>
              </div>
            )}
            <div className="sidebar-search-container">
              <div className="sidebar-search-bar">
                <span>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search or start a new chat" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <SidebarFilters quickFilter={quickFilter} setQuickFilter={setQuickFilter} setListScope={setListScope} />
            {filteredUsers.length === 0 && !searchTerm && (
              <div className="no-chats-placeholder">
                <p>No {railMode === 'archived' ? 'archived' : railMode === 'locked' ? 'locked' : ''} chats yet.</p>
              </div>
            )}
            {filteredUsers.map(user => (
              <ChatItem 
                key={user.userId} user={user} meta={conversationMeta[user.userId] || {}}
                isSelected={activeChat?.userId === user.userId}
                onClick={() => setActiveChat(user)} toDisplayName={toDisplayName}
                currentUser={currentUser}
                refreshUserData={refreshUserData}
              />
            ))}
          </>
        )}
      </div>
      <NewChatModal 
        isOpen={isNewChatModalOpen} 
        onClose={() => setIsNewChatModalOpen(false)} 
        users={users}
        currentUser={currentUser}
        setSelectedUser={(user) => {
          setActiveChat(user);
          setIsNewChatModalOpen(false);
        }}
      />
      <NewGroupModal 
        isOpen={isNewGroupModalOpen} 
        onClose={() => setIsNewGroupModalOpen(false)} 
        groupName={newGroupName} 
        setGroupName={setNewGroupName} 
        error={modalError} 
        loading={modalLoading} 
        onSubmit={async (e) => {
          e.preventDefault();
          if (!newGroupName.trim()) return;
          try {
            await api.post("/groups", { name: newGroupName });
            setNewGroupName("");
            setIsNewGroupModalOpen(false);
            if (refreshUserData) {
              await refreshUserData();
            } else {
              window.location.reload();
            }
          } catch (err) {
            console.error("Group creation failed", err);
          }
        }}
      />

      {isBroadcastModalOpen && (
        <div className="whatsapp-modal-overlay">
          <div className="whatsapp-modal">
            <h3>New Broadcast</h3>
            <p style={{ margin: '16px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Only contacts with your number in their address book will receive your broadcast messages.
            </p>
            <button className="professional-button" onClick={() => setIsBroadcastModalOpen(false)}>Select Contacts</button>
            <button className="text-button" onClick={() => setIsBroadcastModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
