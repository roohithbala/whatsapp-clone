import React, { useState } from 'react';
import api from '../../../services/api';

const GroupInfoPanel = ({ group, onClose, currentUser, users }) => {
  const [showAddMember, setShowAddMember] = useState(false);
  const [groupDetails, setGroupDetails] = useState(group);

  React.useEffect(() => {
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
  const [editedName, setEditedName] = useState(groupDetails?.username || groupDetails?.name || "");
  const [editedDesc, setEditedDesc] = useState(groupDetails?.description || "");

  const handleUpdateGroup = async () => {
    try {
      const res = await api.put(`/groups/${groupDetails.groupId}`, { name: editedName, description: editedDesc });
      setGroupDetails(res.data);
      setIsEditing(false);
    } catch (err) { alert("Failed to update group"); }
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
        <h2 className="text-base font-semibold text-[var(--text-primary)]">{groupDetails.isCommunityGroup ? 'Community' : 'Group'} info</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-8">
        <div className="flex flex-col items-center justify-center p-6 bg-[var(--bg-sidebar)] border-b border-[var(--border-light)] gap-4">
          <div className="w-24 h-24 rounded-full bg-[var(--whatsapp-green)] flex items-center justify-center font-bold text-3xl text-white shadow-md">
            {groupDetails.username?.charAt(0).toUpperCase() || groupDetails.name?.charAt(0).toUpperCase()}
          </div>
          {isEditing ? (
            <div className="w-full px-4 flex flex-col gap-2">
              <input 
                className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm px-3 py-2 rounded-lg border border-[var(--border-input)] outline-none focus:border-[var(--whatsapp-green)] transition-all duration-200 text-center" 
                value={editedName} 
                onChange={e => setEditedName(e.target.value)}
              />
              <div className="flex gap-2 justify-center">
                <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-sm cursor-pointer" onClick={handleUpdateGroup}>✅</button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-sm cursor-pointer" onClick={() => setIsEditing(false)}>❌</button>
              </div>
            </div>
          ) : (
            <div className="text-center relative">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2">
                {groupDetails.username || groupDetails.name}
                {isAdmin && <span className="text-sm text-[var(--whatsapp-green)] cursor-pointer hover:underline" onClick={() => setIsEditing(true)}>✎</span>}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{groupDetails.isCommunityGroup ? 'Community' : 'Group'} • {groupDetails.members?.length || 0} participants</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-[var(--bg-sidebar)] border-b border-[var(--border-light)] flex flex-col gap-2 text-left">
          <h4 className="text-xs font-bold text-[var(--whatsapp-green)] tracking-wider uppercase">Description</h4>
          {isEditing ? (
             <textarea 
               className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm px-3 py-2 rounded-lg border border-[var(--border-input)] outline-none focus:border-[var(--whatsapp-green)] transition-all duration-200 h-[60px] resize-none" 
               value={editedDesc} 
               onChange={e => setEditedDesc(e.target.value)}
             />
          ) : (
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              {groupDetails.description || `Welcome to ${groupDetails.username || groupDetails.name}! Respect all members.`}
            </p>
          )}
        </div>

        <div className="px-4 border-b border-[var(--border-light)] pb-4 text-left">
          <button className="text-[var(--whatsapp-green)] cursor-pointer flex items-center gap-3 py-2 text-sm font-semibold hover:underline" onClick={handleCopyLink}>
            <span className="text-lg">🔗</span> Invite via link
          </button>
        </div>

        <div className="px-4 pt-2 pb-1 flex justify-between items-center text-xs font-semibold text-[var(--text-secondary)]">
          <span>{groupDetails.members?.length || 0} participants</span>
          <span className="text-[var(--whatsapp-green)] cursor-pointer font-semibold hover:underline" onClick={() => setShowSearch(!showSearch)}>
            {showSearch ? 'Close Search' : 'Search'}
          </span>
        </div>
        
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
        
        {isAdmin && (
          <div 
            className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition duration-200 text-[var(--whatsapp-green)] cursor-pointer text-left" 
            onClick={() => setShowAddMember(true)}
          >
            <div className="w-9 h-9 rounded-full bg-[var(--whatsapp-green)]/10 text-[var(--whatsapp-green)] font-bold text-lg flex items-center justify-center">+</div>
            <div className="text-sm font-semibold">Add member</div>
          </div>
        )}

        {/* Render Members */}
        <div className="flex flex-col">
          {filteredMembers.map(m => {
            const memberId = String(m);
            const memberDetails = users?.find(u => String(u.userId) === memberId) || { username: memberId === String(currentUser?.userId) ? 'You' : 'Unknown', userId: memberId };
            const isUserAdmin = groupDetails.adminIds?.some(id => String(id) === memberId) || memberId === String(groupDetails.adminId);
            
            return (
              <div key={memberId} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition duration-200 text-left">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] flex items-center justify-center font-semibold text-sm text-[var(--text-primary)] shrink-0">
                  {memberDetails.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{memberDetails.username}</div>
                  <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{memberDetails.status || 'Available'}</div>
                </div>
                
                {isUserAdmin && (
                  <span className="text-[10px] font-bold text-[var(--whatsapp-green)] border border-[var(--whatsapp-green)]/35 px-1.5 py-0.5 rounded bg-[var(--whatsapp-green)]/10">
                    Group Admin
                  </span>
                )}
                
                <div className="flex items-center gap-2">
                  {isAdmin && memberId !== String(currentUser?.userId) && (
                    <>
                      {isUserAdmin ? (
                        <button className="text-xs font-semibold text-[var(--text-secondary)] hover:text-red-500 cursor-pointer" onClick={async () => {
                          try {
                            await api.post(`/groups/${groupDetails.groupId}/demote`, { userId: memberId });
                            setGroupDetails(prev => ({ ...prev, adminIds: prev.adminIds.filter(id => String(id) !== memberId) }));
                          } catch(err) { alert("Failed to demote"); }
                        }}>Dismiss Admin</button>
                      ) : (
                        <button className="text-xs font-semibold text-[var(--whatsapp-green)] hover:text-[var(--whatsapp-dark-green)] cursor-pointer" onClick={async () => {
                          try {
                            await api.post(`/groups/${groupDetails.groupId}/promote`, { userId: memberId });
                            setGroupDetails(prev => ({ ...prev, adminIds: [...(prev.adminIds || []), memberId] }));
                          } catch(err) { alert("Failed to promote"); }
                        }}>Make Admin</button>
                      )}
                      
                      <button className="text-xs font-semibold text-red-500 hover:text-red-600 cursor-pointer" onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm(`Remove ${memberDetails.username}?`)) {
                          try {
                            await api.delete(`/groups/${groupDetails.groupId}/members/${memberId}`);
                            setGroupDetails(prev => ({ ...prev, members: prev.members.filter(id => String(id) !== memberId) }));
                          } catch(err) { alert("Failed to remove member"); }
                        }
                      }}>Remove</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAddMember && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500] flex items-center justify-center p-4 animate-[overlay-fade_0.2s_ease_forwards]" 
          onClick={() => setShowAddMember(false)}
        >
          <div 
            className="bg-[var(--bg-sidebar)] border border-[var(--border-light)] rounded-2xl p-6 w-full max-w-[380px] shadow-2xl flex flex-col gap-4 animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]" 
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">Add Member</h3>
            <div className="max-h-[300px] overflow-y-auto flex flex-col gap-1 pr-1">
              {users?.filter(u => !u.isGroup && !u.isCommunityGroup && !groupDetails.members?.some(mId => String(mId) === String(u.userId))).map(u => (
                <div 
                  key={u.userId} 
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition duration-200 cursor-pointer text-left" 
                  onClick={async () => {
                    try {
                      await api.post(`/groups/${groupDetails.groupId}/members`, { userId: u.userId });
                      setGroupDetails(prev => ({ ...prev, members: [...(prev.members || []), u.userId] }));
                      setShowAddMember(false);
                    } catch(e) { alert("Failed to add member"); }
                  }}
                >
                  <div className="w-9 h-9 rounded-full bg-[var(--bg-input)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)]">{u.username.charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{u.username}</div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="w-full py-2.5 bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white text-sm font-semibold rounded-full shadow-md transition duration-200 cursor-pointer" 
              onClick={() => setShowAddMember(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupInfoPanel;
