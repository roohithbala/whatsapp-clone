import React, { useState, useEffect } from "react";
import VoiceRecorder from "./VoiceRecorder";
import IconBtn from "./IconBtn";

const InputBar = ({
  disabled,
  placeholder,
  text,
  setText,
  textareaRef,
  isEmojiOpen,
  setIsEmojiOpen,
  isAttachOpen,
  setIsAttachOpen,
  isUploading,
  onType,
  onSendPayload,
  editingMessage
}) => {
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || "");
      textareaRef.current?.focus();
    } else {
      setText("");
    }
  }, [editingMessage, setText, textareaRef]);

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

  return (
    <div className="flex items-end gap-1.5 w-full">
      <IconBtn 
        onClick={() => { setIsEmojiOpen(!isEmojiOpen); setIsAttachOpen(false); }} 
        title="Emoji" 
        active={isEmojiOpen}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5s.67 1.5 1.5 1.5zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
        </svg>
      </IconBtn>
      <IconBtn 
        onClick={() => { setIsAttachOpen(!isAttachOpen); setIsEmojiOpen(false); }} 
        title="Attach file" 
        active={isAttachOpen}
      >
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
        className="flex-1 px-4 py-3 bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-transparent rounded-2xl text-[14.2px] outline-none resize-none max-h-[120px] min-h-[44px] transition-all duration-200 focus:bg-[var(--bg-sidebar)] focus:border-[var(--whatsapp-green)]/20 leading-[1.4]"
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
  );
};

export default InputBar;
