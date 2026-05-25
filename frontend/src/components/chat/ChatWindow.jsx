import { useRef, useCallback, useEffect } from "react";
import ChatInput from "./ChatInput";
import ChatHeader from "./window/ChatHeader";
import ContactInfoPanel from "./window/ContactInfoPanel";
import MessageInfoModal from "./window/MessageInfoModal";
import GroupInfoPanel from "./window/GroupInfoPanel";
import SectionLock from "./SectionLock";

// Refactored Sub-components
import WelcomePanel from "./window/WelcomePanel";
import MessageSearchPanel from "./window/MessageSearchPanel";
import MessageList from "./window/MessageList";
import ForwardModal from "./window/ForwardModal";

// Custom Hook
import { useChatWindow } from "../../hooks/useChatWindow";

function ChatWindow({ selectedUser, currentUser, users, onMessageSent, onStartCall, onBack, theme }) {
  const messagesContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

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
    handleTyping
  } = useChatWindow(selectedUser, currentUser, users, onMessageSent, scrollToBottom);

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
                />

                {((selectedUser.isCommunity && !selectedUser.isAdmin) || (isChannel && !selectedUser.isAdmin)) ? (
                  <div className="px-4 py-3 bg-[var(--bg-sidebar-alt)] text-[var(--text-secondary)] text-center text-sm border-t border-[var(--border-light)] italic select-none">
                    Only admins can send messages
                  </div>
                ) : (
                  <ChatInput 
                    onSendPayload={handleSendPayload} 
                    replyingTo={replyingTo} 
                    editingMessage={editingMessage}
                    onCancelReply={() => { setReplyingTo(null); setEditingMessage(null); }}
                    onType={handleTyping}
                    placeholder={isChannel ? "Post to channel..." : (isGroup ? "Type in group..." : "Type a message")}
                    lastMessageReceived={messages.length > 0 ? messages.filter(m => m.senderId !== currentUser.userId).slice(-1)[0] : null}
                    theme={theme}
                  />
                )}
              </div>

              {showGroupInfo && isGroup && (
                <GroupInfoPanel 
                  group={selectedUser} 
                  currentUser={currentUser} 
                  users={users}
                  onClose={() => setShowGroupInfo(false)} 
                />
              )}
              {showGroupInfo && !isGroup && (
                <ContactInfoPanel 
                  user={selectedUser} 
                  currentUser={currentUser} 
                  onClose={() => setShowGroupInfo(false)} 
                />
              )}
            </div>
          )}

          {infoMessage && (
            <MessageInfoModal 
              message={infoMessage} 
              onClose={() => setInfoMessage(null)} 
            />
          )}

          <ForwardModal 
            forwardingMessage={forwardingMessage}
            setForwardingMessage={setForwardingMessage}
            messageSearchTerm={messageSearchTerm}
            setMessageSearchTerm={setMessageSearchTerm}
            users={users}
            handleForwardMessage={handleForwardMessage}
          />
        </>
      ) : (
        <WelcomePanel />
      )}
    </section>
  );
}

export default ChatWindow;
