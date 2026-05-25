import React from 'react';
import Modal from '../../ui/Modal';

const NewGroupModal = ({ isOpen, onClose, onSubmit, groupName, setGroupName, error, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Group">
      <form onSubmit={onSubmit} className="flex flex-col gap-4 text-left">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--whatsapp-green)] tracking-wider uppercase">Group Name</label>
          <input 
            type="text" 
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name..."
            autoFocus
            required
            className="w-full px-4 py-2.5 bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-transparent rounded-xl text-sm focus:border-whatsapp-green focus:bg-[var(--bg-sidebar)] focus:outline-none transition duration-200"
          />
        </div>
        
        {error && (
          <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 p-3 rounded-lg text-xs">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <button 
            type="button"
            className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition duration-200 cursor-pointer" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-5 py-2.5 bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white text-sm font-semibold rounded-full shadow-md transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !groupName.trim()}
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewGroupModal;
