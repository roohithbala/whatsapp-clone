import { useRef } from "react";
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

function ChatList({ 
  users, currentUser, selectedUser, setSelectedUser, 
  railMode, setRailMode, onLogout, onViewStory, theme, setTheme, setAppLocked,
  conversationMeta = {}, refreshUserData
}) {
  const {
    searchTerm, setSearchTerm, quickFilter, setQuickFilter,
    setListScope, showNewChatMenu, setShowNewChatMenu, 
    showMainMenu, setShowMainMenu, isNewChatModalOpen, setIsNewChatModalOpen, 
    isNewGroupModalOpen, setIsNewGroupModalOpen, isBroadcastModalOpen, setIsBroadcastModalOpen,
    newGroupName, setNewGroupName, modalError, modalLoading, 
    filteredUsers
  } = useChatList(users, conversationMeta, railMode, currentUser, selectedUser);

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
      <div className="chat-sidebar-list">
        {railMode === "profile" && <SidebarProfile currentUser={currentUser} />}
        {railMode === "settings" && <SidebarSettings setRailMode={setRailMode} setAppLocked={setAppLocked} theme={theme} setTheme={setTheme} />}
        {railMode === "status" && <SidebarStatus currentUser={currentUser} onViewStory={onViewStory} users={users} />}
        {railMode === "calls" && <SidebarCalls />}
        {railMode === "meta" && <SidebarMetaAI />}
        {railMode === "feedback" && <SidebarFeedback />}
        {railMode === "channels" && <SidebarChannels currentUser={currentUser} />}
        {railMode === "media" && <SidebarMedia currentUser={currentUser} selectedUser={selectedUser} />}
        {railMode === "communities" && <SidebarCommunities currentUser={currentUser} setSelectedUser={setSelectedUser} users={users} />}
        {railMode === "starred" && <SidebarStarred currentUser={currentUser} />}
        {(railMode === "messages" || railMode === "archived" || railMode === "locked") && (
          <>
            {railMode === "messages" && currentUser?.lockedChats && currentUser.lockedChats.length > 0 && (
              <div className="chat-list-item clickable special-list-entry" onClick={() => {
                if (currentUser.hasPin) {
                  // Trigger PIN prompt before showing locked chats
                  setAppLocked(true);
                }
                setRailMode('locked');
              }}>
                <div className="chat-list-avatar-wrap">
                  <div className="chat-list-avatar" style={{ background: 'transparent', fontSize: '24px', boxShadow: 'none' }}>🔒</div>
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
                  <div className="chat-list-avatar" style={{ background: 'transparent', fontSize: '24px', boxShadow: 'none' }}>📥</div>
                </div>
                <div className="chat-list-meta">
                  <div className="chat-list-name">Archived</div>
                  <div className="chat-list-preview">{currentUser.archivedChats.length} conversation{currentUser.archivedChats.length > 1 ? 's' : ''}</div>
                </div>
              </div>
            )}
            {railMode !== "messages" && (
              <div className="chat-list-item clickable special-list-entry" onClick={() => setRailMode('messages')} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <div className="chat-list-avatar-wrap">
                  <div className="chat-list-avatar" style={{ background: 'transparent', fontSize: '24px', boxShadow: 'none' }}>←</div>
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
            {filteredUsers.map(user => (
              <ChatItem 
                key={user.userId} user={user} meta={conversationMeta[user.userId] || {}}
                isSelected={selectedUser?.userId === user.userId}
                onClick={() => setSelectedUser(user)} toDisplayName={toDisplayName}
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
          setSelectedUser(user);
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

export default ChatList;
