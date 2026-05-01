import React from 'react';
import EmojiPicker from 'emoji-picker-react';

const EmojiStickerPanel = ({ isOpen, onEmojiClick, onStickerClick, stickers }) => {
  if (!isOpen) return null;

  return (
    <div className="emoji-sticker-panel">
      <EmojiPicker onEmojiClick={(emojiData) => onEmojiClick(emojiData.emoji)} />
      <div className="sticker-list">
        {stickers.map(s => (
          <img key={s.id} src={s.url} alt={s.label} onClick={() => onStickerClick(s)} />
        ))}
      </div>
    </div>
  );
};

export default EmojiStickerPanel;
