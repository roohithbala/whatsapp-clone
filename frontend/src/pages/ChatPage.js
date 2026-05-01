import React, { useState, useEffect, useCallback } from 'react';
import SidebarRail from '../components/chat/list/SidebarRail';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import StatusPlaceholder from '../components/chat/window/StatusPlaceholder';
import StoryViewer from '../components/chat/window/StoryViewer';
import messageService from '../services/messageService';
import socket from '../socket';

const ChatPage = ({ 
  users, currentUser, selectedUser, setSelectedUser, 
  railMode, setRailMode, onLogout, setTheme, theme, setAppLocked 
}) => {
  const [activeStory, setActiveStory] = useState(null);
  const [conversationMeta, setConversationMeta] = useState({});

  const refreshConversations = useCallback(async () => {
    if (!currentUser) return;
    try {
      const meta = await messageService.fetchConversations(currentUser.userId);
      setConversationMeta(meta);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshConversations();
    
    const onNewMessage = () => {
      // Small delay to ensure DB is updated
      setTimeout(refreshConversations, 100);
    };

    socket.on("receiveMessage", onNewMessage);
    socket.on("messageSeen", onNewMessage);

    return () => {
      socket.off("receiveMessage", onNewMessage);
      socket.off("messageSeen", onNewMessage);
    };
  }, [refreshConversations]);

  return (
    <div className="chat-shell">
      <div className="chat-layout">
        <SidebarRail 
          railMode={railMode} setRailMode={setRailMode} 
          onLogout={onLogout} 
          theme={theme} setTheme={setTheme}
          currentUser={currentUser}
        />
        
        <div className="chat-sidebar">
          <ChatList 
            users={users} 
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
          />
        </div>

        <div className="chat-main-container">
          {railMode === 'status' && !selectedUser ? (
            <StatusPlaceholder />
          ) : (
            <ChatWindow 
              selectedUser={selectedUser} 
              currentUser={currentUser} 
              users={users}
              onMessageSent={refreshConversations}
            />
          )}
        </div>

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
