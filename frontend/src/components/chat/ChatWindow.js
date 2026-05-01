import { useEffect, useRef, useState, useCallback } from "react";
import ChatInput from "./ChatInput";
import socket from "../../socket";
import { fetchMessages, sendEncryptedMessage } from "../../services/messageService";
import ChatHeader from "./window/ChatHeader";
import MessageItem from "./window/MessageItem";
import CallWindow from "./window/CallWindow";

function ChatWindow({ selectedUser, currentUser, users, onMessageSent }) {
  const [messages, setMessages] = useState([]);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleStartCall = (type) => {
    setActiveCall({ type, user: selectedUser });
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (!currentUser?.userId || !selectedUser?.userId) return;

    const loadMessages = async () => {
      const msgs = await fetchMessages(currentUser.userId, selectedUser.userId);
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    };

    loadMessages();

    // Socket listeners
    const onReceiveMessage = (message) => {
      if (
        (message.senderId === selectedUser.userId && message.receiverId === currentUser.userId) ||
        (message.senderId === currentUser.userId && message.receiverId === selectedUser.userId)
      ) {
        setMessages(prev => [...prev, message]);
        setTimeout(scrollToBottom, 100);
        
        // Emit seen if we are looking at this chat
        if (message.senderId === selectedUser.userId) {
          socket.emit("messageSeen", {
            messageIds: [message._id],
            senderId: selectedUser.userId,
            receiverId: currentUser.userId
          });
        }
      }
    };

    const onTyping = ({ senderId, isTyping }) => {
      if (senderId === selectedUser.userId) {
        setIsPeerTyping(isTyping);
      }
    };

    socket.on("receiveMessage", onReceiveMessage);
    socket.on("typing", onTyping);

    // Call signaling
    const onCallOffer = ({ from, offer, type }) => {
      // Find the user object for 'from'
      const caller = users.find(u => u.userId === from);
      setActiveCall({ type, user: caller, isIncoming: true, offer });
    };

    socket.on('call-offer', onCallOffer);

    return () => {
      socket.off("receiveMessage", onReceiveMessage);
      socket.off("typing", onTyping);
      socket.off('call-offer', onCallOffer);
    };
  }, [selectedUser?.userId, currentUser?.userId, scrollToBottom, users]);

  const handleSendPayload = async (payload) => {
    const messagePayload = {
      ...payload,
      senderId: currentUser.userId,
      receiverId: selectedUser.userId,
      status: currentUser.userId === selectedUser.userId ? 'seen' : 'sent',
      replyTo: replyingTo ? { id: replyingTo._id, text: replyingTo.text, senderName: "User" } : null
    };
    
    // Optimistic update
    const sent = await sendEncryptedMessage(currentUser, selectedUser, messagePayload);
    socket.emit("sendMessage", sent);
    setMessages(prev => [...prev, sent]);
    setReplyingTo(null);
    if (onMessageSent) onMessageSent();
    setTimeout(scrollToBottom, 100);
  };

  const handleTyping = () => {
    socket.emit("typing", {
      senderId: currentUser.userId,
      receiverId: selectedUser.userId,
      isTyping: true
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        senderId: currentUser.userId,
        receiverId: selectedUser.userId,
        isTyping: false
      });
    }, 2000);
  };

  return (
    <section className="chat-window">
      {selectedUser ? (
        <>
          <ChatHeader 
            selectedUser={selectedUser} 
            isPeerTyping={isPeerTyping} 
            onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
            onStartCall={handleStartCall}
          />
          {activeCall && (
            <CallWindow 
              remoteUser={activeCall.user} 
              type={activeCall.type} 
              onEndCall={handleEndCall} 
              isIncoming={activeCall.isIncoming}
              initialOffer={activeCall.offer}
            />
          )}
          <div className="chat-messages" ref={messagesContainerRef}>
            {messages.map(m => (
              <MessageItem 
                key={m._id || m.timestamp} message={m} 
                currentUser={currentUser} selectedUser={selectedUser}
                onReply={setReplyingTo}
              />
            ))}
          </div>
          <ChatInput 
            onSendPayload={handleSendPayload} 
            replyingTo={replyingTo} 
            onCancelReply={() => setReplyingTo(null)}
            onType={handleTyping}
          />
        </>
      ) : (
        <div className="chat-empty-state">
          <div className="status-placeholder-content">
            <div style={{ fontSize: '80px' }}>💬</div>
            <h2>WhatsApp for Web</h2>
            <p>Send and receive messages without keeping your phone online.<br/>Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default ChatWindow;
