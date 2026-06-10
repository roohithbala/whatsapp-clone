import { useRef, useCallback, useEffect, useState } from "react";
import ChatInput from "./ChatInput";
import ChatHeader from "./window/header/ChatHeader";
import SectionLock from "./SectionLock";
import WelcomePanel from "./window/WelcomePanel";
import MessageSearchPanel from "./window/MessageSearchPanel";
import MessageList from "./window/message/MessageList";
import InfoPanelSidebar from "./window/InfoPanelSidebar";
import ChatWindowModals from "./window/modals/ChatWindowModals";
import api from "../../services/api";
import { useChatWindow } from "../../hooks/useChatWindow";

function ChatWindow({ selectedUser, currentUser, users, onMessageSent, onStartCall, onBack, theme, refreshUserData, onViewStory, onGroupUpdate }) {
  const messagesContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  const [isDisappearingModalOpen, setIsDisappearingModalOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const {
    messages, setMessages,
    isPeerTyping,
    groupTypingUsers,
    isSearchOpen, setIsSearchOpen,
    replyingTo, setReplyingTo,
    editingMessage, setEditingMessage,
    forwardingMessage, setForwardingMessage,
    infoMessage, setInfoMessage,
    showScrollButton, setShowScrollButton,
    showGroupInfo, setShowGroupInfo,
    messageSearchTerm, setMessageSearchTerm,
    isLocked, setIsLocked,
    isChannel, isGroup,
    handleForwardMessage,
    handleSendPayload,
    handleTyping,
    disappearingDuration,
    setDisappearingDuration
  } = useChatWindow(selectedUser, currentUser, users, onMessageSent, scrollToBottom);

  const handleClearMessages = useCallback(async () => {
    try {
      const targetId = isGroup ? (selectedUser.groupId || selectedUser.userId) : selectedUser.userId;
      const chatId = isGroup ? targetId : [currentUser.userId, targetId].sort().join("_");
      await api.delete(`/messages/clear/${chatId}`);
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear messages:", err);
    }
  }, [selectedUser, currentUser, isGroup, setMessages]);

  const handleToggleMute = useCallback(async () => {
    try {
      const targetId = isGroup ? (selectedUser.groupId || selectedUser.userId) : selectedUser.userId;
      await api.post(`/users/mute/${targetId}`);
      if (refreshUserData) {
        await refreshUserData();
      }
    } catch (err) {
      console.error("Failed to toggle mute:", err);
    }
  }, [selectedUser, isGroup, refreshUserData]);

  const handleSetDisappearingDuration = async (duration) => {
    try {
      const receiverId = isGroup ? (selectedUser.groupId || selectedUser.userId) : selectedUser.userId;
      const res = await api.post("/messages/disappearing", {
        receiverId,
        isGroup,
        duration
      });
      setDisappearingDuration(duration);
      if (res.data?.systemMessage) {
        setMessages(prev => [...prev, res.data.systemMessage]);
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error("Failed to set disappearing duration", err);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const getHeaderInfo = () => {
    return {
      ...selectedUser,
      username: selectedUser.name || selectedUser.username,
      profilePicture: selectedUser.avatarUrl || selectedUser.profilePicture
    };
  };

  return (
    <section className="flex-1 flex flex-col overflow-hidden h-screen relative bg-[var(--bg-chat)]">
      {selectedUser ? (
        <>
          <ChatHeader 
            selectedUser={getHeaderInfo()} 
            isPeerTyping={isPeerTyping} 
            groupTypingUsers={groupTypingUsers}
            onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
            onStartCall={onStartCall}
            onMoreClick={() => setShowGroupInfo(!showGroupInfo)}
            isChannel={isChannel}
            isGroup={isGroup}
            messages={messages}
            onBack={onBack}
            currentUser={currentUser}
            onDisappearingMessagesClick={() => setIsDisappearingModalOpen(true)}
            disappearingDuration={disappearingDuration}
            onSummarizeClick={() => setIsSummaryOpen(true)}
            onClearMessages={handleClearMessages}
            onToggleMute={handleToggleMute}
          />
          {isLocked ? (
            <div className="flex-1 flex items-center justify-center bg-[var(--bg-chat)]">
              <SectionLock 
                currentUser={currentUser} 
                onUnlock={() => setIsLocked(false)} 
                onCancel={() => setIsLocked(false)}
                title="Locked Chat"
              />
            </div>
          ) : (
            <div className="relative flex flex-1 overflow-hidden h-full">
              <div className="flex-1 flex flex-col relative h-full">
                <MessageSearchPanel 
                  isOpen={isSearchOpen} 
                  searchTerm={messageSearchTerm} 
                  setSearchTerm={setMessageSearchTerm} 
                  onClose={() => { setIsSearchOpen(false); setMessageSearchTerm(""); }} 
                />
                
                <MessageList 
                  messages={messages}
                  messageSearchTerm={messageSearchTerm}
                  currentUser={currentUser}
                  selectedUser={selectedUser}
                  setReplyingTo={setReplyingTo}
                  setEditingMessage={setEditingMessage}
                  setForwardingMessage={setForwardingMessage}
                  setInfoMessage={setInfoMessage}
                  isChannel={isChannel}
                  isGroup={isGroup}
                  setMessages={setMessages}
                  messagesContainerRef={messagesContainerRef}
                  handleScroll={handleScroll}
                  showScrollButton={showScrollButton}
                  scrollToBottom={scrollToBottom}
                  onMessageSent={onMessageSent}
                  onViewStory={onViewStory}
                />

                {(() => {
                  const isChannelAdmin =
                    isChannel &&
                    (selectedUser.isAdmin === true ||
                      String(selectedUser.adminId) === String(currentUser?.userId) ||
                      (selectedUser.admins && selectedUser.admins.includes(String(currentUser?.userId))));

                  const isCommunityAdmin =
                    selectedUser.isCommunity && selectedUser.isAdmin === true;

                  const isGroupAdmin =
                    isGroup &&
                    (selectedUser.adminIds?.includes(String(currentUser?.userId)) ||
                      String(selectedUser.adminId) === String(currentUser?.userId));

                  const canPost =
                    isChannel
                      ? isChannelAdmin
                      : selectedUser.isCommunity
                      ? isCommunityAdmin
                      : isGroup && selectedUser.onlyAdminsCanPost
                      ? isGroupAdmin
                      : true;

                  if (!canPost) {
                    return (
                      <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-sidebar-alt)] border-t border-[var(--border-light)] select-none">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)] shrink-0">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <span className="text-[var(--text-secondary)] text-[12.5px] italic">
                          {isChannel ? "Only admins can post to this channel" : "Only admins can send messages"}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <ChatInput 
                      onSendPayload={handleSendPayload} 
                      replyingTo={replyingTo} 
                      editingMessage={editingMessage}
                      onCancelReply={() => { setReplyingTo(null); setEditingMessage(null); }}
                      onType={handleTyping}
                      placeholder={isChannel ? "Post to channel..." : (isGroup ? "Type in group..." : "Type a message")}
                      lastMessageReceived={messages.length > 0 ? messages.filter(m => m.senderId !== currentUser.userId).slice(-1)[0] : null}
                      theme={theme}
                      users={users}
                    />
                  );
                })()}
              </div>

              <InfoPanelSidebar
                showGroupInfo={showGroupInfo}
                isGroup={isGroup}
                isChannel={isChannel}
                selectedUser={selectedUser}
                currentUser={currentUser}
                users={users}
                onClose={() => setShowGroupInfo(false)}
                onGroupUpdate={onGroupUpdate}
              />
            </div>
          )}

          <ChatWindowModals
            infoMessage={infoMessage ? (messages.find(m => m._id === infoMessage._id) || infoMessage) : null}
            setInfoMessage={setInfoMessage}
            forwardingMessage={forwardingMessage}
            setForwardingMessage={setForwardingMessage}
            messageSearchTerm={messageSearchTerm}
            setMessageSearchTerm={setMessageSearchTerm}
            users={users}
            currentUser={currentUser}
            handleForwardMessage={handleForwardMessage}
            isDisappearingModalOpen={isDisappearingModalOpen}
            setIsDisappearingModalOpen={setIsDisappearingModalOpen}
            disappearingDuration={disappearingDuration}
            handleSetDisappearingDuration={handleSetDisappearingDuration}
            selectedUser={selectedUser}
            isSummaryOpen={isSummaryOpen}
            setIsSummaryOpen={setIsSummaryOpen}
            messages={messages}
          />
        </>
      ) : (
        <WelcomePanel />
      )}
    </section>
  );
}

export default ChatWindow;
