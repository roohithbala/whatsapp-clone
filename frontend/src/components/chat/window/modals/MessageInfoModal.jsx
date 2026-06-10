import React from 'react';

const MessageInfoModal = ({ message, onClose, users = [], currentUser }) => {
  if (!message) return null;

  const formatDate = (date) => {
    // If it's a group or channel message, we can fall back to the message creation time since read receipt tracking differs
    const targetDate = date || ((message.isGroup || message.channelId) ? message.createdAt : null);
    if (!targetDate) return '---';
    const d = new Date(targetDate);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-[9999] flex items-center justify-center animate-[overlay-fade_0.2s_ease_forwards]" 
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-sidebar)] rounded-2xl w-[90%] max-w-[380px] shadow-2xl flex flex-col overflow-hidden animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-light)] flex items-center gap-4 bg-[var(--bg-sidebar-alt)]">
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors border-none bg-transparent" 
            onClick={onClose}
          >
            ←
          </button>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Message info</h2>
        </div>
        
        {/* Message Preview */}
        <div className="p-5 bg-[var(--bg-chat)] border-b border-[var(--border-light)] flex justify-end w-full overflow-hidden box-border">
          <div className="bg-gradient-to-tr from-[var(--whatsapp-teal)] to-[var(--whatsapp-green)] text-white p-3.5 rounded-2xl rounded-tr-none shadow-md max-w-[80%] text-left relative select-text break-words w-fit">
             <div className="text-[14.2px] leading-relaxed">
               {message.text || (message.mediaUrl ? 'Media attached' : 'Message')}
             </div>
             <div className="text-[10px] text-right mt-1.5 opacity-70">
               {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </div>
          </div>
        </div>

        {/* Message Status Times */}
        <div className="bg-[var(--bg-sidebar)] flex-grow overflow-y-auto flex flex-col min-h-0 max-h-[300px]">
          {(message.isGroup || message.channelId) ? (
            <>
              {/* Group Read Status List */}
              <div className="p-3 bg-[var(--bg-sidebar-alt)] text-[var(--whatsapp-green)] font-bold text-xs uppercase tracking-wider text-left border-b border-[var(--border-light)]">
                Read By
              </div>
              {(!message.userSeenList || message.userSeenList.length <= 1) ? (
                <div className="p-4 text-xs text-[var(--text-secondary)] italic text-left">No one has read this message yet.</div>
              ) : (
                message.userSeenList.filter(s => s.userId !== message.senderId).map((s, idx) => {
                  const member = (s.userId === currentUser?.userId ? currentUser : users.find(u => u.userId === s.userId)) || {};
                  const memberName = member.username || member.name || `User (${s.userId.slice(0, 4)})`;
                  return (
                    <div key={`read-${idx}`} className="px-5 py-3 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors select-none text-left">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{memberName}</span>
                      <span className="text-xs text-[var(--text-secondary)]">{formatDate(s.seenAt)}</span>
                    </div>
                  );
                })
              )}

              {/* Group Delivered Status List */}
              <div className="p-3 bg-[var(--bg-sidebar-alt)] text-[var(--text-secondary)] font-bold text-xs uppercase tracking-wider text-left border-t border-b border-[var(--border-light)] mt-2">
                Delivered To
              </div>
              {(!message.userDeliveryList || message.userDeliveryList.length <= 1) ? (
                <div className="p-4 text-xs text-[var(--text-secondary)] italic text-left">No one has received this message yet.</div>
              ) : (
                message.userDeliveryList.filter(d => d.userId !== message.senderId).map((d, idx) => {
                  const member = (d.userId === currentUser?.userId ? currentUser : users.find(u => u.userId === d.userId)) || {};
                  const memberName = member.username || member.name || `User (${d.userId.slice(0, 4)})`;
                  return (
                    <div key={`del-${idx}`} className="px-5 py-3 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors select-none text-left">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{memberName}</span>
                      <span className="text-xs text-[var(--text-secondary)]">{formatDate(d.deliveredAt)}</span>
                    </div>
                  );
                })
              )}
            </>
          ) : (
            <>
              {/* Read Status */}
              <div className="px-5 py-4 flex items-center gap-6 select-none hover:bg-[var(--bg-hover)] transition-colors">
                <svg viewBox="0 0 16 15" width="20" height="19" className="fill-[#53bdeb] shrink-0">
                  <path d="M15 3.3L8.5 9.8 5.7 7l-1.4 1.4 4.2 4.2 8-8z" />
                  <path d="M11 3.3L4.5 9.8 1.7 7l-1.4 1.4 4.2 4.2 8-8z" className="opacity-70" />
                </svg>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-[var(--text-primary)]">Read</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">{formatDate(message.seenAt)}</div>
                </div>
              </div>
              
              <div className="h-px bg-[var(--border-light)] ml-[64px]" />
              
              {/* Delivered Status */}
              <div className="px-5 py-4 flex items-center gap-6 select-none hover:bg-[var(--bg-hover)] transition-colors">
                <svg viewBox="0 0 16 15" width="20" height="19" className="fill-[var(--text-secondary)] shrink-0">
                  <path d="M15 3.3L8.5 9.8 5.7 7l-1.4 1.4 4.2 4.2 8-8z" />
                  <path d="M11 3.3L4.5 9.8 1.7 7l-1.4 1.4 4.2 4.2 8-8z" className="opacity-70" />
                </svg>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-[var(--text-primary)]">Delivered</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">{formatDate(message.deliveredAt)}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInfoModal;
