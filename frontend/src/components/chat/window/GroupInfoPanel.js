import React, { useState } from 'react';
import api from '../../../services/api';
import './GroupInfoPanel.css';

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

  if (!groupDetails) return null;

  return (
    <div className="group-info-panel">
      <div className="group-info-header">
        <button className="icon-button" onClick={onClose}>✕</button>
        <h2 style={{ fontSize: '16px', fontWeight: 500 }}>Group info</h2>
      </div>
      
      <div className="group-info-scroll">
        <div className="group-info-hero">
          <div className="group-hero-avatar">
            {groupDetails.username?.charAt(0).toUpperCase() || groupDetails.name?.charAt(0).toUpperCase()}
          </div>
          {isEditing ? (
            <div style={{ padding: '0 20px' }}>
              <input 
                className="whatsapp-input" 
                value={editedName} 
                onChange={e => setEditedName(e.target.value)}
                style={{ marginBottom: '8px', textAlign: 'center' }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button className="icon-button" onClick={handleUpdateGroup}>✅</button>
                <button className="icon-button" onClick={() => setIsEditing(false)}>❌</button>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <h2 className="group-hero-name">
                {groupDetails.username || groupDetails.name}
                {isAdmin && <span className="clickable" style={{ fontSize: '14px', marginLeft: '8px' }} onClick={() => setIsEditing(true)}>✎</span>}
              </h2>
              <p className="group-hero-meta">Group • {groupDetails.members?.length || 0} participants</p>
            </div>
          )}
        </div>

        <div className="info-section">
          <h4 className="section-title">Description</h4>
          {isEditing ? (
             <textarea 
               className="whatsapp-input" 
               value={editedDesc} 
               onChange={e => setEditedDesc(e.target.value)}
               style={{ width: '100%', height: '60px' }}
             />
          ) : (
            <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.4' }}>
              {groupDetails.description || `Welcome to ${groupDetails.username || groupDetails.name}! Respect all members.`}
            </p>
          )}
        </div>

        <div className="info-section">
          <h4 className="section-title">Media, links, and docs</h4>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: '80px', height: '80px', background: '#ccc', borderRadius: '8px', flexShrink: 0 }}></div>
            ))}
            <div style={{ minWidth: '40px', display: 'grid', placeItems: 'center', fontSize: '20px', color: 'var(--text-secondary)' }}>›</div>
          </div>
        </div>

        <div className="member-list-header">
          <span>{groupDetails.members?.length || 0} participants</span>
          <span style={{ color: 'var(--whatsapp-green)', cursor: 'pointer', fontWeight: 500 }}>Search</span>
        </div>
        
        {isAdmin && (
          <div className="member-item clickable add-member-item" onClick={() => setShowAddMember(true)}>
            <div className="member-avatar add-member-icon">+</div>
            <div className="member-info">
              <div className="member-name">Add member</div>
            </div>
          </div>
        )}

        {/* Render Members */}
          {groupDetails.members?.map(m => {
            const memberId = String(m);
            const memberDetails = users?.find(u => String(u.userId) === memberId) || { username: memberId === String(currentUser?.userId) ? 'You' : 'Unknown', userId: memberId };
            const isUserAdmin = groupDetails.adminIds?.some(id => String(id) === memberId) || memberId === String(groupDetails.adminId);
            
            return (
              <div key={memberId} className="member-item">
                <div className="member-avatar">
                  {memberDetails.username?.charAt(0).toUpperCase()}
                </div>
                <div className="member-info">
                  <div className="member-name">{memberDetails.username}</div>
                  <div className="member-status">{memberDetails.status || 'Available'}</div>
                </div>
                
                {isUserAdmin && <span className="admin-tag">Group Admin</span>}
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {isAdmin && memberId !== String(currentUser?.userId) && (
                    <>
                      {isUserAdmin ? (
                        <button className="remove-btn" style={{ color: 'var(--text-secondary)' }} onClick={async () => {
                          try {
                            await api.post(`/groups/${groupDetails.groupId}/demote`, { userId: memberId });
                            setGroupDetails(prev => ({ ...prev, adminIds: prev.adminIds.filter(id => String(id) !== memberId) }));
                          } catch(err) { alert("Failed to demote"); }
                        }}>Dismiss Admin</button>
                      ) : (
                        <button className="remove-btn" style={{ color: 'var(--whatsapp-green)' }} onClick={async () => {
                          try {
                            await api.post(`/groups/${groupDetails.groupId}/promote`, { userId: memberId });
                            setGroupDetails(prev => ({ ...prev, adminIds: [...(prev.adminIds || []), memberId] }));
                          } catch(err) { alert("Failed to promote"); }
                        }}>Make Admin</button>
                      )}
                      
                      <button className="remove-btn" onClick={async (e) => {
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

      {showAddMember && (
        <div className="whatsapp-modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="whatsapp-modal" onClick={e => e.stopPropagation()} style={{ padding: '24px', minWidth: '350px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Add Member</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
              {users?.filter(u => !u.isGroup && !u.isCommunityGroup && !groupDetails.members?.some(mId => String(mId) === String(u.userId))).map(u => (
                <div key={u.userId} className="member-item clickable" onClick={async () => {
                  try {
                    await api.post(`/groups/${groupDetails.groupId}/members`, { userId: u.userId });
                    setGroupDetails(prev => ({ ...prev, members: [...(prev.members || []), u.userId] }));
                    setShowAddMember(false);
                  } catch(e) { alert("Failed to add member"); }
                }}>
                  <div className="member-avatar">{u.username.charAt(0).toUpperCase()}</div>
                  <div className="member-info">
                    <div className="member-name">{u.username}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="professional-button" style={{ width: '100%' }} onClick={() => setShowAddMember(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupInfoPanel;
