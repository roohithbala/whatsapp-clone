import { useState, useRef } from "react";
import VoiceRecorder from "./window/VoiceRecorder";
import EmojiStickerPanel from "./window/EmojiStickerPanel";
import AttachmentMenu from "./window/AttachmentMenu";
import "../../styles/ChatInput.css";

function ChatInput({ onSendPayload, replyingTo, onCancelReply, disabled }) {
  const [text, setText] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  const [fileType, setFileType] = useState("image");

  const handleSend = () => {
    if (!text.trim() && !isRecording) return;
    onSendPayload({ text, messageType: "text", timestamp: new Date().toISOString() });
    setText("");
    setIsEmojiOpen(false);
  };

  const handleVoiceSuccess = (audioBlob) => {
    onSendPayload({ 
      text: "Voice Message", 
      messageType: "audio", 
      audioData: URL.createObjectURL(audioBlob),
      timestamp: new Date().toISOString() 
    });
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
    
    const url = URL.createObjectURL(file);
    const msgType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document';
    
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
          <div className="reply-text">{replyingTo.text}</div>
          <button className="clickable" onClick={onCancelReply}>&times;</button>
        </div>
      )}
      
      <AttachmentMenu isOpen={isAttachOpen} onAction={handleFileAction} />
      <EmojiStickerPanel 
        isOpen={isEmojiOpen} stickers={[]} 
        onEmojiClick={(e) => setText(prev => prev + e)} 
      />

      <div className="whatsapp-input-bar">
        <button className="input-icon" onClick={() => setIsAttachOpen(!isAttachOpen)}>+</button>
        <button className="input-icon" onClick={() => setIsEmojiOpen(!isEmojiOpen)}>😊</button>
        <input 
          type="text" value={text} disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message"
        />
        
        {isRecording ? (
          <VoiceRecorder onStop={handleVoiceSuccess} onCancel={() => setIsRecording(false)} />
        ) : (
          <button className="send-btn" onClick={text.trim() ? handleSend : () => setIsRecording(true)}>
            {text.trim() ? "➤" : "🎤"}
          </button>
        )}
      </div>
    </footer>
  );
}

export default ChatInput;
