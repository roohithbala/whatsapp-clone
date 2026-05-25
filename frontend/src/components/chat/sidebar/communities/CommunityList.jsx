import React from 'react';

const CommunityList = ({
  communities,
  currentUser,
  expandedCommunity,
  setExpandedCommunity,
  openChat,
  setAddGroupModal,
  setShowAddMemberModal
}) => {
  return (
    <div className="flex flex-col">
      {communities.map(comm => (
        <div key={comm._id} className="flex flex-col border-b border-[var(--border-light)]">
          {/* Community Header Row */}
          <div
            className={`flex items-center gap-4 p-4 hover:bg-[var(--bg-hover)] transition duration-200 cursor-pointer text-left ${
              expandedCommunity === comm._id ? 'bg-white/[0.02]' : ''
            }`}
            onClick={() => setExpandedCommunity(expandedCommunity === comm._id ? null : comm._id)}
          >
            {/* WhatsApp official Community shape (Rounded Square) */}
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-xl shrink-0 font-bold shadow-md">
              👥
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[15px] text-[var(--text-primary)] truncate">{comm.name}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1 truncate">
                {comm.description || `${(comm.groups || []).length} groups`}
              </div>
            </div>

            <span 
              className={`text-xs text-[var(--text-muted)] transition-transform duration-250 mr-1 shrink-0 ${
                expandedCommunity === comm._id ? 'rotate-180 text-[var(--whatsapp-green)]' : ''
              }`}
            >
              ▼
            </span>
          </div>

          {/* Expanded community subgroups */}
          {expandedCommunity === comm._id && (
            <div className="flex flex-col bg-black/15 border-l-[3px] border-[var(--whatsapp-green)] ml-8 animate-[slideDown_0.2s_ease_forwards]">
              {/* Announcement group */}
              {comm.announcementGroupId && (
                <div
                  className="flex items-center gap-4 py-3 pl-5 pr-4 hover:bg-[var(--bg-hover)] transition duration-200 cursor-pointer text-left"
                  onClick={() => openChat(
                    (comm.announcementGroupId._id || comm.announcementGroupId).toString(),
                    'Announcements',
                    { ...(comm.announcementGroupId || {}), isGroup: true, isCommunity: true, isAdmin: comm.creatorId === currentUser?.userId }
                  )}
                >
                  <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                      <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[var(--text-primary)]">Announcements</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {comm.creatorId === currentUser?.userId ? 'Admin: Only you can post' : 'Only admins can post'}
                    </div>
                  </div>
                </div>
              )}

              {/* Other subgroups */}
              {(comm.groups || [])
                .filter(g => {
                  const gId = (g._id || g).toString();
                  const annId = (comm.announcementGroupId?._id || comm.announcementGroupId || '').toString();
                  return gId !== annId;
                })
                .map(group => {
                  const gId = (group._id || group).toString();
                  const gName = group.name || 'Community Group';
                  const isAdmin = (group.adminIds || [comm.creatorId]).includes(currentUser?.userId);
                  return (
                    <div
                      key={gId}
                      className="flex items-center gap-4 py-3 pl-5 pr-4 hover:bg-[var(--bg-hover)] transition duration-200 cursor-pointer text-left"
                      onClick={() => openChat(group.groupId || gId, gName, { ...group, isGroup: true, isAdmin })}
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-[var(--text-primary)] truncate">{gName}</div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                          {group.members?.length || 0} members
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* Creator-only Management items */}
              {comm.creatorId === currentUser?.userId && (
                <div className="border-t border-[var(--border-light)]/50 mt-1 pt-1">
                  <div
                    className="flex items-center gap-4 py-3 pl-5 pr-4 hover:bg-[var(--bg-hover)] transition duration-200 cursor-pointer text-left"
                    onClick={() => setAddGroupModal(comm._id)}
                  >
                    <div className="w-9 h-9 rounded-full bg-[var(--whatsapp-green)]/15 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--whatsapp-green)]">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[var(--whatsapp-green)]">Add Group</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">Link an existing group or create one</div>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-4 py-3 pl-5 pr-4 hover:bg-[var(--bg-hover)] transition duration-200 cursor-pointer text-left"
                    onClick={() => setShowAddMemberModal(comm._id)}
                  >
                    <div className="w-9 h-9 rounded-full bg-[var(--whatsapp-green)]/15 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--whatsapp-green)]">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="8.5" cy="7" r="4"/>
                        <line x1="20" y1="8" x2="20" y2="14"/>
                        <line x1="17" y1="11" x2="23" y2="11"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[var(--whatsapp-green)]">Add Member</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">Invite new participants to the community</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommunityList;
