import React from "react";

const API_BASE = "http://localhost:5000";

const ChannelFollowerRow = ({
  followerId,
  adminsList,
  ownerId,
  currentUserId,
  userList,
  isCurrentUserAdmin,
  handlePromote,
  handleDemote
}) => {
  const isUserAdmin = adminsList.includes(followerId);
  const isOwner = followerId === String(ownerId);
  const isSelf = followerId === String(currentUserId);
  
  const details = userList?.find(u => String(u.userId) === followerId) || { 
    username: isSelf ? "You" : `Follower (${followerId.slice(0, 5)})`, 
    userId: followerId 
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition duration-200 text-left">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] flex items-center justify-center font-semibold text-sm text-[var(--text-primary)] shrink-0 overflow-hidden relative select-none">
        {details.profilePicture ? (
          <img 
            src={details.profilePicture.startsWith("http") ? details.profilePicture : `${API_BASE}${details.profilePicture}`} 
            className="w-full h-full object-cover" 
            alt={details.username}
          />
        ) : (
          details.username?.charAt(0).toUpperCase()
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
          {isSelf ? `${details.username} (You)` : details.username}
        </div>
        <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
          {details.status || "Following channel"}
        </div>
      </div>
      
      {/* Admin Label */}
      {isUserAdmin && (
        <span 
          className={`text-[9px] font-bold border px-1.5 py-0.5 rounded shrink-0 ${
            isOwner
              ? "text-[var(--whatsapp-green)] border-[var(--whatsapp-green)]/35 bg-[var(--whatsapp-green)]/10"
              : "text-[var(--text-secondary)] border-[var(--border-light)] bg-[var(--bg-input)]"
          }`}
        >
          {isOwner ? "Owner" : "Admin"}
        </span>
      )}
      
      {/* Action Buttons */}
      {isCurrentUserAdmin && !isSelf && !isOwner && (
        <div className="flex items-center shrink-0 ml-1">
          {isUserAdmin ? (
            <button 
              className="text-xs font-semibold text-red-500 hover:underline cursor-pointer border-0 bg-transparent py-1 px-2"
              onClick={() => handleDemote(followerId)}
            >
              Dismiss
            </button>
          ) : (
            <button 
              className="text-xs font-semibold text-[var(--whatsapp-green)] hover:underline cursor-pointer border-0 bg-transparent py-1 px-2"
              onClick={() => handlePromote(followerId)}
            >
              Make Admin
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ChannelFollowerRow;
