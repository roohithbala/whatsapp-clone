import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const SidebarMedia = ({ currentUser, selectedUser }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('media');

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
    <div className="w-full h-full flex flex-col bg-[var(--bg-sidebar)]">
      <div className="p-5 border-b border-[var(--border-light)] flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Media, Links & Docs</h2>
      </div>
      
      <div className="flex border-b border-[var(--border-light)]">
        {['media', 'links', 'docs'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-center text-sm font-medium capitalize transition-all duration-200 border-b-2 hover:bg-[var(--bg-hover)] cursor-pointer ${
              activeTab === tab 
                ? 'border-[var(--whatsapp-green)] text-[var(--whatsapp-green)]' 
                : 'border-transparent text-[var(--text-secondary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="py-10 text-center text-[var(--text-secondary)] text-sm animate-pulse">Loading...</div>
        ) : activeTab !== 'media' ? (
          <div className="py-10 text-center text-[var(--text-secondary)] text-sm">No {activeTab} found</div>
        ) : mediaItems.length === 0 ? (
          <div className="py-10 text-center text-[var(--text-secondary)] text-sm">No media found</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {mediaItems.map(item => (
              <div 
                key={item._id} 
                className="aspect-square rounded-lg overflow-hidden border border-[var(--border-light)] hover:opacity-85 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <img 
                  src={`http://localhost:5000${item.mediaUrl}`} 
                  alt="Shared media" 
                  className="w-full h-full object-cover" 
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarMedia;
