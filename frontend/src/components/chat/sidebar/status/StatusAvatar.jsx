import React from 'react';

const API_BASE = "http://localhost:5000";

/**
 * Resolves a profile picture path to a full URL.
 * Handles relative paths like /uploads/photo.jpg → http://localhost:5000/uploads/photo.jpg
 */
const resolveProfilePic = (pic) => {
  if (!pic) return null;
  return pic.startsWith("http") ? pic : `${API_BASE}${pic}`;
};

const StatusAvatar = ({ storiesCount, profilePicture, username, size = 48 }) => {
  const picUrl = resolveProfilePic(profilePicture);
  const radius = 21;
  const strokeWidth = 2.5;
  const circumference = 2 * Math.PI * radius;

  const AvatarInner = ({ sizeOffset = 0 }) => (
    <div
      className="rounded-full overflow-hidden bg-gradient-to-tr from-[var(--whatsapp-green)] to-[var(--whatsapp-teal)] flex items-center justify-center font-bold text-white relative"
      style={{ width: `${size - sizeOffset}px`, height: `${size - sizeOffset}px`, fontSize: `${Math.max(12, (size - sizeOffset) * 0.35)}px` }}
    >
      {picUrl ? (
        <img
          src={picUrl}
          alt={username || ""}
          className="w-full h-full object-cover absolute inset-0"
          onError={e => { e.target.style.display = "none"; }}
        />
      ) : (
        username?.[0]?.toUpperCase()
      )}
    </div>
  );

  // No stories — dashed border
  if (!storiesCount || storiesCount === 0) {
    return (
      <div
        className="rounded-full border-2 border-dashed border-[var(--text-muted)] flex items-center justify-center p-[2px] overflow-hidden relative shrink-0 bg-[var(--bg-input)]"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <AvatarInner sizeOffset={6} />
      </div>
    );
  }

  // Single story — solid green border
  if (storiesCount === 1) {
    return (
      <div
        className="rounded-full border-2 border-[var(--whatsapp-green)] flex items-center justify-center p-[2.5px] overflow-hidden relative shrink-0 bg-[var(--bg-input)]"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <AvatarInner sizeOffset={7} />
      </div>
    );
  }

  // Multiple stories — segmented ring via SVG
  const gapSize = storiesCount === 2 ? 6 : storiesCount <= 4 ? 4 : 2;
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
        className="rounded-full overflow-hidden bg-gradient-to-tr from-[var(--whatsapp-green)] to-[var(--whatsapp-teal)] flex items-center justify-center font-bold text-white relative z-10"
        style={{ width: `${size - 8}px`, height: `${size - 8}px`, fontSize: `${Math.max(11, (size - 8) * 0.35)}px` }}
      >
        {picUrl ? (
          <img
            src={picUrl}
            alt={username || ""}
            className="w-full h-full object-cover absolute inset-0"
            onError={e => { e.target.style.display = "none"; }}
          />
        ) : (
          username?.[0]?.toUpperCase()
        )}
      </div>
    </div>
  );
};

export default StatusAvatar;
