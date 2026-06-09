import React from "react";

const ChannelListItem = ({
  ch,
  currentUser,
  setSelectedUser,
  setRailMode,
  isFollowing,
  followersCount,
  handleFollow
}) => {
  const handleItemClick = () => {
    if (setSelectedUser) {
      const isAdmin = String(ch.adminId) === String(currentUser?.userId) ||
                      (ch.admins && ch.admins.includes(String(currentUser?.userId)));
      setSelectedUser({
        ...ch,
        userId: ch.channelId,
        username: ch.name,
        isChannel: true,
        isAdmin,
      });
    }
    if (setRailMode) {
      setRailMode("messages");
    }
  };

  return (
    <div 
      className="group flex items-center gap-3 px-3.5 py-3 mx-2 my-1 cursor-pointer select-none transition-all duration-300 rounded-xl relative border bg-transparent border-transparent hover:bg-[var(--chat-item-hover)] hover:border-[var(--border-light)] text-left"
      onClick={handleItemClick}
    >
      <div className="relative shrink-0">
        <div className="w-[44px] h-[44px] rounded-full overflow-hidden flex items-center justify-center font-semibold text-white text-base bg-gradient-to-tr from-[var(--avatar-bg)] to-[var(--text-muted)] relative shadow-sm">
          <span>{ch.name[0]?.toUpperCase()}</span>
          {ch.avatarUrl && (
            <img src={ch.avatarUrl} alt="" className="w-full h-full object-cover absolute inset-0" onError={e => { e.target.style.display = "none"; }} />
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 py-0.5">
        <div className="text-[14px] font-semibold text-[var(--text-primary)] flex items-center gap-1.5 truncate">
          <span className="truncate">{ch.name}</span>
          <span className="w-4 h-4 bg-whatsapp-green text-white rounded-full flex items-center justify-center text-[9px] shrink-0 font-bold" title="Verified Channel">✓</span>
        </div>
        <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 font-medium shrink-0">
          {followersCount} follower{followersCount !== 1 ? "s" : ""}
        </div>
        <div className="text-[12.5px] text-[var(--text-muted)] truncate mt-1 leading-normal">
          {ch.description || "Stay tuned for updates!"}
        </div>
      </div>

      <button 
        className={`ml-auto px-4 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition shrink-0 border-0 ${
          isFollowing 
            ? "bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]" 
            : "bg-whatsapp-green hover:bg-whatsapp-dark-green text-white shadow-md"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          handleFollow(ch.channelId);
        }}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
};

export default ChannelListItem;
