import React from 'react';

const MessageInfoModal = ({ message, onClose }) => {
  if (!message) return null;

  const formatDate = (date) => {
    if (!date) return '---';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="whatsapp-modal-overlay" style={{ zIndex: 9999 }}>
      <div className="whatsapp-modal" style={{ width: '400px', padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
        <div className="chat-sidebar-header" style={{ padding: '16px 20px', background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="icon-button" onClick={onClose} style={{ fontSize: '20px' }}>←</button>
          <h2 style={{ fontSize: '18px', margin: 0 }}>Message info</h2>
        </div>
        
        <div style={{ padding: '20px', background: 'var(--bg-chat)', borderBottom: '1px solid var(--border-light)' }}>
          <div className="message-bubble sent" style={{ maxWidth: '100%', margin: 0, position: 'relative' }}>
             <div className="message-text" style={{ padding: '8px 12px', fontSize: '15px' }}>
               {message.text || (message.mediaUrl ? 'Media' : 'Message')}
             </div>
             <div className="message-meta" style={{ padding: '2px 12px 6px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>
               {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-sidebar)', padding: '8px 0' }}>
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ color: 'var(--icon-color)', fontSize: '20px' }}>✓✓</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', color: 'var(--text-primary)' }}>Read</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(message.seenAt)}</div>
            </div>
          </div>
          <div style={{ height: '1px', background: 'var(--border-light)', marginLeft: '72px' }} />
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '20px' }}>✓✓</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', color: 'var(--text-primary)' }}>Delivered</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(message.deliveredAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInfoModal;
