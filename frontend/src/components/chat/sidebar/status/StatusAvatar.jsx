import React from 'react';

const StatusAvatar = ({ storiesCount, profilePicture, username, size = 48 }) => {
  const radius = 21;
  const strokeWidth = 2.5;
  const circumference = 2 * Math.PI * radius;
  
  if (!storiesCount || storiesCount === 0) {
    return (
      <div 
        className="rounded-full border-2 border-dashed border-[var(--text-muted)] flex items-center justify-center p-[2.5px] overflow-hidden relative shrink-0"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <div className="w-full h-full rounded-full bg-[var(--bg-input)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)] overflow-hidden">
          {profilePicture ? (
            <img src={profilePicture} className="w-full h-full object-cover" alt="" />
          ) : (
            username?.[0]?.toUpperCase()
          )}
        </div>
      </div>
    );
  }

  if (storiesCount === 1) {
    return (
      <div 
        className="rounded-full border-2 border-[var(--whatsapp-green)] border-solid flex items-center justify-center p-[2.5px] overflow-hidden relative shrink-0"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <div className="w-full h-full rounded-full bg-[var(--bg-input)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)] overflow-hidden">
          {profilePicture ? (
            <img src={profilePicture} className="w-full h-full object-cover" alt="" />
          ) : (
            username?.[0]?.toUpperCase()
          )}
        </div>
      </div>
    );
  }

  // Segmented ring calculation
  const gapSize = storiesCount === 2 ? 6 : storiesCount <= 4 ? 4 : 2; // gaps between segments
  const segmentLength = (circumference / storiesCount) - gapSize;
  const dashArray = `${segmentLength} ${gapSize}`;

  return (
    <div 
      className="relative flex items-center justify-center shrink-0 select-none"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 48 48">
        <circle 
          cx="24" 
          cy="24" 
          r={radius} 
          fill="none" 
          stroke="var(--whatsapp-green)" 
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
        />
      </svg>
      <div 
        className="rounded-full overflow-hidden bg-[var(--bg-input)] flex items-center justify-center font-bold text-xs text-[var(--text-primary)] relative z-10"
        style={{ width: `${size - 8}px`, height: `${size - 8}px` }}
      >
        {profilePicture ? (
          <img src={profilePicture} className="w-full h-full object-cover" alt="" />
        ) : (
          username?.[0]?.toUpperCase()
        )}
      </div>
    </div>
  );
};

export default StatusAvatar;
