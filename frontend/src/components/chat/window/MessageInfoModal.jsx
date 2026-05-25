import React from 'react';

const MessageInfoModal = ({ message, onClose }) => {
  if (!message) return null;

  const formatDate = (date) => {
    if (!date) return '---';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center animate-[overlay-fade_0.2s_ease_forwards]" 
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-sidebar)] rounded-2xl w-[90%] max-w-[400px] shadow-2xl flex flex-col overflow-hidden animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-light)] flex items-center gap-4 bg-[var(--bg-sidebar-alt)]">
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors" 
            onClick={onClose}
          >
            ←
          </button>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Message info</h2>
        </div>
        
        {/* Message Preview */}
        <div className="p-5 bg-[var(--bg-chat)] border-b border-[var(--border-light)] flex justify-end">
          <div className="bg-[var(--bg-message-sent)] text-[var(--text-on-green)] p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] text-left relative select-none">
             <div className="text-[15px] leading-relaxed break-words">
               {message.text || (message.mediaUrl ? 'Media attached' : 'Message')}
             </div>
             <div className="text-[10px] text-right mt-1 opacity-70">
               {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </div>
          </div>
        </div>

        {/* Message Status Times */}
        <div className="bg-[var(--bg-sidebar)] py-2 flex flex-col">
          {/* Read Status */}
          <div className="px-5 py-4 flex items-center gap-6 select-none hover:bg-[var(--bg-hover)] transition-colors">
            <div className="text-xl text-[#53bdeb] shrink-0 font-bold">✓✓</div>
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Read</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">{formatDate(message.seenAt)}</div>
            </div>
          </div>
          
          <div className="h-px bg-[var(--border-light)] ml-[64px]" />
          
          {/* Delivered Status */}
          <div className="px-5 py-4 flex items-center gap-6 select-none hover:bg-[var(--bg-hover)] transition-colors">
            <div className="text-xl text-[var(--text-secondary)] shrink-0 font-bold">✓✓</div>
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Delivered</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">{formatDate(message.deliveredAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInfoModal;
