import React, { useState, useRef, useEffect } from "react";
import EmojiStickerPanel from "./window/input/EmojiStickerPanel";
import AttachmentMenu from "./window/input/AttachmentMenu";
import SmartReplies from "./window/input/SmartReplies";
import ShareContactModal from "./window/modals/ShareContactModal";
import CreatePollModal from "./window/modals/CreatePollModal";
import CreateEventModal from "./window/modals/CreateEventModal";
import ReplyEditBanner from "./window/input/ReplyEditBanner";
import InputBar from "./window/input/InputBar";
import { useChatAttachment } from "../../hooks/useChatAttachment";

function ChatInput({
  onSendPayload, replyingTo, editingMessage, onCancelReply, disabled,
  onType, placeholder, lastMessageReceived, theme, users = []
}) {
  const [text, setText] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const textareaRef = useRef(null);

  const { fileInputRef, isUploading, handleFileAction, handleFileChange } = useChatAttachment(
    onSendPayload, setIsAttachOpen, setShowContactModal, setShowPollModal, setShowEventModal
  );

  useEffect(() => {
    const handleOutside = (e) => {
      if (isEmojiOpen || isAttachOpen) {
        const panels = document.querySelectorAll("[data-input-panel]");
        if (![...panels].some((p) => p.contains(e.target))) {
          setIsEmojiOpen(false);
          setIsAttachOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isEmojiOpen, isAttachOpen]);

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  return (
    <footer className="px-4 py-3 bg-transparent flex flex-col relative z-10 select-none shrink-0">
      <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
      <SmartReplies text={text} lastMessageReceived={lastMessageReceived} onSendPayload={onSendPayload} />
      <div className="flex flex-col w-full bg-[var(--bg-panel)] backdrop-blur-[24px] border border-[var(--border-light)] rounded-2xl p-2 shadow-[var(--shadow-medium)] transition-all duration-300 focus-within:border-[var(--whatsapp-green)]/30 focus-within:shadow-[0_8px_32px_rgba(0,217,166,0.08)]">
        <ReplyEditBanner replyingTo={replyingTo} editingMessage={editingMessage} onCancelReply={onCancelReply} />
        <div data-input-panel>
          <EmojiStickerPanel isOpen={isEmojiOpen} stickers={[]} onEmojiClick={handleEmojiClick} theme={theme} />
          <AttachmentMenu isOpen={isAttachOpen} onAction={handleFileAction} />
        </div>
        <InputBar
          disabled={disabled} placeholder={placeholder} text={text} setText={setText} textareaRef={textareaRef}
          isEmojiOpen={isEmojiOpen} setIsEmojiOpen={setIsEmojiOpen} isAttachOpen={isAttachOpen} setIsAttachOpen={setIsAttachOpen}
          isUploading={isUploading} onType={onType} onSendPayload={onSendPayload} editingMessage={editingMessage}
        />
      </div>
      <ShareContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} users={users} onSendPayload={onSendPayload} />
      <CreatePollModal isOpen={showPollModal} onClose={() => setShowPollModal(false)} onSendPayload={onSendPayload} />
      <CreateEventModal isOpen={showEventModal} onClose={() => setShowEventModal(false)} onSendPayload={onSendPayload} />
    </footer>
  );
}

export default ChatInput;
