import React, { useState } from 'react';

const MessageBody = ({ message }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const renderTextWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="message-link" style={{ color: 'var(--whatsapp-blue)', textDecoration: 'underline' }} onClick={(e) => e.stopPropagation()}>{part}</a>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderMedia = () => {
    if (message.isDeleted) {
      return (
        <div className="message-text deleted" style={{ fontStyle: 'italic', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px' }}>🚫</span> {message.text || "This message was deleted"}
        </div>
      );
    }

    const url = message.mediaUrl || message.audioData || message.fileData || message.imageData || message.videoData;
    
    if (!url) return <div className="message-text" style={{ whiteSpace: 'pre-wrap' }}>{renderTextWithLinks(message.text)}</div>;

    if (message.messageType === "audio") {
      return (
        <div className="message-media-block">
          <audio controls src={url} className="chat-audio-player" />
        </div>
      );
    }

    if (message.messageType === "image") {
      return (
        <div className="message-media-block" onClick={() => setIsPreviewOpen(true)}>
          <img src={url} alt="Attachment" className="chat-media-img" style={{ cursor: 'zoom-in' }} />
          {message.text && <div className="message-text" style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>{renderTextWithLinks(message.text)}</div>}
        </div>
      );
    }

    if (message.messageType === "video") {
      return (
        <div className="message-media-block" onClick={() => setIsPreviewOpen(true)}>
          <div className="video-thumb-overlay">▶</div>
          <video src={url} className="chat-media-video" />
          {message.text && <div className="message-text" style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>{renderTextWithLinks(message.text)}</div>}
        </div>
      );
    }

    if (message.messageType === "document") {
      return (
        <div className="message-media-block document-block">
          <div className="doc-icon">📄</div>
          <div className="doc-info">
            <div className="doc-name">{message.text || "Document"}</div>
            <a href={url} download={message.text || "file"} className="doc-download-link">Download</a>
          </div>
        </div>
      );
    }

    return <div className="message-text" style={{ whiteSpace: 'pre-wrap' }}>{renderTextWithLinks(message.text)}</div>;
  };

  return (
    <>
      {renderMedia()}
      
      {isPreviewOpen && (
        <div className="media-preview-overlay" onClick={() => setIsPreviewOpen(false)}>
          <div className="media-preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="preview-close" onClick={() => setIsPreviewOpen(false)}>&times;</button>
            {message.messageType === 'image' && <img src={message.mediaUrl || message.imageData} alt="Full Preview" />}
            {message.messageType === 'video' && <video controls autoPlay src={message.mediaUrl || message.videoData} />}
          </div>
        </div>
      )}
    </>
  );
};

export default MessageBody;
