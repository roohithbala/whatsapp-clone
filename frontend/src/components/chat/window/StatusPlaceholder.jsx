import React from 'react';

const StatusPlaceholder = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--bg-app)] p-6 select-none text-center">
      <div className="max-w-md flex flex-col items-center gap-5">
        <div className="w-24 h-24 rounded-full bg-[var(--bg-sidebar)] flex items-center justify-center shadow-lg border border-[var(--border-light)] text-[var(--text-secondary)]">
          <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="animate-[pulse_4s_infinite_ease-in-out]">
            <circle cx="12" cy="12" r="9" strokeDasharray="10, 4" />
            <circle cx="12" cy="12" r="3" fill="currentColor" className="text-[var(--whatsapp-green)]" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-2">
          Share status updates
        </h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm">
          Share photos, videos, and text updates that will disappear after 24 hours.
        </p>
      </div>
    </div>
  );
};

export default StatusPlaceholder;
