import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import './SidebarMedia.css';

const SidebarMedia = ({ currentUser, selectedUser }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !selectedUser) return;
    
    const fetchMedia = async () => {
      try {
        const targetId = selectedUser.groupId || selectedUser.userId;
        const endpoint = selectedUser.groupId 
          ? `/messages/fetch-group/${targetId}`
          : `/messages/${currentUser.userId}/${targetId}`;
          
        const res = await api.get(endpoint);
        // Filter messages that have media
        const mediaMsgs = res.data.filter(m => m.mediaUrl);
        setMediaItems(mediaMsgs);
      } catch (err) {
        console.error("Failed to fetch media", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMedia();
  }, [currentUser, selectedUser]);

  return (
    <div className="sidebar-content-view">
      <div className="chat-sidebar-header">
        <h2>Media, Links & Docs</h2>
      </div>
      
      <div className="media-tabs">
        <button className="active">Media</button>
        <button>Links</button>
        <button>Docs</button>
      </div>

      <div className="media-grid">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
        ) : mediaItems.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No media found</div>
        ) : (
          mediaItems.map(item => (
            <div key={item._id} className="media-grid-item">
              <img src={`http://localhost:5000${item.mediaUrl}`} alt="Shared media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SidebarMedia;
