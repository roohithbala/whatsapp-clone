import React, { useState, useEffect } from 'react';
import { createCommunity, getMyCommunities, createGroupInCommunity, addMemberToCommunity, addGroupToCommunity } from '../../../services/communityService';
import { fetchConversations } from '../../../services/messageService';
import './SidebarCommunities.css';

const SidebarCommunities = ({ currentUser, setSelectedUser, users }) => {
  const [communities, setCommunities] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [communityName, setCommunityName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCommunity, setExpandedCommunity] = useState(null);

  // Add subgroup modal state
  const [addGroupModal, setAddGroupModal] = useState(null); // communityId
  const [newGroupName, setNewGroupName] = useState('');
  const [addGroupLoading, setAddGroupLoading] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(null); // communityId
  const [myGroups, setMyGroups] = useState([]);
  const [isLinkingExisting, setIsLinkingExisting] = useState(false);
  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  const fetchCommunities = async () => {
    try {
      const data = await getMyCommunities();
      setCommunities(data || []);
    } catch (e) {
      console.error('Failed to load communities:', e);
    }
  };

  useEffect(() => {
    fetchCommunities();
    const loadMyGroups = async () => {
      try {
        const convs = await fetchConversations(currentUser.userId);
        const groupsOnly = Object.values(convs).filter(c => c.isGroup);
        setMyGroups(groupsOnly);
      } catch (e) { console.error(e); }
    };
    if (currentUser) loadMyGroups();
  }, [currentUser]);

  const handleCreate = async () => {
    if (!communityName.trim()) return;
    setLoading(true);
    try {
      await createCommunity({ name: communityName.trim(), description });
      setCommunityName('');
      setDescription('');
      setIsCreating(false);
      fetchCommunities();
    } catch (e) {
      console.error('Create community failed:', e);
      alert('Failed to create community. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubgroup = async () => {
    if (!newGroupName.trim() || !addGroupModal) return;
    setAddGroupLoading(true);
    try {
      await createGroupInCommunity(addGroupModal, newGroupName.trim(), 'Community subgroup');
      setNewGroupName('');
      setAddGroupModal(null);
      fetchCommunities();
    } catch (e) {
      console.error('Add subgroup failed:', e);
      alert('Failed to create group. Please try again.');
    } finally {
      setAddGroupLoading(false);
    }
  };

  const handleAddMember = async (communityId, userId) => {
    try {
      await addMemberToCommunity(communityId, userId);
      setShowAddMemberModal(null);
      fetchCommunities();
    } catch (e) {
      console.error('Add member failed:', e);
      alert('Failed to add member.');
    }
  };

  const handleLinkGroup = async (communityId, groupId) => {
    setAddGroupLoading(true);
    try {
      await addGroupToCommunity(communityId, groupId);
      setAddGroupModal(null);
      fetchCommunities();
    } catch (e) {
      console.error('Link group failed:', e);
      alert('Failed to link group.');
    } finally {
      setAddGroupLoading(false);
    }
  };

  const openChat = (userId, name, options = {}) => {
    setSelectedUser({ userId, name, username: name, ...options });
  };

  return (
    <div className="sidebar-content-view">
      <div className="chat-sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h2>Communities</h2>
          <button className="chat-header-icon-btn" onClick={() => setIsCreating(!isCreating)} title="New Community">
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </button>
        </div>
      </div>

      <div className="sidebar-scrollable">
        {/* Create Community Form */}
        {isCreating && (
          <div className="status-creator-panel" style={{ margin: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Communities bring members together in topic-based groups.
            </p>
            <input
              className="whatsapp-input"
              placeholder="Community name"
              value={communityName}
              onChange={e => setCommunityName(e.target.value)}
              style={{ marginBottom: '8px' }}
              maxLength={100}
            />
            <textarea
              className="whatsapp-input"
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ height: '70px', marginBottom: '12px' }}
              maxLength={500}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="professional-button" onClick={handleCreate} disabled={loading || !communityName.trim()}>
                {loading ? 'Creating…' : 'Create Community'}
              </button>
              <button className="text-button" onClick={() => { setIsCreating(false); setCommunityName(''); setDescription(''); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {communities.length === 0 && !isCreating && (
          <div className="empty-community-state">
            <div className="empty-icon">👥</div>
            <h3>Stay connected with a community</h3>
            <p>Communities bring members together in topic-based groups, and make it easy to get admin announcements.</p>
            <button className="professional-button" onClick={() => setIsCreating(true)}>Get Started</button>
          </div>
        )}

        {/* New Community button when communities exist */}
        {communities.length > 0 && !isCreating && (
          <div className="chat-list-item clickable" onClick={() => setIsCreating(true)} style={{ borderBottom: '1px solid var(--border-light)' }}>
            <div className="community-avatar-new">+</div>
            <div className="chat-list-meta">
              <div className="chat-list-name">New Community</div>
              <div className="chat-list-preview" style={{ fontSize: '12px' }}>Create or join a community</div>
            </div>
          </div>
        )}

        {/* Communities List */}
        <div className="community-list">
          {communities.map(comm => (
            <div key={comm._id} className="community-group-wrap">
              <div
                className={`chat-list-item ${expandedCommunity === comm._id ? 'active' : ''}`}
                onClick={() => setExpandedCommunity(expandedCommunity === comm._id ? null : comm._id)}
                style={{ borderBottom: '1px solid var(--border-light)' }}
              >
                <div className="community-avatar">👥</div>
                <div className="chat-list-meta">
                  <div className="chat-list-name">{comm.name}</div>
                  <div className="chat-list-preview">{comm.description || `${(comm.groups || []).length} groups`}</div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '18px', transition: 'transform 0.2s', transform: expandedCommunity === comm._id ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
              </div>

              {/* Expanded community subgroups */}
              {expandedCommunity === comm._id && (
                <div className="community-subgroups">
                  {/* Announcement group */}
                  {comm.announcementGroupId && (
                    <div
                      className="chat-list-item subgroup"
                      onClick={() => openChat(
                        (comm.announcementGroupId._id || comm.announcementGroupId).toString(),
                        'Announcements',
                        { ...(comm.announcementGroupId || {}), isGroup: true, isCommunity: true, isAdmin: comm.creatorId === currentUser?.userId }
                      )}
                      style={{ paddingLeft: '32px', background: 'var(--bg-hover)' }}
                    >
                      <div className="subgroup-avatar">📢</div>
                      <div className="chat-list-meta">
                        <div className="chat-list-name">Announcements</div>
                        <div className="chat-list-preview" style={{ fontSize: '12px' }}>
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
                          className="chat-list-item subgroup"
                          onClick={() => openChat(group.groupId || gId, gName, { ...group, isGroup: true, isAdmin })}
                          style={{ paddingLeft: '32px' }}
                        >
                          <div className="subgroup-avatar">💬</div>
                          <div className="chat-list-meta">
                            <div className="chat-list-name">{gName}</div>
                            <div className="chat-list-preview" style={{ fontSize: '12px' }}>
                              {group.members?.length || 0} members
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {/* Add group button (creator only) */}
                  {comm.creatorId === currentUser?.userId && (
                    <>
                      <div
                        className="chat-list-item subgroup"
                        onClick={() => { setAddGroupModal(comm._id); setNewGroupName(''); }}
                        style={{ paddingLeft: '32px', color: 'var(--whatsapp-green)' }}
                      >
                        <div className="subgroup-avatar" style={{ background: 'rgba(var(--whatsapp-green-rgb),0.1)', color: 'var(--whatsapp-green)' }}>+</div>
                        <div className="chat-list-meta">
                          <div className="chat-list-name" style={{ color: 'var(--whatsapp-green)' }}>Add Group</div>
                          <div className="chat-list-preview" style={{ fontSize: '12px' }}>Create a new topic group</div>
                        </div>
                      </div>
                      <div
                        className="chat-list-item subgroup"
                        onClick={() => setShowAddMemberModal(comm._id)}
                        style={{ paddingLeft: '32px', color: 'var(--whatsapp-green)' }}
                      >
                        <div className="subgroup-avatar" style={{ background: 'rgba(var(--whatsapp-green-rgb),0.1)', color: 'var(--whatsapp-green)' }}>👤</div>
                        <div className="chat-list-meta">
                          <div className="chat-list-name" style={{ color: 'var(--whatsapp-green)' }}>Add Member</div>
                          <div className="chat-list-preview" style={{ fontSize: '12px' }}>Add members to community</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Subgroup Modal */}
      {addGroupModal && (
        <div className="whatsapp-modal-overlay" onClick={() => setAddGroupModal(null)}>
          <div className="whatsapp-modal" onClick={e => e.stopPropagation()} style={{ minWidth: '350px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
              <button 
                className={`tab-btn ${!isLinkingExisting ? 'active' : ''}`} 
                onClick={() => setIsLinkingExisting(false)}
                style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: !isLinkingExisting ? '2px solid var(--whatsapp-green)' : 'none', color: !isLinkingExisting ? 'var(--whatsapp-green)' : 'var(--text-muted)' }}
              >
                Create New
              </button>
              <button 
                className={`tab-btn ${isLinkingExisting ? 'active' : ''}`} 
                onClick={() => setIsLinkingExisting(true)}
                style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: isLinkingExisting ? '2px solid var(--whatsapp-green)' : 'none', color: isLinkingExisting ? 'var(--whatsapp-green)' : 'var(--text-muted)' }}
              >
                Link Existing
              </button>
            </div>

            {!isLinkingExisting ? (
              <>
                <input
                  className="whatsapp-input"
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddSubgroup()}
                  autoFocus
                  maxLength={100}
                />
                <div className="modal-actions">
                  <button className="text-button" onClick={() => setAddGroupModal(null)}>Cancel</button>
                  <button
                    className="professional-button"
                    onClick={handleAddSubgroup}
                    disabled={addGroupLoading || !newGroupName.trim()}
                  >
                    {addGroupLoading ? 'Creating…' : 'Create Group'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Choose a group to add to this community:</p>
                {myGroups.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No groups found</p>
                ) : (
                  myGroups.map(g => (
                    <div key={g.userId} className="modal-list-item clickable" onClick={() => handleLinkGroup(addGroupModal, g.userId)}>
                      <div className="modal-avatar">{g.username?.[0].toUpperCase()}</div>
                      <div className="modal-list-name">{g.username}</div>
                    </div>
                  ))
                )}
                <div className="modal-actions">
                  <button className="text-button" onClick={() => setAddGroupModal(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="whatsapp-modal-overlay" onClick={() => setShowAddMemberModal(null)}>
          <div className="whatsapp-modal" onClick={e => e.stopPropagation()} style={{ minWidth: '350px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Add Member to Community</h3>
            
            <div className="modal-search-bar" style={{ marginBottom: '12px' }}>
              <input 
                type="text" 
                className="whatsapp-input" 
                placeholder="Search users..." 
                value={searchMemberQuery}
                onChange={(e) => setSearchMemberQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
              {users?.filter(u => !u.isGroup && (!searchMemberQuery || u.username.toLowerCase().includes(searchMemberQuery.toLowerCase()))).map(u => (
                <div key={u.userId} className="modal-list-item clickable" onClick={() => handleAddMember(showAddMemberModal, u.userId)}>
                  <div className="modal-avatar">{u.username?.[0].toUpperCase()}</div>
                  <div className="modal-list-name-wrap" style={{ flex: 1 }}>
                    <div className="modal-list-name">{u.username}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.status || 'Available'}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="text-button" onClick={() => { setShowAddMemberModal(null); setNewGroupName(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarCommunities;
