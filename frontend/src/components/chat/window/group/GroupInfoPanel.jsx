import React, { useState, useEffect, useRef } from "react";
import api from "../../../../services/api";
import groupService from "../../../../services/groupService";
import userService from "../../../../services/userService";
import GroupParticipantRow from "./GroupParticipantRow";
import GroupAddMemberModal from "./GroupAddMemberModal";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const GroupInfoPanel = ({ group, onClose, currentUser, users, onGroupUpdate }) => {
  const [showAddMember, setShowAddMember] = useState(false);
  const [groupDetails, setGroupDetails] = useState(group);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (group?.groupId) {
      const fetchDetails = async () => {
        try {
          const res = await api.get(`/groups/${group.groupId}`);
          setGroupDetails(res.data);
        } catch (err) {
          console.error("Failed to fetch group details", err);
        }
      };
      fetchDetails();
    }
  }, [group]);

  const isAdmin = groupDetails?.adminIds?.some(id => String(id) === String(currentUser?.userId)) || String(groupDetails?.adminId) === String(currentUser?.userId);

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedName, setEditedName] = useState(groupDetails?.username || groupDetails?.name || "");
  const [editedDesc, setEditedDesc] = useState(groupDetails?.description || "");

  useEffect(() => {
    if (groupDetails) {
      setEditedName(groupDetails.name || groupDetails.username || "");
      setEditedDesc(groupDetails.description || "");
      
      if (isAdmin && groupDetails.groupId) {
        const fetchRequests = async () => {
          try {
            const data = await groupService.getInviteRequests(groupDetails.groupId);
            setPendingRequests(data);
          } catch (err) {
            console.error("Failed to fetch invite requests", err);
          }
        };
        fetchRequests();
      }
    }
  }, [groupDetails, isAdmin]);

  const handleUpdateGroup = async () => {
    try {
      const updated = await groupService.updateGroupInfo(groupDetails.groupId, { name: editedName, description: editedDesc });
      setGroupDetails(updated);
      setIsEditing(false);
      if (onGroupUpdate) onGroupUpdate(updated);
    } catch (err) { 
      alert("Failed to update group"); 
    }
  };

  const handleAvatarClick = () => {
    if (isAdmin && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const data = await userService.uploadFile(file);
      const avatarUrl = data.relativeUrl || data.url;
      const updated = await groupService.updateGroupInfo(groupDetails.groupId, { avatarUrl });
      setGroupDetails(updated);
      if (onGroupUpdate) onGroupUpdate(updated);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filteredMembers = groupDetails.members?.filter(mId => {
    const memberId = String(mId);
    const memberDetails = users?.find(u => String(u.userId) === memberId) || { username: memberId };
    return memberDetails.username?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const handleCopyLink = () => {
    const link = `${window.location.origin}/join/${groupDetails.groupId}`;
    navigator.clipboard.writeText(link);
    alert("Invite link copied to clipboard!");
  };

  if (!groupDetails) return null;

  const avatarUrl = groupDetails.avatarUrl;
  const isImageAvatar = !!avatarUrl;
  const displayAvatarUrl = isImageAvatar
    ? (avatarUrl.startsWith("http") ? avatarUrl : `${API_BASE}${avatarUrl}`)
    : null;

  return (
    <div className="w-[340px] h-full flex flex-col bg-[var(--bg-sidebar)] border-l border-[var(--border-light)] flex-shrink-0">
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
        <h2 className="text-base font-semibold text-[var(--text-primary)]">{groupDetails.isCommunityGroup ? "Community" : "Group"} info</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-8">
        {/* Avatar and Info Header */}
        <div className="flex flex-col items-center justify-center p-6 bg-[var(--bg-sidebar)] border-b border-[var(--border-light)] gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: "none" }} 
            accept="image/*" 
            onChange={handleFileChange} 
          />
          <div 
            className={`w-24 h-24 rounded-full bg-[var(--whatsapp-green)] text-white text-3xl font-bold flex items-center justify-center relative overflow-hidden shadow-md select-none border-2 border-[var(--border-light)] ${isAdmin ? "cursor-pointer group" : ""}`}
            style={{ 
              backgroundImage: displayAvatarUrl ? `url(${displayAvatarUrl})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: isUploadingAvatar ? 0.5 : 1
            }}
            onClick={handleAvatarClick}
            title={isAdmin ? "Change Group Photo" : ""}
          >
            {!isImageAvatar && !isUploadingAvatar && (groupDetails.username?.charAt(0).toUpperCase() || groupDetails.name?.charAt(0).toUpperCase())}
            {isUploadingAvatar && <span className="text-xs text-white">Loading...</span>}
            {isAdmin && !isUploadingAvatar && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center p-2">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white mb-1">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span className="text-white text-[9px] font-bold uppercase tracking-wider">Change Photo</span>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="w-full px-4 flex flex-col gap-2">
              <input 
                className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm px-3 py-2 rounded-lg border border-[var(--border-input)] outline-none focus:border-[var(--whatsapp-green)] transition-all duration-200 text-center font-semibold" 
                value={editedName} 
                onChange={e => setEditedName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2 justify-center">
                <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-sm cursor-pointer border border-[var(--border-light)]" onClick={handleUpdateGroup} title="Save">✅</button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-sm cursor-pointer border border-[var(--border-light)]" onClick={() => setIsEditing(false)} title="Cancel">❌</button>
              </div>
            </div>
          ) : (
            <div className="text-center relative max-w-full px-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2 truncate">
                <span className="truncate max-w-[200px]">{groupDetails.username || groupDetails.name}</span>
                {isAdmin && (
                  <span 
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--whatsapp-green)] cursor-pointer transition duration-200" 
                    onClick={() => setIsEditing(true)}
                    title="Edit Name"
                  >
                    ✎
                  </span>
                )}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{groupDetails.isCommunityGroup ? "Community" : "Group"} • {groupDetails.members?.length || 0} participants</p>
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className="p-4 bg-[var(--bg-sidebar)] border-b border-[var(--border-light)] flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[var(--whatsapp-green)] tracking-wider uppercase">Description</h4>
            {isAdmin && !isEditingDesc && (
              <span 
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--whatsapp-green)] cursor-pointer transition duration-200" 
                onClick={() => setIsEditingDesc(true)}
                title="Edit Description"
              >
                ✎
              </span>
            )}
          </div>
          {isEditingDesc ? (
             <div className="flex flex-col gap-2 w-full">
               <textarea 
                 className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm px-3 py-2 rounded-lg border border-[var(--border-input)] outline-none focus:border-[var(--whatsapp-green)] transition-all duration-200 h-[80px] resize-none" 
                 value={editedDesc} 
                 onChange={e => setEditedDesc(e.target.value)}
                 autoFocus
               />
               <div className="flex gap-2 justify-end">
                 <button 
                   className="px-2.5 py-1 rounded bg-[var(--whatsapp-green)] text-white text-xs font-semibold cursor-pointer border-none"
                   onClick={async () => {
                     try {
                       const updated = await groupService.updateGroupInfo(groupDetails.groupId, { description: editedDesc });
                       setGroupDetails(updated);
                       setIsEditingDesc(false);
                       if (onGroupUpdate) onGroupUpdate(updated);
                     } catch (err) {
                       alert("Failed to update description");
                     }
                   }}
                 >
                   Save
                 </button>
                 <button 
                   className="px-2.5 py-1 rounded bg-transparent border border-[var(--border-light)] text-[var(--text-secondary)] text-xs font-semibold cursor-pointer"
                   onClick={() => {
                     setEditedDesc(groupDetails.description || "");
                     setIsEditingDesc(false);
                   }}
                 >
                   Cancel
                 </button>
               </div>
             </div>
          ) : (
             <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap break-words">
               {groupDetails.description || `Welcome to ${groupDetails.username || groupDetails.name}! Respect all members.`}
             </p>
          )}
        </div>

        {/* Invite Link */}
        <div className="px-4 border-b border-[var(--border-light)] pb-4 text-left">
          <button className="text-[var(--whatsapp-green)] cursor-pointer flex items-center gap-3 py-2 text-sm font-semibold hover:underline bg-transparent border-none outline-none" onClick={handleCopyLink}>
            <span className="text-lg">🔗</span> Invite via link
          </button>
        </div>

        {/* Group Settings / Toggle for Admin only send */}
        {isAdmin && (
          <div className="p-4 bg-[var(--bg-sidebar)] border-b border-[var(--border-light)] flex flex-col gap-2.5 text-left">
            <h4 className="text-xs font-bold text-[var(--whatsapp-green)] tracking-wider uppercase">Group Settings</h4>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-[var(--text-primary)] font-medium">Only admins can send messages</span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={!!groupDetails.onlyAdminsCanPost} 
                  onChange={async (e) => {
                    const checked = e.target.checked;
                    try {
                      const updated = await groupService.updateGroupInfo(groupDetails.groupId, { onlyAdminsCanPost: checked });
                      setGroupDetails(updated);
                      if (onGroupUpdate) onGroupUpdate(updated);
                    } catch (err) {
                      alert("Failed to update setting");
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--whatsapp-green)]"></div>
              </label>
            </div>
          </div>
        )}

        {/* Settings view for non-admins */}
        {!isAdmin && groupDetails.onlyAdminsCanPost && (
          <div className="p-4 bg-[var(--bg-sidebar)] border-b border-[var(--border-light)] text-left flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)] italic">
              🔒 Only admins can send messages in this group.
            </span>
          </div>
        )}

        {/* Pending Requests for Admins */}
        {isAdmin && pendingRequests.length > 0 && (
          <div className="px-4 py-3 border-b border-[var(--border-light)] bg-[var(--bg-sidebar-alt)]/30 text-left">
            <h4 className="text-xs font-bold text-[var(--whatsapp-green)] tracking-wider uppercase mb-3 flex items-center justify-between">
              <span>Pending Invitations</span>
              <span className="bg-[var(--whatsapp-green)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            </h4>
            <div className="flex flex-col gap-2">
              {pendingRequests.map((req) => (
                <div key={req.requestId} className="flex flex-col gap-2 p-3 bg-[var(--bg-sidebar)] border border-[var(--border-light)] rounded-xl relative">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-input)] flex items-center justify-center font-bold text-xs text-[var(--text-primary)] shrink-0">
                      {req.requestedUser?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {req.requestedUser?.username || "Unknown User"}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] truncate">
                        Suggested by: <span className="font-medium">{req.requestedByUser?.username || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-1 border-t border-[var(--border-light)]/40 pt-2">
                    <button 
                      className="px-3 py-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs font-semibold rounded-full border border-red-500/25 transition-all duration-200 cursor-pointer"
                      onClick={async () => {
                        try {
                          await groupService.rejectInviteRequest(groupDetails.groupId, req.requestId);
                          setPendingRequests(prev => prev.filter(r => r.requestId !== req.requestId));
                        } catch (err) {
                          alert("Failed to reject request");
                        }
                      }}
                    >
                      Decline
                    </button>
                    <button 
                      className="px-3 py-1 bg-[var(--whatsapp-green)]/10 hover:bg-[var(--whatsapp-green)] text-[var(--whatsapp-green)] hover:text-white text-xs font-semibold rounded-full border border-[var(--whatsapp-green)]/25 transition-all duration-200 cursor-pointer"
                      onClick={async () => {
                        try {
                          await groupService.approveInviteRequest(groupDetails.groupId, req.requestId);
                          setPendingRequests(prev => prev.filter(r => r.requestId !== req.requestId));
                          const res = await api.get(`/groups/${groupDetails.groupId}`);
                          setGroupDetails(res.data);
                        } catch (err) {
                          alert("Failed to approve request");
                        }
                      }}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participants Header */}
        <div className="px-4 pt-2 pb-1 flex justify-between items-center text-xs font-semibold text-[var(--text-secondary)]">
          <span>{groupDetails.members?.length || 0} participants</span>
          <span className="text-[var(--whatsapp-green)] cursor-pointer font-semibold hover:underline" onClick={() => setShowSearch(!showSearch)}>
            {showSearch ? "Close Search" : "Search"}
          </span>
        </div>
        
        {/* Participants Search */}
        {showSearch && (
          <div className="px-4">
            <input 
              className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs px-3 py-2 rounded-lg border border-[var(--border-input)] outline-none focus:border-[var(--whatsapp-green)] transition-all duration-200" 
              placeholder="Search participants..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        )}
        
        {/* Add/Suggest Member Trigger Button */}
        <div 
          className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition duration-200 text-[var(--whatsapp-green)] cursor-pointer text-left" 
          onClick={() => setShowAddMember(true)}
        >
          <div className="w-9 h-9 rounded-full bg-[var(--whatsapp-green)]/10 text-[var(--whatsapp-green)] font-bold text-lg flex items-center justify-center">+</div>
          <div className="text-sm font-semibold">{isAdmin ? "Add member" : "Suggest member"}</div>
        </div>

        {/* Render Members */}
        <div className="flex flex-col">
          {filteredMembers.map(m => (
            <GroupParticipantRow
              key={String(m)}
              memberId={String(m)}
              groupDetails={groupDetails}
              currentUser={currentUser}
              users={users}
              isAdmin={isAdmin}
              setGroupDetails={setGroupDetails}
            />
          ))}
        </div>
      </div>

      {/* Suggest/Add Member Portal Modal */}
      {showAddMember && (
        <GroupAddMemberModal
          groupDetails={groupDetails}
          isAdmin={isAdmin}
          users={users}
          onClose={() => setShowAddMember(false)}
          setGroupDetails={setGroupDetails}
        />
      )}
    </div>
  );
};

export default GroupInfoPanel;
