import React, { useState, useEffect } from 'react';
import { createCommunity, getMyCommunities, createGroupInCommunity, addMemberToCommunity, addGroupToCommunity } from '../../../services/communityService';
import { fetchConversations } from '../../../services/messageService';
import CommunityCreator from './communities/CommunityCreator';
import SubgroupModal from './communities/SubgroupModal';
import AddMemberModal from './communities/AddMemberModal';
import CommunityList from './communities/CommunityList';

const SidebarCommunities = ({ currentUser, setSelectedUser, users, setRailMode }) => {
  const [communities, setCommunities] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedCommunity, setExpandedCommunity] = useState(null);

  // Modal and action states
  const [addGroupModal, setAddGroupModal] = useState(null); // communityId
  const [showAddMemberModal, setShowAddMemberModal] = useState(null); // communityId
  const [myGroups, setMyGroups] = useState([]);

  const fetchCommunities = async () => {
    try {
      const data = await getMyCommunities();
      setCommunities(data || []);
    } catch (e) {
      console.error('Failed to load communities:', e);
    }
  };

  useEffect(() => {
    fetchCommunities();
    const loadMyGroups = async () => {
      try {
        const convs = await fetchConversations(currentUser.userId);
        const groupsOnly = Object.values(convs).filter(c => c.isGroup);
        setMyGroups(groupsOnly);
      } catch (e) { console.error(e); }
    };
    if (currentUser) loadMyGroups();
  }, [currentUser]);

  const handleCreateCommunity = async ({ name, description }) => {
    try {
      await createCommunity({ name, description });
      fetchCommunities();
    } catch (e) {
      console.error('Create community failed:', e);
      alert('Failed to create community. Please try again.');
    }
  };

  const handleAddSubgroup = async (communityId, name) => {
    try {
      await createGroupInCommunity(communityId, name, 'Community subgroup');
      fetchCommunities();
    } catch (e) {
      console.error('Add subgroup failed:', e);
      alert('Failed to create group. Please try again.');
    }
  };

  const handleAddMember = async (communityId, userId) => {
    try {
      await addMemberToCommunity(communityId, userId);
      setShowAddMemberModal(null);
      fetchCommunities();
    } catch (e) {
      console.error('Add member failed:', e);
      alert('Failed to add member.');
    }
  };

  const handleLinkGroup = async (communityId, groupId) => {
    try {
      await addGroupToCommunity(communityId, groupId);
      fetchCommunities();
    } catch (e) {
      console.error('Link group failed:', e);
      alert('Failed to link group.');
    }
  };

  const openChat = (userId, name, options = {}) => {
    setSelectedUser({ userId, name, username: name, ...options });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-sidebar)]">
      <div className="p-5 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--bg-sidebar-alt)]">
        <div className="flex items-center gap-3 text-left">
          {setRailMode && (
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer transition duration-200" 
              onClick={() => setRailMode("messages")}
              title="Back to Chats"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
            </button>
          )}
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Communities</h2>
        </div>
        <button 
          className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition duration-200 cursor-pointer shrink-0" 
          onClick={() => setIsCreating(!isCreating)} 
          title="New Community"
        >
          <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <CommunityCreator 
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          onCreateCommunity={handleCreateCommunity}
        />

        {communities.length === 0 && !isCreating && (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-4 py-16">
            <div className="text-5xl mb-2">👥</div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Stay connected with a community</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-[280px]">Communities bring members together in topic-based groups, and make it easy to get admin announcements.</p>
            <button 
              className="mt-2 px-5 py-2.5 bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white text-sm font-semibold rounded-full shadow-md transition duration-200 cursor-pointer" 
              onClick={() => setIsCreating(true)}
            >
              Get Started
            </button>
          </div>
        )}

        {communities.length > 0 && !isCreating && (
          <div 
            className="flex items-center gap-4 p-4 border-b border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition duration-200 cursor-pointer text-left" 
            onClick={() => setIsCreating(true)}
          >
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-light)] text-[var(--whatsapp-green)] flex items-center justify-center text-2xl font-bold">+</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-[var(--text-primary)]">New Community</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">Create or join a community</div>
            </div>
          </div>
        )}

        <CommunityList 
          communities={communities}
          currentUser={currentUser}
          expandedCommunity={expandedCommunity}
          setExpandedCommunity={setExpandedCommunity}
          openChat={openChat}
          setAddGroupModal={setAddGroupModal}
          setShowAddMemberModal={setShowAddMemberModal}
        />
      </div>

      <SubgroupModal 
        communityId={addGroupModal}
        onClose={() => setAddGroupModal(null)}
        onAddSubgroup={handleAddSubgroup}
        onLinkGroup={handleLinkGroup}
        myGroups={myGroups}
      />

      <AddMemberModal 
        communityId={showAddMemberModal}
        onClose={() => setShowAddMemberModal(null)}
        onAddMember={handleAddMember}
        users={users}
      />
    </div>
  );
};

export default SidebarCommunities;
