import React from 'react';

const SidebarChannels = () => {
  const channels = [
    { id: 1, name: "WhatsApp", desc: "Official WhatsApp channel", icon: "W" },
    { id: 2, name: "Tech News", desc: "Daily tech updates", icon: "T" }
  ];

  return (
    <div className="sidebar-content-view">
      <div className="chat-sidebar-header">
        <h2>Channels</h2>
      </div>
      
      <div className="sidebar-scrollable" style={{ padding: '0 16px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '16px 0' }}>
          Stay updated on topics that matter to you. Find channels to follow below.
        </p>
        
        <div className="channel-list">
          {channels.map(ch => (
            <div key={ch.id} className="chat-list-item" style={{ borderBottom: '1px solid var(--border-light)', padding: '12px 0' }}>
              <div className="chat-list-avatar" style={{ background: 'var(--whatsapp-green)', color: 'white' }}>{ch.icon}</div>
              <div className="chat-list-meta">
                <div className="chat-list-name">{ch.name}</div>
                <div className="chat-list-preview">{ch.desc}</div>
              </div>
              <button className="sidebar-chip active" style={{ marginLeft: 'auto' }}>Follow</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarChannels;
