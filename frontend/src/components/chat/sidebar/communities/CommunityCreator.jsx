import React, { useState } from 'react';

const CommunityCreator = ({ isOpen, onClose, onCreateCommunity }) => {
  const [communityName, setCommunityName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!communityName.trim()) return;
    setLoading(true);
    try {
      await onCreateCommunity({ name: communityName.trim(), description });
      setCommunityName('');
      setDescription('');
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 m-4 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-panel)] flex flex-col gap-3 shadow-lg animate-[modal-appear_0.2s_ease_forwards]">
      <p className="text-xs text-[var(--text-secondary)] mb-1">
        Communities bring members together in topic-based groups.
      </p>
      <input
        className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm px-4 py-2.5 rounded-lg border border-[var(--border-input)] outline-none focus:border-[var(--whatsapp-green)] transition-all duration-200"
        placeholder="Community name"
        value={communityName}
        onChange={e => setCommunityName(e.target.value)}
        maxLength={100}
      />
      <textarea
        className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm px-4 py-2.5 rounded-lg border border-[var(--border-input)] outline-none focus:border-[var(--whatsapp-green)] transition-all duration-200 h-[70px] resize-none"
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        maxLength={500}
      />
      <div className="flex gap-2 justify-end mt-1">
        <button 
          className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition duration-200 cursor-pointer" 
          onClick={() => { onClose(); setCommunityName(''); setDescription(''); }}
        >
          Cancel
        </button>
        <button 
          className="px-5 py-2.5 bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white text-sm font-semibold rounded-full shadow-md transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={handleCreate} 
          disabled={loading || !communityName.trim()}
        >
          {loading ? 'Creating…' : 'Create Community'}
        </button>
      </div>
    </div>
  );
};

export default CommunityCreator;
