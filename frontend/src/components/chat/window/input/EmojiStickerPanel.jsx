import React from "react";
import EmojiPicker from "emoji-picker-react";

const EmojiStickerPanel = ({ isOpen, onEmojiClick, onStickerClick, stickers, theme }) => {
  if (!isOpen) return null;

  const pickerTheme = theme === "light" ? "light" : "dark";

  return (
    <div
      data-input-panel
      className="absolute bottom-[72px] left-2 z-50 overflow-hidden rounded-2xl shadow-2xl border border-[var(--border-light)]"
      style={{ animation: "modalSlideUp 0.2s cubic-bezier(0.16,1,0.3,1)" }}
    >
      <EmojiPicker
        onEmojiClick={(emojiData) => onEmojiClick(emojiData.emoji)}
        theme={pickerTheme}
        width={330}
        height={380}
        searchDisabled={false}
        lazyLoadEmojis={true}
        skinTonesDisabled={false}
        previewConfig={{ showPreview: false }}
      />
      {stickers && stickers.length > 0 && (
        <div className="flex gap-2 overflow-x-auto p-2 border-t border-[var(--border-light)] bg-[var(--bg-panel)] scrollbar-none">
          {stickers.map((s) => (
            <img
              key={s.id}
              src={s.url}
              alt={s.label}
              className="w-12 h-12 hover:scale-110 transition cursor-pointer select-none"
              onClick={() => onStickerClick(s)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmojiStickerPanel;
