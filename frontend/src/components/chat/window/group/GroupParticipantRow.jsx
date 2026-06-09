import React from "react";
import api from "../../../../services/api";

const API_BASE = "http://localhost:5000";

const GroupParticipantRow = ({
  memberId,
  groupDetails,
  currentUser,
  users,
  isAdmin,
  setGroupDetails
}) => {
  const memberDetails = users?.find(u => String(u.userId) === memberId) || { 
    username: memberId === String(currentUser?.userId) ? "You" : "Unknown", 
    userId: memberId 
  };
  
  const isUserAdmin = groupDetails.adminIds?.some(id => String(id) === memberId) || memberId === String(groupDetails.adminId);
  
  const memberAvatar = memberDetails.profilePicture
    ? (memberDetails.profilePicture.startsWith("http") ? memberDetails.profilePicture : `${API_BASE}${memberDetails.profilePicture}`)
    : null;

  const handleDemote = async () => {
    try {
      await api.post(`/groups/${groupDetails.groupId}/demote`, { userId: memberId });
      setGroupDetails(prev => ({ ...prev, adminIds: prev.adminIds.filter(id => String(id) !== memberId) }));
    } catch(err) { 
      alert("Failed to demote"); 
    }
  };

  const handlePromote = async () => {
    try {
      await api.post(`/groups/${groupDetails.groupId}/promote`, { userId: memberId });
      setGroupDetails(prev => ({ ...prev, adminIds: [...(prev.adminIds || []), memberId] }));
    } catch(err) { 
      alert("Failed to promote"); 
    }
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Remove ${memberDetails.username}?`)) {
      try {
        await api.delete(`/groups/${groupDetails.groupId}/members/${memberId}`);
        setGroupDetails(prev => ({ ...prev, members: prev.members.filter(id => String(id) !== memberId) }));
      } catch(err) { 
        alert("Failed to remove member"); 
      }
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition duration-200 text-left">
      <div 
        className="w-10 h-10 rounded-full bg-[var(--bg-input)] flex items-center justify-center font-semibold text-sm text-[var(--text-primary)] shrink-0 relative overflow-hidden"
        style={{
          backgroundImage: memberAvatar ? `url(${memberAvatar})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {!memberAvatar && (memberDetails.username?.charAt(0).toUpperCase() || "?")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{memberDetails.username}</div>
        <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{memberDetails.status || "Available"}</div>
      </div>
      
      {isUserAdmin && (
        <span className="text-[10px] font-bold text-[var(--whatsapp-green)] border border-[var(--whatsapp-green)]/35 px-1.5 py-0.5 rounded bg-[var(--whatsapp-green)]/10 shrink-0">
          Group Admin
        </span>
      )}
      
      <div className="flex items-center gap-2 shrink-0">
        {isAdmin && memberId !== String(currentUser?.userId) && (
          <>
            {isUserAdmin ? (
              <button 
                className="text-xs font-semibold text-[var(--text-secondary)] hover:text-red-500 cursor-pointer bg-transparent border-none outline-none" 
                onClick={handleDemote}
              >
                Dismiss Admin
              </button>
            ) : (
              <button 
                className="text-xs font-semibold text-[var(--whatsapp-green)] hover:text-[var(--whatsapp-dark-green)] cursor-pointer bg-transparent border-none outline-none" 
                onClick={handlePromote}
              >
                Make Admin
              </button>
            )}
            
            <button 
              className="text-xs font-semibold text-red-500 hover:text-red-600 cursor-pointer bg-transparent border-none outline-none" 
              onClick={handleRemove}
            >
              Remove
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupParticipantRow;
