import React, { useState, useRef, useEffect } from "react";
import VoiceRecorder from "./window/VoiceRecorder";
import EmojiStickerPanel from "./window/EmojiStickerPanel";
import AttachmentMenu from "./window/AttachmentMenu";
import "../../styles/ChatInput.css";

function ChatInput({ onSendPayload, replyingTo, editingMessage, onCancelReply, disabled, onType, placeholder }) {
  const [text, setText] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  const [fileType, setFileType] = useState("image");

  // Populate text for editing
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || "");
    } else {
      setText("");
    }
  }, [editingMessage]);

  const handleChange = (e) => {
    setText(e.target.value);
    if (onType) onType();
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!text.trim() && !isRecording) return;
    onSendPayload({ text, messageType: "text", timestamp: new Date().toISOString() });
    setText("");
    setIsEmojiOpen(false);
    
    // Reset height if ref exists
    const textarea = document.querySelector(".chat-input-area textarea");
    if (textarea) textarea.style.height = "auto";
  };

  const handleVoiceSuccess = (audioBlob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      onSendPayload({ 
        text: "Voice Message", 
        messageType: "audio", 
        audioData: reader.result,
        timestamp: new Date().toISOString() 
      });
    };
    reader.readAsDataURL(audioBlob);
    setIsRecording(false);
  };

  const handleFileAction = (type) => {
    setFileType(type);
    setIsAttachOpen(false);
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // File size validation (max 16MB)
    const MAX_SIZE = 16 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("File is too large. Maximum size is 16MB.");
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isDoc = file.type.includes('pdf') || file.type.includes('word') || file.type.includes('text') || file.type.includes('zip');

    if (fileType === 'photos' && !isImage && !isVideo) {
      alert("Please select an image or video file.");
      return;
    }
    if (fileType === 'document' && !isDoc && !isImage) {
      // Allow images in documents too sometimes, but mostly docs
    }

    const url = URL.createObjectURL(file);
    const msgType = isImage ? 'image' : isVideo ? 'video' : 'document';
    
    onSendPayload({ 
      text: file.name, 
      messageType: msgType, 
      mediaUrl: url,
      timestamp: new Date().toISOString() 
    });
  };

  return (
    <footer className="chat-input-area">
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
        accept={fileType === 'photos' ? 'image/*,video/*' : fileType === 'document' ? '.pdf,.doc,.docx,.txt' : '*/*'}
      />
      {replyingTo && (
        <div className="input-reply-preview">
          <div className="reply-text">Replying to: {replyingTo.text}</div>
          <button className="clickable" onClick={onCancelReply}>&times;</button>
        </div>
      )}
      {editingMessage && (
        <div className="input-reply-preview" style={{ borderLeftColor: 'var(--whatsapp-green)' }}>
          <div className="reply-text" style={{ color: 'var(--whatsapp-green)' }}>Editing Message</div>
          <button className="clickable" onClick={onCancelReply}>&times;</button>
        </div>
      )}
      
      <AttachmentMenu isOpen={isAttachOpen} onAction={handleFileAction} />
      <EmojiStickerPanel 
        isOpen={isEmojiOpen} stickers={[]} 
        onEmojiClick={(e) => setText(prev => prev + e)} 
      />

      <div className="whatsapp-input-bar">
        <button className="input-icon" onClick={() => setIsAttachOpen(!isAttachOpen)}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        </button>
        <button className="input-icon" onClick={() => setIsEmojiOpen(!isEmojiOpen)}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5s.67 1.5 1.5 1.5zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
        </button>
        <textarea 
          value={text} disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type a message"}
          rows={1}
        />
        
        {isRecording ? (
          <VoiceRecorder onStop={handleVoiceSuccess} onCancel={() => setIsRecording(false)} />
        ) : (
          <button className="send-btn" onClick={text.trim() ? handleSend : () => setIsRecording(true)}>
            {text.trim() ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            )}
          </button>
        )}
      </div>
    </footer>
  );
}

export default ChatInput;
