import React from 'react';

const SidebarCalls = ({ users }) => {
  // Mock recent calls for UI completion
  const recentCalls = [
    { id: 1, name: 'Alice Smith', type: 'incoming', date: 'Today, 10:30 AM', missed: true },
    { id: 2, name: 'Bob Jones', type: 'outgoing', date: 'Yesterday, 8:45 PM', missed: false },
    { id: 3, name: 'Charlie', type: 'incoming', date: 'Monday, 2:15 PM', missed: false }
  ];

  return (
    <div className="sidebar-content-view">
      <div className="chat-sidebar-header">
        <h2>Calls</h2>
      </div>
      
      <div className="sidebar-scrollable">
        <div className="chat-list-item clickable">
          <div className="call-avatar-link" style={{ 
            width: '48px', height: '48px', borderRadius: '50%', background: 'var(--whatsapp-green)', 
            display: 'grid', placeItems: 'center', fontSize: '20px', marginRight: '12px', color: 'white'
          }}>🔗</div>
          <div className="chat-list-meta">
            <div className="chat-list-name" style={{ marginBottom: '2px' }}>Create call link</div>
            <div className="chat-list-preview" style={{ fontSize: '13px' }}>Share a link for your WhatsApp call</div>
          </div>
        </div>

        <div style={{ padding: '20px 16px 10px', color: 'var(--whatsapp-green)', fontWeight: '600', fontSize: '14px' }}>
          Recent
        </div>

        {recentCalls.map(call => (
          <div key={call.id} className="chat-list-item clickable">
            <div className="chat-avatar" style={{ background: '#ccc' }}>
              {call.name.charAt(0)}
            </div>
            <div className="chat-list-meta" style={{ flex: 1 }}>
              <div className="chat-list-name" style={{ color: call.missed ? '#ef4444' : 'var(--text-primary)' }}>
                {call.name}
              </div>
              <div className="chat-list-preview" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                {call.type === 'incoming' ? (
                  <svg viewBox="0 0 20 20" width="14" height="14" fill={call.missed ? '#ef4444' : '#00a884'} style={{ transform: 'rotate(45deg)' }}><path d="M10 2L2 10l1.4 1.4L8 6.8V18h4V6.8l4.6 4.6L18 10 10 2z"/></svg>
                ) : (
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="#00a884" style={{ transform: 'rotate(225deg)' }}><path d="M10 2L2 10l1.4 1.4L8 6.8V18h4V6.8l4.6 4.6L18 10 10 2z"/></svg>
                )}
                {call.date}
              </div>
            </div>
            <div className="call-action-icon" style={{ padding: '0 8px', color: 'var(--whatsapp-green)' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.4 22A15.4 15.4 0 0 1 2 6.6 4.6 4.6 0 0 1 6.6 2a3.9 3.9 0 0 1 2.4.9l2.7 3.6a3.8 3.8 0 0 1-.3 4.2l-2 2.5a11.2 11.2 0 0 0 4.9 4.9l2.5-2a3.8 3.8 0 0 1 4.2-.3l3.6 2.7a3.9 3.9 0 0 1 .9 2.4 4.6 4.6 0 0 1-4.5 4.6z"/></svg>
            </div>
          </div>
        ))}

        <div className="empty-state-centered" style={{ padding: '40px 20px', textAlign: 'center', display: 'none' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            To call contacts who have WhatsApp,<br/>tap the new call icon at the top.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SidebarCalls;
