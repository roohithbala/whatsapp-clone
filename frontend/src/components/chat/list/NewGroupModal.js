import React from 'react';
import Modal from '../../ui/Modal';

const NewGroupModal = ({ isOpen, onClose, onSubmit, groupName, setGroupName, error, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Group">
      <form onSubmit={onSubmit}>
        <div className="professional-input-group">
          <label>Group Name</label>
          <input 
            type="text" 
            className="professional-input" 
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name..."
            autoFocus
          />
        </div>
        {error && <p className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
        <button type="submit" className="professional-button" disabled={loading}>
          {loading ? "Creating..." : "Create Group"}
        </button>
      </form>
    </Modal>
  );
};

export default NewGroupModal;
