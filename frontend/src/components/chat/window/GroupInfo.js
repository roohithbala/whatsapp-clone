import React, { useState, useEffect } from 'react';
import { addMemberToGroup, removeMemberFromGroup, getGroupInvite } from '../../../services/groupService';

const GroupInfo = ({ group, users, currentUser, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const res = await getGroupInvite(group.groupId || group._id);
        setInviteCode(res.inviteCode);
      } catch (e) { console.error(e); }
    };
    fetchInvite();
  }, [group]);

  const handleAddMember = async (userId) => {
    try {
      await addMemberToGroup(group.groupId || group._id, userId);
      alert('Member added!');
    } catch (e) { alert('Failed to add member'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await removeMemberFromGroup(group.groupId || group._id, userId);
      alert('Member removed!');
    } catch (e) { alert('Failed to remove member'); }
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${inviteCode}`);
    alert('Invite link copied to clipboard!');
  };

  const isAdmin = (group.adminIds || []).includes(currentUser.userId);

  return (
    <div className="chat-info-panel" style={{ width: '300px', background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
      <div className="info-header" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-light)' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        <h3 style={{ margin: 0 }}>Group Info</h3>
      </div>

      <div className="info-scrollable" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--whatsapp-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', margin: '0 auto 16px' }}>
            {group.name?.[0].toUpperCase()}
          </div>
          <h2 style={{ margin: '0 0 4px' }}>{group.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Group • {group.members?.length || 0} participants</p>
        </div>

        <div className="info-section" style={{ marginBottom: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>{group.description || 'No description'}</p>
        </div>

        <div className="info-section" style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--whatsapp-green)', margin: '0 0 12px', fontSize: '14px' }}>Invite via link</h4>
          <button className="professional-button" onClick={copyInvite} style={{ width: '100%', justifyContent: 'center' }}>
             🔗 Copy Invite Link
          </button>
        </div>

        {isAdmin && (
          <div className="info-section">
            <h4 style={{ margin: '0 0 12px', fontSize: '14px' }}>Add Participants</h4>
            <input 
              type="text" 
              className="whatsapp-input" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ marginBottom: '12px' }}
            />
            <div className="participants-list">
              {users.filter(u => !u.isGroup && (!searchQuery || u.username.toLowerCase().includes(searchQuery.toLowerCase()))).slice(0, 10).map(u => {
                const isMember = (group.members || []).includes(u.userId);
                return (
                  <div key={u.userId} className="participant-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {u.username?.[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, fontSize: '14px' }}>{u.username}</div>
                    {isMember ? (
                      <button onClick={() => handleRemoveMember(u.userId)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>REMOVE</button>
                    ) : (
                      <button onClick={() => handleAddMember(u.userId)} style={{ background: 'none', border: 'none', color: 'var(--whatsapp-green)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>ADD</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupInfo;
