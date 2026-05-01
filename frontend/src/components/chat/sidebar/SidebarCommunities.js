import React, { useState, useEffect } from 'react';
import { createCommunity, getMyCommunities } from '../../../services/communityService';
import './SidebarCommunities.css';

const SidebarCommunities = ({ currentUser, setSelectedUser }) => {
  const [communities, setCommunities] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedCommunity, setExpandedCommunity] = useState(null);

  const fetchCommunities = async () => {
    try {
      const data = await getMyCommunities();
      setCommunities(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchCommunities(); }, []);

  const [step, setStep] = useState(1);
  const [selectedGroups, setSelectedGroups] = useState([]);

  const handleCreate = async () => {
    if (!communityName) return;
    if (step === 1) {
      setStep(2);
      return;
    }
    setLoading(true);
    try {
      await createCommunity({ name: communityName, description, groups: selectedGroups });
      setCommunityName("");
      setDescription("");
      setSelectedGroups([]);
      setStep(1);
      setIsCreating(false);
      fetchCommunities();
    } catch (e) { alert("Creation failed"); }
    finally { setLoading(false); }
  };

  if (isCreating) {
    return (
      <div className="sidebar-content-view" style={{ padding: '24px' }}>
        <h3 className="sidebar-title">{step === 1 ? "Create Community" : "Add Groups"}</h3>
        {step === 1 ? (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Bring your groups together under one roof for easier management and announcements.
            </p>
            <div className="form-group">
              <input 
                className="whatsapp-input" 
                placeholder="Community name" 
                value={communityName} 
                onChange={(e) => setCommunityName(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <textarea 
                className="whatsapp-input"
                placeholder="Community description (optional)" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ height: '120px', resize: 'none' }}
              />
            </div>
          </>
        ) : (
          <div className="group-selection-list">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
              Select groups to add to this community.
            </p>
            {/* Simulated groups */}
            {["Project Team", "Family", "Friends"].map(group => (
              <div key={group} className="chat-list-item clickable" onClick={() => {
                setSelectedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);
              }}>
                <div className={`selection-check ${selectedGroups.includes(group) ? 'checked' : ''}`} />
                <div className="chat-list-name">{group}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <button className="professional-button" onClick={handleCreate} disabled={loading}>
            {step === 1 ? "Next" : (loading ? "Creating..." : "Create Community")}
          </button>
          <button className="text-button" onClick={() => { setIsCreating(false); setStep(1); }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-content-view">
      <div className="chat-sidebar-header">
        <h2>Communities</h2>
      </div>
      
      <div className="sidebar-scrollable">
        <div className="chat-list-item clickable" onClick={() => setIsCreating(true)}>
          <div className="community-avatar-new">+</div>
          <div className="chat-list-meta">
            <div className="chat-list-name">New Community</div>
          </div>
        </div>

        {communities.length === 0 ? (
          <div className="empty-community-state">
            <div className="empty-icon">👥</div>
            <h3>Stay connected with a community</h3>
            <p>Communities bring members together in topic-based groups, and make it easy to get admin announcements.</p>
            <button className="professional-button" onClick={() => setIsCreating(true)}>Get Started</button>
          </div>
        ) : (
          <div className="community-list">
            {communities.map(comm => (
              <div key={comm._id} className="community-group-wrap">
                <div 
                  className={`chat-list-item ${expandedCommunity === comm._id ? 'expanded' : ''}`}
                  onClick={() => setExpandedCommunity(expandedCommunity === comm._id ? null : comm._id)}
                >
                  <div className="community-avatar">👥</div>
                  <div className="chat-list-meta">
                    <div className="chat-list-name">{comm.name}</div>
                    <div className="chat-list-preview">{comm.description || "Tap to see groups"}</div>
                  </div>
                  <div className={`expand-icon ${expandedCommunity === comm._id ? 'open' : ''}`}>▾</div>
                </div>
                
                {expandedCommunity === comm._id && (
                  <div className="community-subgroups">
                    <div className="chat-list-item subgroup" onClick={() => setSelectedUser({ userId: comm._id, username: comm.name, isCommunity: true })}>
                      <div className="subgroup-avatar">📢</div>
                      <div className="chat-list-meta">
                        <div className="chat-list-name">Announcements</div>
                        <div className="chat-list-preview">Only admins can post</div>
                      </div>
                    </div>
                    {/* Simulated subgroups */}
                    <div className="chat-list-item subgroup">
                      <div className="subgroup-avatar">💬</div>
                      <div className="chat-list-meta">
                        <div className="chat-list-name">General Discussion</div>
                        <div className="chat-list-preview">Welcome to the community!</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarCommunities;
