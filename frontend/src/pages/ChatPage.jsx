import React, { useState, useEffect, useCallback } from 'react';
import SidebarRail from '../components/chat/list/SidebarRail';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import CallWindow from '../components/chat/window/call/CallWindow';
import StatusPlaceholder from '../components/chat/window/status/StatusPlaceholder';
import StoryViewer from '../components/chat/window/status/StoryViewer';
import SectionLock from '../components/chat/SectionLock';
import messageService from '../services/messageService';
import socket from '../socket';
import AdminGroupThread from '../components/chat/sidebar/settings/admin/AdminGroupThread';
import AdminUserChatThread from '../components/chat/sidebar/settings/admin/AdminUserChatThread';
import AdminUserChatList from '../components/chat/sidebar/settings/admin/AdminUserChatList';

const ChatPage = ({ 
  users, currentUser, selectedUser, setSelectedUser, 
  railMode, setRailMode, onLogout, setTheme, theme,
  refreshUserData
}) => {
  const [activeStory, setActiveStory] = useState(null);
  const [conversationMeta, setConversationMeta] = useState({});
  const [activeCall, setActiveCall] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [sidebarWidth, setSidebarWidth] = useState(localStorage.getItem('sidebarWidth') || 400);
  const [isResizing, setIsResizing] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [pendingRailMode, setPendingRailMode] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showGroupMonitor, setShowGroupMonitor] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState("groups");
  const [adminActiveItem, setAdminActiveItem] = useState(null);
  const [adminListRefresh, setAdminListRefresh] = useState(0);
  const [userMonitorSubject, setUserMonitorSubject] = useState(null);
  const [userMonitorPartner, setUserMonitorPartner] = useState(null);

  useEffect(() => {
    if (railMode !== 'admin') {
      setShowGroupMonitor(false);
      setAdminActiveItem(null);
      setUserMonitorSubject(null);
      setUserMonitorPartner(null);
    }
  }, [railMode]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLockTrigger = (targetMode) => {
    setPendingRailMode(targetMode);
    setShowLock(true);
  };

  const startResizing = useCallback((e) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (isResizing) {
      const newWidth = e.clientX - 64; // Adjust for SidebarRail width (64px)
      if (newWidth > 250 && newWidth < 600) {
        setSidebarWidth(newWidth);
        localStorage.setItem('sidebarWidth', newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const refreshConversations = useCallback(async () => {
    if (!currentUser || !currentUser.userId) return;
    try {
      const meta = await messageService.fetchConversations(currentUser.userId);
      setConversationMeta(meta);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleStartChat = (e) => {
      const username = e.detail;
      const targetUser = users.find(u => u.username === username || u.name === username);
      if (targetUser) {
        setSelectedUser(targetUser);
      }
    };
    window.addEventListener("startChatWithUser", handleStartChat);
    return () => window.removeEventListener("startChatWithUser", handleStartChat);
  }, [users, setSelectedUser]);

  useEffect(() => {
    refreshConversations();
    
    const onNewMessage = (msg) => {
      // Small delay to ensure DB is updated
      setTimeout(refreshConversations, 100);

      if (msg && msg.senderId !== currentUser?.userId) {
        if (Notification.permission === 'granted' && document.hidden) {
          const sender = users.find(u => u.userId === msg.senderId) || { username: 'New message' };
          new Notification(`Message from ${sender.username}`, {
            body: msg.text || (msg.mediaUrl ? 'Media attached' : 'New message'),
            icon: '/favicon.ico' // Or path to your app logo
          });
        }
      }
    };

    const onCallOffer = ({ from, offer, type }) => {
      const caller = users.find(u => u.userId === from);
      setActiveCall({ type, user: caller, isIncoming: true, offer });
    };

    const onTyping = ({ senderId, isTyping }) => {
      setTypingUsers(prev => ({ ...prev, [senderId]: isTyping }));
    };

    const onDisappearingSettingChanged = () => {
      setTimeout(refreshConversations, 100);
    };

    const onMessageUpdated = () => {
      setTimeout(refreshConversations, 100);
    };

    socket.on("receiveMessage", onNewMessage);
    socket.on("messageSeen", onNewMessage);
    socket.on("messageDeleted", onMessageUpdated);
    socket.on("messageEdited", onMessageUpdated);
    socket.on('call-offer', onCallOffer);
    socket.on('typing', onTyping);
    socket.on("disappearingSettingChanged", onDisappearingSettingChanged);

    return () => {
      socket.off("receiveMessage", onNewMessage);
      socket.off("messageSeen", onNewMessage);
      socket.off("messageDeleted", onMessageUpdated);
      socket.off("messageEdited", onMessageUpdated);
      socket.off('call-offer', onCallOffer);
      socket.off('typing', onTyping);
      socket.off("disappearingSettingChanged", onDisappearingSettingChanged);
    };
  }, [refreshConversations, currentUser, users]);

  const handleEndCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  return (
    <div className={`chat-shell ${isResizing ? 'resizing' : ''}`}>
      <div className="chat-layout">
        {(!isMobile || !selectedUser) && (
          <SidebarRail 
            railMode={railMode} setRailMode={setRailMode} 
            onLogout={onLogout} 
            theme={theme} setTheme={setTheme}
            currentUser={currentUser}
            unreadCount={Object.values(conversationMeta).reduce((acc, curr) => acc + (curr.unreadCount || 0), 0)}
            onLockTrigger={handleLockTrigger}
          />
        )}
        
        {(!isMobile || !selectedUser) && (
          <div className="chat-sidebar" style={{ width: isMobile ? 'calc(100% - 64px)' : `${sidebarWidth}px`, flex: 'none' }}>
            <ChatList 
              users={users.map(u => ({ ...u, isTyping: typingUsers[u.userId] }))} 
              activeChat={selectedUser} 
              setActiveChat={setSelectedUser} 
              railMode={railMode} 
              setRailMode={setRailMode}
              currentUser={currentUser}
              onLogout={onLogout}
              onViewStory={(status) => setActiveStory(status)}
              theme={theme} setTheme={setTheme}
              conversationMeta={conversationMeta}
              refreshUserData={refreshUserData}
              onLockTrigger={handleLockTrigger}
              onStartCall={(type, targetUser) => setActiveCall({ type, user: targetUser, isIncoming: false })}
              onOpenGroupMonitor={() => setShowGroupMonitor(true)}
              onCloseGroupMonitor={() => setShowGroupMonitor(false)}
              adminActiveTab={adminActiveTab}
              setAdminActiveTab={setAdminActiveTab}
              adminActiveItem={adminActiveItem}
              setAdminActiveItem={setAdminActiveItem}
              adminListRefresh={adminListRefresh}
              userMonitorSubject={userMonitorSubject}
              setUserMonitorSubject={setUserMonitorSubject}
              userMonitorPartner={userMonitorPartner}
              setUserMonitorPartner={setUserMonitorPartner}
            />
          </div>
        )}

        {!isMobile && <div className="sidebar-resizer" onMouseDown={startResizing} />}

        {(!isMobile || selectedUser || showGroupMonitor || userMonitorSubject) && (
          <div className="chat-main-container">
            {userMonitorSubject ? (
              userMonitorPartner ? (
                <AdminUserChatThread
                  subject={userMonitorSubject}
                  partner={userMonitorPartner}
                  onBack={() => setUserMonitorPartner(null)}
                />
              ) : (
                <AdminUserChatList
                  subject={userMonitorSubject}
                  activePartner={userMonitorPartner}
                  onSelectPartner={setUserMonitorPartner}
                  onBack={() => {
                    setUserMonitorSubject(null);
                    setUserMonitorPartner(null);
                  }}
                />
              )
            ) : showGroupMonitor ? (
              <AdminGroupThread
                activeItem={adminActiveItem}
                activeTab={adminActiveTab}
                onRefreshList={() => setAdminListRefresh(prev => prev + 1)}
              />
            ) : railMode === 'status' && !selectedUser ? (
              <StatusPlaceholder />
            ) : (
              <ChatWindow 
                selectedUser={selectedUser} 
                currentUser={currentUser} 
                users={users}
                onMessageSent={refreshConversations}
                onStartCall={(type, targetUser) => setActiveCall({ type, user: targetUser || selectedUser, isIncoming: false })}
                onBack={isMobile ? () => setSelectedUser(null) : null}
                theme={theme}
                refreshUserData={refreshUserData}
                onViewStory={(status) => setActiveStory(status)}
              />
            )}
          </div>
        )}
      </div>

      {activeCall && (
        <CallWindow 
          remoteUser={activeCall.user} 
          type={activeCall.type} 
          onEndCall={handleEndCall} 
          isIncoming={activeCall.isIncoming}
          initialOffer={activeCall.offer}
          currentUser={currentUser}
        />
      )}

      {activeStory && (
        <StoryViewer 
          status={activeStory} 
          onClose={() => setActiveStory(null)} 
        />
      )}

      {showLock && (
        <SectionLock 
          onUnlock={() => {
            setShowLock(false);
            setRailMode(pendingRailMode);
          }}
          onCancel={() => setShowLock(false)}
          title={pendingRailMode === 'locked' ? "Locked Chats" : "Secure Section"}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default ChatPage;
