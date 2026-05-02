import React, { useState, useEffect } from 'react';
import channelService from '../../../services/channelService';

const SidebarChannels = ({ currentUser }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const data = await channelService.getChannels();
      setChannels(data);
    } catch (err) {
      console.error("Error fetching channels:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleFollow = async (channelId) => {
    try {
      await channelService.followChannel(channelId);
      // Update local state to reflect follow status
      setChannels(prev => prev.map(ch => {
        if (ch.channelId === channelId) {
          const isFollowing = ch.followers.includes(currentUser.userId);
          const newFollowers = isFollowing 
            ? ch.followers.filter(id => id !== currentUser.userId)
            : [...ch.followers, currentUser.userId];
          return { ...ch, followers: newFollowers };
        }
        return ch;
      }));
    } catch (err) {
      console.error("Error following channel:", err);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const newCh = await channelService.createChannel({ name: newName, description: newDesc });
      setChannels([newCh, ...channels]);
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
    } catch (err) {
      console.error("Error creating channel:", err);
    }
  };

  return (
    <div className="sidebar-content-view">
      <div className="chat-sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h2>Channels</h2>
          <button className="chat-header-icon-btn" onClick={() => setShowCreate(!showCreate)}>
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </button>
        </div>
      </div>
      
      <div className="sidebar-scrollable" style={{ padding: '0 16px' }}>
        {showCreate && (
          <div className="status-creator-panel" style={{ marginBottom: '16px' }}>
            <input 
              type="text" 
              className="whatsapp-input" 
              placeholder="Channel name..." 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ marginBottom: '8px' }}
            />
            <textarea 
              className="whatsapp-input" 
              placeholder="Description..." 
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              style={{ height: '60px', marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="professional-button" onClick={handleCreate}>Create</button>
              <button className="text-button" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        )}

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '16px 0' }}>
          Stay updated on topics that matter to you. Find channels to follow below.
        </p>
        
        <div className="channel-list">
          {loading ? (
            <p>Loading channels...</p>
          ) : channels.length > 0 ? (
            channels.map(ch => {
              const isFollowing = ch.followers.includes(currentUser?.userId);
              return (
                <div key={ch.channelId} className="chat-list-item" style={{ borderBottom: '1px solid var(--border-light)', padding: '12px 0' }}>
                  <div className="chat-list-avatar" style={{ background: 'var(--whatsapp-green)', color: 'white' }}>
                    {ch.avatarUrl ? <img src={ch.avatarUrl} alt="" /> : ch.name[0]}
                  </div>
                  <div className="chat-list-meta">
                    <div className="chat-list-name">{ch.name}</div>
                    <div className="chat-list-preview">{ch.description}</div>
                  </div>
                  <button 
                    className={`sidebar-chip ${isFollowing ? 'active' : ''}`} 
                    style={{ marginLeft: 'auto', background: isFollowing ? 'var(--border-light)' : 'var(--whatsapp-green)', color: isFollowing ? 'var(--text-primary)' : 'white', border: 'none', borderRadius: '16px', padding: '4px 12px', cursor: 'pointer' }}
                    onClick={() => handleFollow(ch.channelId)}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No channels found. Create one!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarChannels;
