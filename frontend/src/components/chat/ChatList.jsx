import React, { useRef } from "react";
import api from "../../services/api";
import SidebarHeader from "./list/SidebarHeader";
import SidebarFilters from "./list/SidebarFilters";
import ChatItem from "./list/ChatItem";
import LockedChatsRow from "./list/LockedChatsRow";
import NewChatModal from "./list/NewChatModal";
import NewGroupModal from "./list/NewGroupModal";
import SidebarSearch from "./list/SidebarSearch";
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
  railMode, setRailMode, theme, setTheme,
  conversationMeta = {}, refreshUserData, onLockTrigger, onStartCall
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

  const isListMode = railMode === "messages" || railMode === "archived" || railMode === "locked";

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-sidebar)]">
      {isListMode && (
        <SidebarHeader 
          railMode={railMode} filteredUsersCount={filteredUsers.length}
          showNewChatMenu={showNewChatMenu} setShowNewChatMenu={setShowNewChatMenu}
          showMainMenu={showMainMenu} setShowMainMenu={setShowMainMenu}
          newChatMenuRef={newChatMenuRef} mainMenuRef={mainMenuRef}
          handleLogoutFromMenu={onLogout} setListScope={setListScope}
          setQuickFilter={setQuickFilter}
          handleNewChat={() => setIsNewChatModalOpen(true)}
          handleCreateGroup={() => setIsNewGroupModalOpen(true)}
          handleNewBroadcast={() => setIsBroadcastModalOpen(true)}
          setRailMode={setRailMode}
        />
      )}
      {/* Search Bar & Filters */}
      {isListMode && (
        <div className="flex flex-col shrink-0 border-b border-[var(--border-light)]">
          <SidebarSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <SidebarFilters quickFilter={quickFilter} setQuickFilter={setQuickFilter} setListScope={setListScope} />
        </div>
      )}

      {/* Main Scrollable Content Area */}
      <div className={`flex-grow flex flex-col ${isListMode ? "overflow-y-auto" : "overflow-hidden"}`}>
        {railMode === "profile" && <SidebarProfile currentUser={currentUser} onUpdateProfile={refreshUserData} setRailMode={setRailMode} />}
        {railMode === "settings" && (
          <SidebarSettings 
            setRailMode={setRailMode} 
            theme={theme} 
            setTheme={setTheme} 
            currentUser={currentUser} 
            users={users}
            onUpdateSettings={refreshUserData}
          />
        )}
        {railMode === "status" && <SidebarStatus currentUser={currentUser} onViewStory={onViewStory} users={users} setRailMode={setRailMode} />}
        {railMode === "calls" && <SidebarCalls setRailMode={setRailMode} currentUser={currentUser} users={users} onStartCall={onStartCall} />}
        {railMode === "meta" && <SidebarMetaAI setRailMode={setRailMode} />}
        {railMode === "feedback" && <SidebarFeedback setRailMode={setRailMode} />}
        {railMode === "channels" && (
          <SidebarChannels 
            currentUser={currentUser} 
            setSelectedUser={setActiveChat} 
            setRailMode={setRailMode} 
          />
        )}
        {railMode === "media" && <SidebarMedia currentUser={currentUser} activeChat={activeChat} />}
        {railMode === "communities" && <SidebarCommunities currentUser={currentUser} setSelectedUser={setActiveChat} users={users} setRailMode={setRailMode} />}
        {railMode === "starred" && <SidebarStarred currentUser={currentUser} setRailMode={setRailMode} users={users} setSelectedUser={setActiveChat} />}
        
        {isListMode && (
          <>
            <LockedChatsRow 
              railMode={railMode}
              currentUser={currentUser}
              onLockTrigger={onLockTrigger}
              setRailMode={setRailMode}
            />
            {filteredUsers.length === 0 && !searchTerm && (
              <div className="p-8 text-center text-sm text-[var(--text-secondary)] py-12">
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
        <div className="whatsapp-modal-overlay select-none" onClick={() => setIsBroadcastModalOpen(false)}>
          <div
            className="bg-[var(--bg-sidebar)] border border-[var(--border-strong)] rounded-2xl w-[90%] max-w-[400px] p-6 flex flex-col gap-4 shadow-2xl animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📢</span>
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--text-primary)]">New Broadcast</h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Send to multiple contacts at once</p>
                </div>
              </div>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors border-0 bg-transparent"
                onClick={() => setIsBroadcastModalOpen(false)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed border border-[var(--border-light)] rounded-xl p-3 bg-[var(--bg-sidebar-alt)]">
              Only contacts who have your number saved in their address book will receive your broadcast messages.
            </p>
            <div className="flex gap-2 justify-end border-t border-[var(--border-light)] pt-3">
              <button
                className="px-4 py-2 text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer rounded-xl hover:bg-[var(--bg-hover)] transition"
                onClick={() => setIsBroadcastModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 text-[13px] font-bold bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white rounded-xl border-none cursor-pointer transition shadow-sm"
                onClick={() => setIsBroadcastModalOpen(false)}
              >
                Select Contacts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
