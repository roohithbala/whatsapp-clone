import React, { useState } from 'react';
import ReactDOM from 'react-dom';

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

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500] flex items-center justify-center p-4 animate-[overlay-fade_0.2s_ease_forwards]" 
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-sidebar-alt)] border border-[var(--border-strong)] rounded-2xl p-6 w-full max-w-[380px] shadow-2xl flex flex-col gap-4 animate-[modal-appear_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]" 
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Title */}
        <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">Add Group</h3>

        {/* Tabs */}
        <div className="flex bg-[var(--bg-input)] rounded-xl p-1 gap-1">
          <button 
            className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              !isLinkingExisting 
                ? 'bg-[var(--whatsapp-green)] text-white shadow-md' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`} 
            onClick={() => setIsLinkingExisting(false)}
          >
            Create New
          </button>
          <button 
            className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              isLinkingExisting 
                ? 'bg-[var(--whatsapp-green)] text-white shadow-md' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`} 
            onClick={() => setIsLinkingExisting(true)}
          >
            Link Existing
          </button>
        </div>

        {!isLinkingExisting ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider pl-1">Group Name</label>
              <input
                className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm px-4 py-3 rounded-xl border border-[var(--border-input)] outline-none focus:border-[var(--whatsapp-green)] focus:ring-2 focus:ring-[var(--whatsapp-green)]/20 transition-all duration-200"
                placeholder="Enter group name..."
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleCreateGroup()}
                autoFocus
                maxLength={100}
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-1">
              <button 
                className="px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition-all duration-200 cursor-pointer" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                onClick={handleCreateGroup}
                disabled={addGroupLoading || !newGroupName.trim()}
              >
                {addGroupLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating…
                  </span>
                ) : 'Create Group'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-[var(--text-secondary)]">Choose a group to add to this community:</p>
            <div className="max-h-[250px] overflow-y-auto flex flex-col gap-1 pr-1">
              {myGroups.length === 0 ? (
                <div className="text-center py-8 flex flex-col items-center gap-2">
                  <span className="text-3xl">📭</span>
                  <p className="text-sm text-[var(--text-muted)]">No groups found</p>
                </div>
              ) : (
                myGroups.map(g => (
                  <div 
                    key={g.userId} 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200 cursor-pointer text-left shrink-0 border border-transparent hover:border-[var(--border-light)]" 
                    onClick={() => handleLinkExistingGroup(g.userId)}
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] flex items-center justify-center font-bold text-sm text-[var(--whatsapp-green)] shrink-0 border border-[var(--border-light)]">
                      {g.username?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1 text-sm font-medium text-[var(--text-primary)] truncate">{g.username}</div>
                    <svg className="w-4 h-4 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end pt-2 border-t border-[var(--border-light)]">
              <button 
                className="px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition-all duration-200 cursor-pointer" 
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SubgroupModal;
