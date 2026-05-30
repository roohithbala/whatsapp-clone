import React, { useState, useEffect } from 'react';
import channelService from '../../../services/channelService';

const API_BASE = "http://localhost:5000";

const ChannelInfoPanel = ({ channel, onClose, currentUser, users }) => {
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [channelDetails, setChannelDetails] = useState(channel);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDesc, setEditedDesc] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [adminSearchTerm, setAdminSearchTerm] = useState("");

  const channelId = channel?.channelId || channel?.userId; // Sidebar selectedUser mapping overrides

  const fetchDetails = async () => {
    if (!channelId) return;
    try {
      const data = await channelService.getChannelById(channelId);
      setChannelDetails(data);
      setEditedName(data.name || "");
      setEditedDesc(data.description || "");
    } catch (err) {
      console.error("Failed to fetch channel details", err);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [channelId]);

  if (!channelDetails) return null;

  // Determine if the current user is an admin of this channel
  const adminsList = channelDetails.admins && channelDetails.admins.length > 0
    ? channelDetails.admins
    : [channelDetails.adminId];

  const isCurrentUserAdmin =
    String(channelDetails.adminId) === String(currentUser?.userId) ||
    adminsList.includes(String(currentUser?.userId));

  const handleUpdateChannel = async () => {
    if (!editedName.trim()) return;
    try {
      const updated = await channelService.updateChannel(channelId, {
        name: editedName,
        description: editedDesc
      });
      setChannelDetails(updated);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update channel details");
    }
  };

  const handlePromote = async (targetUserId) => {
    try {
      const updated = await channelService.promoteAdmin(channelId, targetUserId);
      setChannelDetails(updated);
      setShowAddAdmin(false);
    } catch (err) {
      alert("Failed to make user an admin");
    }
  };

  const handleDemote = async (targetUserId) => {
    if (String(targetUserId) === String(channelDetails.adminId)) {
      alert("Cannot demote the channel creator/owner");
      return;
    }
    try {
      const updated = await channelService.demoteAdmin(channelId, targetUserId);
      setChannelDetails(updated);
    } catch (err) {
      alert("Failed to dismiss admin");
    }
  };

  const followers = channelDetails.followers || [];

  const filteredFollowers = followers.filter(fId => {
    const followerId = String(fId);
    const details = users?.find(u => String(u.userId) === followerId) || { username: followerId };
    return details.username?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="w-[340px] h-full flex flex-col bg-[var(--bg-sidebar)] border-l border-[var(--border-light)] flex-shrink-0 animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-[var(--border-light)] flex items-center gap-3 bg-[var(--bg-sidebar-alt)] shrink-0">
        <button 
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors border-0 bg-transparent shrink-0" 
          onClick={onClose}
          title="Close"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Channel info</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-8">
        {/* Channel Details Card */}
        <div className="flex flex-col items-center justify-center p-6 bg-[var(--bg-sidebar)] border-b border-[var(--border-light)] gap-4">
          <div className="w-24 h-24 rounded-full bg-[var(--whatsapp-green)] flex items-center justify-center font-bold text-3xl text-white shadow-md overflow-hidden relative select-none">
            {channelDetails.avatarUrl ? (
              <img 
                src={channelDetails.avatarUrl.startsWith("http") ? channelDetails.avatarUrl : `${API_BASE}${channelDetails.avatarUrl}`} 
                className="w-full h-full object-cover" 
                alt={channelDetails.name}
              />
            ) : (
              channelDetails.name?.charAt(0).toUpperCase()
            )}
          </div>

          {isEditing ? (
            <div className="w-full px-4 flex flex-col gap-2">
              <input 
                className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm px-3 py-2 rounded-lg border border-[var(--border-input)] outline-none focus:border-[var(--whatsapp-green)] transition-all duration-200 text-center font-semibold" 
                value={editedName} 
                onChange={e => setEditedName(e.target.value)}
                placeholder="Channel name..."
              />
              <div className="flex gap-2 justify-center mt-1">
                <button 
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white text-sm cursor-pointer border-0 shadow-sm" 
                  onClick={handleUpdateChannel}
                  title="Save"
                >
                  ✓
                </button>
                <button 
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-sm cursor-pointer border-0 shadow-sm" 
                  onClick={() => setIsEditing(false)}
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center relative">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2">
                {channelDetails.name}
                {isCurrentUserAdmin && (
                  <span 
                    className="text-sm text-[var(--whatsapp-green)] cursor-pointer hover:underline p-1 ml-0.5" 
                    onClick={() => {
                      setEditedName(channelDetails.name);
                      setEditedDesc(channelDetails.description || "");
                      setIsEditing(true);
                    }}
                    title="Edit Name & Description"
                  >
                    ✎
                  </span>
                )}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Channel • {followers.length} followers</p>
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className="p-4 bg-[var(--bg-sidebar)] border-b border-[var(--border-light)] flex flex-col gap-2 text-left">
          <h4 className="text-xs font-bold text-[var(--whatsapp-green)] tracking-wider uppercase">Description</h4>
          {isEditing ? (
            <textarea 
              className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm px-3 py-2 rounded-lg border border-[var(--border-input)] outline-none focus:border-[var(--whatsapp-green)] transition-all duration-200 h-[75px] resize-none" 
              value={editedDesc} 
              onChange={e => setEditedDesc(e.target.value)}
              placeholder="Add description..."
            />
          ) : (
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              {channelDetails.description || "No description provided."}
            </p>
          )}
        </div>

        {/* Followers header with Search toggler */}
        <div className="px-4 pt-2 pb-1 flex justify-between items-center text-xs font-bold text-[var(--text-secondary)] tracking-wider uppercase">
          <span>{followers.length} followers</span>
          {followers.length > 0 && (
            <span 
              className="text-[var(--whatsapp-green)] cursor-pointer font-semibold hover:underline normal-case" 
              onClick={() => {
                setShowSearch(!showSearch);
                setSearchTerm("");
              }}
            >
              {showSearch ? 'Close Search' : 'Search'}
            </span>
          )}
        </div>
        
        {showSearch && (
          <div className="px-4">
            <input 
              className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs px-3 py-2 rounded-lg border border-[var(--border-input)] outline-none focus:border-[var(--whatsapp-green)] transition-all duration-200" 
              placeholder="Search followers..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        )}
        
        {/* Add Admin Button for Admins */}
        {isCurrentUserAdmin && (
          <div 
            className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition duration-200 text-[var(--whatsapp-green)] cursor-pointer text-left" 
            onClick={() => {
              setShowAddAdmin(true);
              setAdminSearchTerm("");
            }}
          >
            <div className="w-9 h-9 rounded-full bg-[var(--whatsapp-green)]/10 text-[var(--whatsapp-green)] font-bold text-lg flex items-center justify-center">+</div>
            <div className="text-sm font-semibold">Add admin</div>
          </div>
        )}

        {/* Followers List */}
        <div className="flex flex-col">
          {filteredFollowers.length > 0 ? (
            filteredFollowers.map(fId => {
              const followerId = String(fId);
              const isUserAdmin = adminsList.includes(followerId);
              const isOwner = followerId === String(channelDetails.adminId);
              const isSelf = followerId === String(currentUser?.userId);
              
              const details = users?.find(u => String(u.userId) === followerId) || { 
                username: isSelf ? 'You' : `Follower (${followerId.slice(0, 5)})`, 
                userId: followerId 
              };

              return (
                <div key={followerId} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition duration-200 text-left">
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
                      {details.status || 'Following channel'}
                    </div>
                  </div>
                  
                  {/* Admin Label */}
                  {isUserAdmin && (
                    <span 
                      className={`text-[9px] font-bold border px-1.5 py-0.5 rounded shrink-0 ${
                        isOwner
                          ? 'text-[var(--whatsapp-green)] border-[var(--whatsapp-green)]/35 bg-[var(--whatsapp-green)]/10'
                          : 'text-[var(--text-secondary)] border-[var(--border-light)] bg-[var(--bg-input)]'
                      }`}
                    >
                      {isOwner ? 'Owner' : 'Admin'}
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
            })
          ) : (
            <div className="px-4 py-6 text-center text-xs text-[var(--text-secondary)] italic">
              {followers.length === 0 ? "No followers yet." : "No matching followers found."}
            </div>
          )}
        </div>
      </div>

      {/* Add Admin Modal Overlay */}
      {showAddAdmin && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500] flex items-center justify-center p-4 animate-[overlay-fade_0.2s_ease_forwards]" 
          onClick={() => setShowAddAdmin(false)}
        >
          <div 
            className="bg-[var(--bg-sidebar)] border border-[var(--border-light)] rounded-2xl p-6 w-full max-w-[380px] shadow-2xl flex flex-col gap-4 animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]" 
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2 text-left">Add Admin</h3>
            
            {/* Modal search bar */}
            <input 
              className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm px-3 py-2 rounded-lg border border-[var(--border-input)] outline-none focus:border-[var(--whatsapp-green)] transition-all duration-200" 
              placeholder="Search users..." 
              value={adminSearchTerm}
              onChange={e => setAdminSearchTerm(e.target.value)}
              autoFocus
            />

            {/* List of eligible users */}
            <div className="max-h-[250px] overflow-y-auto flex flex-col gap-1 pr-1">
              {users?.filter(u => {
                // Do not show groups/communities or users already admins
                const isGroup = u.isGroup || u.isCommunityGroup || u.isChannel;
                const isAlreadyAdmin = adminsList.includes(String(u.userId));
                const matchesSearch = u.username?.toLowerCase().includes(adminSearchTerm.toLowerCase());
                return !isGroup && !isAlreadyAdmin && matchesSearch;
              }).map(u => (
                <div 
                  key={u.userId} 
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition duration-200 cursor-pointer text-left" 
                  onClick={() => handlePromote(u.userId)}
                >
                  <div className="w-9 h-9 rounded-full bg-[var(--bg-input)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)] shrink-0 overflow-hidden relative select-none">
                    {u.profilePicture ? (
                      <img 
                        src={u.profilePicture.startsWith("http") ? u.profilePicture : `${API_BASE}${u.profilePicture}`} 
                        className="w-full h-full object-cover" 
                        alt={u.username}
                      />
                    ) : (
                      u.username?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{u.username}</div>
                    <div className="text-xs text-[var(--text-secondary)] truncate">{u.status || 'Available'}</div>
                  </div>
                  <div className="text-[11px] font-bold text-[var(--whatsapp-green)] bg-[var(--whatsapp-green)]/10 px-2 py-0.5 rounded-full shrink-0">
                    + Add
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              className="w-full py-2.5 bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-sm font-semibold rounded-full border border-[var(--border-light)] transition duration-200 cursor-pointer" 
              onClick={() => setShowAddAdmin(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelInfoPanel;
