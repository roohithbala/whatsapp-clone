import React, { useState, useRef, useEffect } from "react";
import VoiceRecorder from "./window/VoiceRecorder";
import EmojiStickerPanel from "./window/EmojiStickerPanel";
import AttachmentMenu from "./window/AttachmentMenu";
import SmartReplies from "./window/SmartReplies";
import userService from "../../services/userService";

const API_BASE = "http://localhost:5000";

function ChatInput({
  onSendPayload,
  replyingTo,
  editingMessage,
  onCancelReply,
  disabled,
  onType,
  placeholder,
  lastMessageReceived,
  theme,
}) {
  const [text, setText] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [fileType, setFileType] = useState("image");

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || "");
      textareaRef.current?.focus();
    } else {
      setText("");
    }
  }, [editingMessage]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isEmojiOpen || isAttachOpen) {
        const panels = document.querySelectorAll("[data-input-panel]");
        const clickedInside = [...panels].some(p => p.contains(e.target));
        if (!clickedInside) {
          setIsEmojiOpen(false);
          setIsAttachOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEmojiOpen, isAttachOpen]);

  const handleChange = (e) => {
    setText(e.target.value);
    if (onType) onType();
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Close menus on Escape
    if (e.key === "Escape") {
      setIsEmojiOpen(false);
      setIsAttachOpen(false);
    }
  };

  const handleSend = () => {
    if (!text.trim() && !isRecording) return;
    onSendPayload({ text: text.trim(), messageType: "text", timestamp: new Date().toISOString() });
    setText("");
    setIsEmojiOpen(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleVoiceSuccess = (audioBlob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      onSendPayload({
        text: "Voice Message",
        messageType: "audio",
        audioData: reader.result,
        timestamp: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(audioBlob);
    setIsRecording(false);
  };

  const handleFileAction = (type) => {
    setFileType(type);
    setIsAttachOpen(false);
    if (type === "camera") {
      // Camera capture
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.setAttribute("accept", "image/*,video/*");
    } else {
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.setAttribute(
        "accept",
        type === "photos" ? "image/*,video/*" : type === "document" ? ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx" : "*/*"
      );
    }
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 16 * 1024 * 1024; // 16MB
    if (file.size > MAX_SIZE) {
      alert("File too large. Max 16MB.");
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const isAudio = file.type.startsWith("audio/");
    const msgType = isImage ? "image" : isVideo ? "video" : isAudio ? "audio" : "document";

    setIsUploading(true);
    try {
      // Upload to server
      const uploadedData = await userService.uploadFile(file);
      const serverUrl = uploadedData.url.startsWith("http")
        ? uploadedData.url
        : `${API_BASE}${uploadedData.url}`;

      onSendPayload({
        text: file.name,
        messageType: msgType,
        mediaUrl: serverUrl,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Upload failed:", err);
      // Fallback to local URL for display if server upload fails
      const localUrl = URL.createObjectURL(file);
      onSendPayload({
        text: file.name,
        messageType: msgType,
        mediaUrl: localUrl,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleEmojiClick = (emoji) => {
    setText(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  const IconBtn = ({ onClick, title, children, active }) => (
    <button
      className={`w-10 h-10 rounded-full bg-transparent border-none flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0 ${
        active
          ? "text-[var(--whatsapp-green)]"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
      }`}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );

  return (
    <footer className="px-4 py-3 bg-transparent flex flex-col relative z-10 select-none shrink-0">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <SmartReplies text={text} lastMessageReceived={lastMessageReceived} onSendPayload={onSendPayload} />

      {/* Floating Panel Container */}
      <div className="flex flex-col w-full bg-[var(--bg-panel)] backdrop-blur-[24px] border border-[var(--border-light)] rounded-2xl p-2 shadow-[var(--shadow-medium)] transition-all duration-300 focus-within:border-[var(--whatsapp-green)]/30 focus-within:shadow-[0_8px_32px_rgba(0,217,166,0.08)]">
        {/* Reply / Edit banners */}
        {replyingTo && (
          <div className="flex items-center justify-between px-3.5 py-2 bg-[var(--bg-input)]/60 border-l-[3px] border-[var(--whatsapp-green)] rounded-xl text-xs mb-2.5">
            <div className="flex flex-col min-w-0 pr-4">
              <span className="text-[var(--whatsapp-green)] font-semibold text-[11px] truncate">
                {replyingTo.senderUsername || "You"}
              </span>
              <span className="truncate text-[var(--text-primary)]">{replyingTo.text || "[Media]"}</span>
            </div>
            <button
              className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer border-0 bg-transparent shrink-0"
              onClick={onCancelReply}
            >
              ✕
            </button>
          </div>
        )}
        {editingMessage && (
          <div className="flex items-center justify-between px-3.5 py-2 bg-[var(--bg-input)]/60 border-l-[3px] border-[var(--whatsapp-green)] rounded-xl text-xs mb-2.5">
            <div className="flex flex-col min-w-0 pr-4">
              <span className="text-[var(--whatsapp-green)] font-semibold text-[11px]">Editing message</span>
              <span className="truncate text-[var(--text-primary)]">{editingMessage.text}</span>
            </div>
            <button
              className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer border-0 bg-transparent shrink-0"
              onClick={onCancelReply}
            >
              ✕
            </button>
          </div>
        )}

        {/* Floating panels */}
        <div data-input-panel>
          <EmojiStickerPanel
            isOpen={isEmojiOpen}
            stickers={[]}
            onEmojiClick={handleEmojiClick}
            theme={theme}
          />
          <AttachmentMenu isOpen={isAttachOpen} onAction={handleFileAction} />
        </div>

        {/* Input row */}
        <div className="flex items-end gap-1.5 w-full">
          <IconBtn onClick={() => { setIsEmojiOpen(!isEmojiOpen); setIsAttachOpen(false); }} title="Emoji" active={isEmojiOpen}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5s.67 1.5 1.5 1.5zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </IconBtn>
          <IconBtn onClick={() => { setIsAttachOpen(!isAttachOpen); setIsEmojiOpen(false); }} title="Attach file" active={isAttachOpen}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
            </svg>
          </IconBtn>

          <textarea
            ref={textareaRef}
            value={text}
            disabled={disabled || isUploading}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={isUploading ? "Uploading..." : (placeholder || "Type a message")}
            rows={1}
            className="flex-1 px-4 py-2.5 bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-transparent rounded-xl text-[14.2px] outline-none resize-none max-h-[120px] min-h-[42px] transition-all duration-200 focus:bg-[var(--bg-sidebar)] focus:border-[var(--whatsapp-green)]/20 leading-[1.4]"
            style={{ scrollbarWidth: "none" }}
          />

          {isRecording ? (
            <VoiceRecorder onStop={handleVoiceSuccess} onCancel={() => setIsRecording(false)} />
          ) : isUploading ? (
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <div className="w-5 h-5 border-2 border-[var(--whatsapp-green)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <button
              className={`w-10 h-10 rounded-full border-none flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0 ${
                text.trim()
                  ? "bg-[var(--whatsapp-green)] text-white shadow-md hover:bg-[var(--whatsapp-dark-green)]"
                  : "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
              onClick={text.trim() ? handleSend : () => setIsRecording(true)}
              type="button"
              title={text.trim() ? "Send" : "Record voice"}
            >
              {text.trim() ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}

export default ChatInput;
