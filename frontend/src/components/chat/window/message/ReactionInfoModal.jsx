import React from 'react';

const ReactionInfoModal = ({ reactions, users, onClose }) => {
  const getUsername = (userId) => {
    const user = users.find(u => u.userId === userId);
    return user ? user.username : "Unknown User";
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center backdrop-blur-xs animate-overlay-fade" onClick={onClose}>
      <div className="bg-[var(--bg-sidebar)] rounded-2xl p-6 w-[90%] max-w-[380px] shadow-2xl flex flex-col gap-4 animate-modal-appear" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-[var(--border-light)] pb-3">
          <h3 className="text-lg font-bold text-[var(--text-primary)] m-0">Reactions</h3>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] border-none bg-transparent cursor-pointer transition text-lg" onClick={onClose}>✕</button>
        </div>
        <div className="flex border-b border-[var(--border-light)] pb-2 select-none">
          <div className="text-xs font-semibold text-whatsapp-green border-b-2 border-whatsapp-green px-3 pb-2 cursor-default">All {reactions.length}</div>
        </div>
        <div className="flex flex-col gap-2.5 max-h-[250px] overflow-y-auto pr-1">
          {reactions.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-1.5 hover:bg-white/5 rounded-xl transition select-none">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-whatsapp-green text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  {getUsername(r.userId).charAt(0).toUpperCase()}
                </div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{getUsername(r.userId)}</div>
              </div>
              <div className="text-xl">{r.emoji}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReactionInfoModal;
