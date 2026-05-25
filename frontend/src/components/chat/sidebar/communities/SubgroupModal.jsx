import React, { useState } from 'react';

const SubgroupModal = ({ communityId, onClose, onAddSubgroup, onLinkGroup, myGroups }) => {
  const [isLinkingExisting, setIsLinkingExisting] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [addGroupLoading, setAddGroupLoading] = useState(false);

  if (!communityId) return null;

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setAddGroupLoading(true);
    try {
      await onAddSubgroup(communityId, newGroupName.trim());
      setNewGroupName('');
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setAddGroupLoading(false);
    }
  };

  const handleLinkExistingGroup = async (groupId) => {
    setAddGroupLoading(true);
    try {
      await onLinkGroup(communityId, groupId);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setAddGroupLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500] flex items-center justify-center p-4 animate-[overlay-fade_0.2s_ease_forwards]" 
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-sidebar)] border border-[var(--border-light)] rounded-2xl p-6 w-full max-w-[380px] shadow-2xl flex flex-col gap-4 animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex border-b border-[var(--border-light)]">
          <button 
            className={`flex-1 py-3 text-center text-sm font-semibold capitalize transition duration-200 cursor-pointer border-b-2 ${
              !isLinkingExisting 
                ? 'border-[var(--whatsapp-green)] text-[var(--whatsapp-green)]' 
                : 'border-transparent text-[var(--text-muted)]'
            }`} 
            onClick={() => setIsLinkingExisting(false)}
          >
            Create New
          </button>
          <button 
            className={`flex-1 py-3 text-center text-sm font-semibold capitalize transition duration-200 cursor-pointer border-b-2 ${
              isLinkingExisting 
                ? 'border-[var(--whatsapp-green)] text-[var(--whatsapp-green)]' 
                : 'border-transparent text-[var(--text-muted)]'
            }`} 
            onClick={() => setIsLinkingExisting(true)}
          >
            Link Existing
          </button>
        </div>

        {!isLinkingExisting ? (
          <div className="flex flex-col gap-4">
            <input
              className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm px-4 py-2.5 rounded-lg border border-[var(--border-input)] outline-none focus:border-[var(--whatsapp-green)] transition-all duration-200"
              placeholder="Group name"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleCreateGroup()}
              autoFocus
              maxLength={100}
            />
            <div className="flex justify-end gap-2">
              <button 
                className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition duration-200 cursor-pointer" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white text-sm font-semibold rounded-full shadow-md transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateGroup}
                disabled={addGroupLoading || !newGroupName.trim()}
              >
                {addGroupLoading ? 'Creating…' : 'Create Group'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-[var(--text-secondary)] mb-1">Choose a group to add to this community:</p>
            <div className="max-h-[250px] overflow-y-auto flex flex-col gap-1 pr-1">
              {myGroups.length === 0 ? (
                <p className="text-center py-6 text-sm text-[var(--text-muted)]">No groups found</p>
              ) : (
                myGroups.map(g => (
                  <div 
                    key={g.userId} 
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200 cursor-pointer text-left shrink-0" 
                    onClick={() => handleLinkExistingGroup(g.userId)}
                  >
                    <div className="w-9 h-9 rounded-full bg-[var(--bg-input)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)] shrink-0">{g.username?.[0].toUpperCase()}</div>
                    <div className="flex-1 text-sm font-medium text-[var(--text-primary)] truncate">{g.username}</div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end pt-2 border-t border-[var(--border-light)]/20">
              <button 
                className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition duration-200 cursor-pointer" 
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubgroupModal;
