import React from 'react';

const AttachmentMenu = ({ isOpen, onAction }) => {
  if (!isOpen) return null;

  const actions = [
    { id: 'document', label: 'Document', icon: '📄', color: '#7f66ff' },
    { id: 'photos', label: 'Photos & Videos', icon: '🖼️', color: '#007bfc' },
    { id: 'camera', label: 'Camera', icon: '📷', color: '#ff2e74' },
    { id: 'contact', label: 'Contact', icon: '👤', color: '#0695cc' },
    { id: 'poll', label: 'Poll', icon: '📊', color: '#ffbc38' },
  ];

  return (
    <div className="attachment-menu-container">
      {actions.map(a => (
        <div key={a.id} className="attachment-item-wrap" onClick={() => onAction(a.id)}>
          <div className="attachment-icon-circle" style={{ backgroundColor: a.color }}>
            {a.icon}
          </div>
          <span className="attachment-label">{a.label}</span>
        </div>
      ))}
    </div>
  );
};

export default AttachmentMenu;
