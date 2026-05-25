import React from 'react';

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "favorites", label: "Favorites" },
  { key: "groups", label: "Groups" },
];

const SidebarFilters = ({ quickFilter, setQuickFilter, setListScope }) => {
  return (
    <div className="flex items-center gap-2 px-4 pt-1 pb-3 overflow-x-auto scrollbar-none select-none">
      {FILTERS.map(f => (
        <button
          key={f.key}
          type="button"
          className={`rounded-full text-[12.5px] font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap border shrink-0 ${
            quickFilter === f.key 
              ? "bg-gradient-to-tr from-[var(--whatsapp-teal)] to-[var(--whatsapp-green)] text-white border-transparent shadow-[0_4px_12px_rgba(0,217,166,0.2)]" 
              : "bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-input)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          }`}
          style={{ padding: '6px 16px' }}
          onClick={() => {
            setQuickFilter(f.key);
            if (f.key === "all") setListScope("all");
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};

export default SidebarFilters;
