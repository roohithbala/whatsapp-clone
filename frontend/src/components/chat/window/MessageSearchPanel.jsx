import React from 'react';

const MessageSearchPanel = ({ isOpen, searchTerm, setSearchTerm, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="px-4 py-3 bg-[var(--bg-sidebar-alt)] border-b border-[var(--border-light)] flex gap-2 items-center animate-slideDown select-none">
      <div className="flex items-center gap-3 bg-[var(--bg-input)] border border-[var(--border-input)] px-4 py-1.5 rounded-full w-full">
        <span className="text-[var(--text-secondary)] text-sm">🔍</span>
        <input 
          type="text" 
          className="bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm outline-none w-full border-none focus:ring-0" 
          placeholder="Search messages..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <button 
        className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] border-0 bg-transparent cursor-pointer transition shrink-0" 
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  );
};

export default MessageSearchPanel;
