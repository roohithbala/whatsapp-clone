import React from 'react';

const StatusViewersModal = ({ viewers, onClose }) => {
  if (!viewers) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500] flex items-center justify-center p-4 animate-[overlay-fade_0.2s_ease_forwards]" 
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-sidebar)] border border-[var(--border-light)] rounded-2xl p-6 w-full max-w-[360px] shadow-2xl flex flex-col gap-4 animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]" 
        onClick={e => e.stopPropagation()}
      >
         <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">Viewed by</h3>
         <div className="max-h-[300px] overflow-y-auto flex flex-col gap-1 pr-1">
            {viewers.length > 0 ? viewers.map(viewer => (
              <div key={viewer._id || viewer} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200">
                 <div className="w-8 h-8 rounded-full bg-[var(--bg-input)] flex items-center justify-center font-semibold text-xs text-[var(--text-primary)]">{viewer.username?.[0] || '?'}</div>
                 <div className="text-sm font-medium text-[var(--text-primary)]">{viewer.username || 'Unknown'}</div>
              </div>
            )) : (
              <p className="text-center text-sm text-[var(--text-secondary)] py-4">No views yet</p>
            )}
         </div>
         <button 
           className="w-full py-2.5 bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white text-sm font-semibold rounded-full shadow-md transition-all duration-200 cursor-pointer" 
           onClick={onClose}
         >
           Close
         </button>
      </div>
    </div>
  );
};

export default StatusViewersModal;
