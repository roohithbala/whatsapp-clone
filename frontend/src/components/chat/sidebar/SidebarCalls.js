import React from 'react';

const SidebarCalls = () => {
  return (
    <div className="sidebar-content-view">
      <div className="chat-sidebar-header">
        <h2>Calls</h2>
      </div>
      
      <div className="sidebar-scrollable">
        <div className="chat-list-item clickable">
          <div className="call-avatar-link" style={{ 
            width: '48px', height: '48px', borderRadius: '50%', background: 'var(--whatsapp-green)', 
            display: 'grid', placeItems: 'center', fontSize: '24px', marginRight: '12px' 
          }}>🔗</div>
          <div className="chat-list-meta">
            <div className="chat-list-name">Create call link</div>
            <div className="chat-list-preview">Share a link for your WhatsApp call</div>
          </div>
        </div>

        <div style={{ padding: '20px 16px 10px', color: 'var(--whatsapp-green)', fontWeight: '600', fontSize: '14px' }}>
          Recent
        </div>

        <div className="empty-state-centered" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            To call contacts who have WhatsApp,<br/>tap the new call icon at the top.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SidebarCalls;
