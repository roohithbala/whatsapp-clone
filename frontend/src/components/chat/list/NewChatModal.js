import React, { useState } from 'react';
import Modal from '../../ui/Modal';

const NewChatModal = ({ isOpen, onClose, users = [], currentUser, setSelectedUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.userId !== currentUser?.userId && 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Chat">
      <div className="new-chat-modal-content">
        <div className="modal-search-bar">
          <input 
            type="text" 
            placeholder="Search contacts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="contacts-list">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div 
                key={user.userId} 
                className="contact-item"
                onClick={() => setSelectedUser(user)}
              >
                <div className="contact-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="contact-info">
                  <div className="contact-name">{user.username}</div>
                  <div className="contact-status">{user.status || 'Available'}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-contacts">No contacts found</div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NewChatModal;
