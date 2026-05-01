import React from 'react';
import MessageBody from './MessageBody';

const MessageItem = ({ message, currentUser, selectedUser, onReply }) => {
  const isSent = message.senderId === currentUser.userId;
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`message-row ${isSent ? "sent" : "received"}`}>
      <div className={`message-bubble ${isSent ? "sent" : "received"}`} onDoubleClick={() => onReply(message)}>
        {message.replyTo && (
          <div className="message-reply-preview">
            <div className="reply-sender">{message.replyTo.senderName}</div>
            <div className="reply-text">{message.replyTo.text}</div>
          </div>
        )}
        <div className="message-content">
          <MessageBody message={message} />
        </div>
        <div className="message-meta">
          <span className="message-time">{time}</span>
          {isSent && (
            <span className={`message-status ${message.status}`}>
              {message.status === 'seen' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
