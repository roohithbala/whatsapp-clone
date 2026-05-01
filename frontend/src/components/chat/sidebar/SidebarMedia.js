import React from 'react';
import './SidebarMedia.css';

const SidebarMedia = () => {
  const mediaItems = [
    { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=150&q=80' },
    { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=150&q=80' },
    { id: 3, type: 'image', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=150&q=80' },
    { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=150&q=80' },
  ];

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
        {mediaItems.map(item => (
          <div key={item.id} className="media-grid-item">
            <img src={item.url} alt="Shared media" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarMedia;
