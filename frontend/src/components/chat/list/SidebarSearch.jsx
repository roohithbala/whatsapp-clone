import React from 'react';

const SidebarSearch = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="px-4 py-2.5">
      <div className="flex items-center gap-3 bg-[var(--bg-input)] px-3.5 h-[40px] rounded-2xl w-full border border-[var(--border-input)] focus-within:border-[var(--whatsapp-green)]/30 focus-within:shadow-[0_0_12px_rgba(0,217,166,0.06)] focus-within:bg-[var(--bg-sidebar)] transition-all duration-300">
        <svg viewBox="0 0 24 24" width="16" height="16" className="fill-[var(--text-secondary)] transition-colors duration-300 group-focus-within:fill-[var(--whatsapp-green)] shrink-0">
          <path d="M15.009 13.805h-.636l-.226-.217a5.184 5.184 0 0 0 1.256-3.386 5.2 5.2 0 1 0-5.2 5.2 5.184 5.184 0 0 0 3.386-1.256l.217.226v.636l4.022 4.013 1.199-1.2-4.013-4.022zm-4.807 0a3.606 3.606 0 1 1 0-7.211 3.606 3.606 0 0 1 0 7.211z"/>
        </svg>
        <input 
          type="text" 
          className="bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] text-[13px] font-medium outline-none w-full border-0"
          placeholder="Search or start a new chat" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SidebarSearch;
