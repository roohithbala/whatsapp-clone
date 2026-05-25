import React from 'react';

const ForwardModal = ({ 
  forwardingMessage, 
  setForwardingMessage, 
  messageSearchTerm, 
  setMessageSearchTerm, 
  users, 
  handleForwardMessage 
}) => {
  if (!forwardingMessage) return null;

  return (
    <div className="whatsapp-modal-overlay select-none" onClick={() => { setForwardingMessage(null); setMessageSearchTerm(""); }}>
      <div className="whatsapp-modal w-[90%] max-w-[400px] flex flex-col gap-4 max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Forward message</h3>
        <input 
          type="text"
          placeholder="Search contacts"
          value={messageSearchTerm}
          onChange={(e) => setMessageSearchTerm(e.target.value)}
          className="whatsapp-input w-full"
        />
        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
          {users
            .filter(u => u.username?.toLowerCase().includes(messageSearchTerm.toLowerCase()))
            .map(u => (
              <div 
                key={u.userId}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200 cursor-pointer text-left"
                onClick={async () => {
                  const confirmForward = window.confirm(`Forward this message to ${u.username}?`);
                  if (confirmForward) {
                    handleForwardMessage(u);
                  }
                }}
              >
                <div className="w-9 h-9 rounded-full bg-whatsapp-green text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {u.username?.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm font-medium text-[var(--text-primary)]">{u.username}</div>
              </div>
            ))}
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--border-light)] pt-3 mt-1">
          <button className="px-4 py-2 text-xs font-semibold text-whatsapp-green hover:bg-whatsapp-green/5 rounded-lg border-0 bg-transparent cursor-pointer transition" onClick={() => { setForwardingMessage(null); setMessageSearchTerm(""); }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;
