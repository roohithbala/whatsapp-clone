import React, { useState, useEffect, useCallback } from 'react';
import SidebarRail from '../components/chat/list/SidebarRail';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import CallWindow from '../components/chat/window/CallWindow';
import StatusPlaceholder from '../components/chat/window/StatusPlaceholder';
import StoryViewer from '../components/chat/window/StoryViewer';
import messageService from '../services/messageService';
import socket from '../socket';

const ChatPage = ({ 
  users, currentUser, selectedUser, setSelectedUser, 
  railMode, setRailMode, onLogout, setTheme, theme, setAppLocked,
  refreshUserData
}) => {
  const [activeStory, setActiveStory] = useState(null);
  const [conversationMeta, setConversationMeta] = useState({});
  const [activeCall, setActiveCall] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [sidebarWidth, setSidebarWidth] = useState(localStorage.getItem('sidebarWidth') || 400);
  const [isResizing, setIsResizing] = useState(false);

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

    socket.on("receiveMessage", onNewMessage);
    socket.on("messageSeen", onNewMessage);
    socket.on('call-offer', onCallOffer);
    socket.on('typing', onTyping);

    return () => {
      socket.off("receiveMessage", onNewMessage);
      socket.off("messageSeen", onNewMessage);
      socket.off('call-offer', onCallOffer);
      socket.off('typing', onTyping);
    };
  }, [refreshConversations, currentUser, users]);

  const handleEndCall = () => {
    setActiveCall(null);
  };

  return (
    <div className={`chat-shell ${isResizing ? 'resizing' : ''}`}>
      <div className="chat-layout">
        <SidebarRail 
          railMode={railMode} setRailMode={setRailMode} 
          onLogout={onLogout} 
          theme={theme} setTheme={setTheme}
          currentUser={currentUser}
        />
        
        <div className="chat-sidebar" style={{ width: `${sidebarWidth}px`, flex: 'none' }}>
          <ChatList 
            users={users.map(u => ({ ...u, isTyping: typingUsers[u.userId] }))} 
            selectedUser={selectedUser} 
            setSelectedUser={setSelectedUser} 
            railMode={railMode} 
            setRailMode={setRailMode}
            currentUser={currentUser}
            onLogout={onLogout}
            onViewStory={(status) => setActiveStory(status)}
            theme={theme} setTheme={setTheme}
            setAppLocked={setAppLocked}
            conversationMeta={conversationMeta}
            refreshUserData={refreshUserData}
          />
        </div>

        <div className="sidebar-resizer" onMouseDown={startResizing} />

        <div className="chat-main-container">
          {railMode === 'status' && !selectedUser ? (
            <StatusPlaceholder />
          ) : (
            <ChatWindow 
              selectedUser={selectedUser} 
              currentUser={currentUser} 
              users={users}
              onMessageSent={refreshConversations}
              onStartCall={(type) => setActiveCall({ type, user: selectedUser, isIncoming: false })}
            />
          )}
        </div>

        {activeCall && (
          <CallWindow 
            remoteUser={activeCall.user} 
            type={activeCall.type} 
            onEndCall={handleEndCall} 
            isIncoming={activeCall.isIncoming}
            initialOffer={activeCall.offer}
          />
        )}

        {activeStory && (
          <StoryViewer 
            status={activeStory} 
            onClose={() => setActiveStory(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
