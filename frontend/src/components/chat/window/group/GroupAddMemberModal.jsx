import React from "react";
import { createPortal } from "react-dom";
import groupService from "../../../../services/groupService";

const API_BASE = "http://localhost:5000";

const GroupAddMemberModal = ({
  groupDetails,
  isAdmin,
  users,
  onClose,
  setGroupDetails
}) => {
  const eligibleUsers = users?.filter(u => 
    !u.isGroup && 
    !u.isCommunityGroup && 
    !groupDetails.members?.some(mId => String(mId) === String(u.userId))
  ) || [];

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500] flex items-center justify-center p-4 animate-[overlay-fade_0.2s_ease_forwards]" 
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-sidebar)] border border-[var(--border-light)] rounded-2xl p-6 w-full max-w-[380px] shadow-2xl flex flex-col gap-4 animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]" 
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2 text-left">
          {isAdmin ? "Add Member" : "Suggest Member"}
        </h3>
        <div className="max-h-[300px] overflow-y-auto flex flex-col gap-1 pr-1">
          {eligibleUsers.map(u => {
            const userAvatar = u.profilePicture
              ? (u.profilePicture.startsWith("http") ? u.profilePicture : `${API_BASE}${u.profilePicture}`)
              : null;
            
            const handleUserSelect = async () => {
              try {
                if (isAdmin) {
                  await groupService.addMemberToGroup(groupDetails.groupId, u.userId);
                  setGroupDetails(prev => ({ ...prev, members: [...(prev.members || []), u.userId] }));
                } else {
                  await groupService.requestAddMember(groupDetails.groupId, u.userId);
                  alert(`Invitation request for ${u.username} sent to admins.`);
                }
                onClose();
              } catch(err) { 
                console.error(err);
                alert(err.response?.data?.error || "Action failed"); 
              }
            };

            return (
              <div 
                key={u.userId} 
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition duration-200 cursor-pointer text-left" 
                onClick={handleUserSelect}
              >
                <div 
                  className="w-9 h-9 rounded-full bg-[var(--bg-input)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)] shrink-0 relative overflow-hidden"
                  style={{
                    backgroundImage: userAvatar ? `url(${userAvatar})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                >
                  {!userAvatar && u.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{u.username}</div>
                  <div className="text-xs text-[var(--text-secondary)] truncate">{u.status || "Hey there! I am using WhatsApp."}</div>
                </div>
              </div>
            );
          })}
          {eligibleUsers.length === 0 && (
            <div className="text-center py-6 text-sm text-[var(--text-secondary)]">No users available to add</div>
          )}
        </div>
        <button 
          className="w-full py-2.5 bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white text-sm font-semibold rounded-full shadow-md transition duration-200 cursor-pointer border-none outline-none" 
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
};

export default GroupAddMemberModal;
