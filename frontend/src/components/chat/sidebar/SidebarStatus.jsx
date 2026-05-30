import React, { useState, useEffect, useCallback } from 'react';
import statusService from '../../../services/statusService';
import StatusPrivacyModal from './status/StatusPrivacyModal';
import StatusCreator from './status/StatusCreator';
import StatusViewersModal from './status/StatusViewersModal';
import StatusList from './status/StatusList';
import StatusAvatar from './status/StatusAvatar';

const API_BASE = "http://localhost:5000";
const resolveUrl = (pic) => !pic ? null : pic.startsWith('http') ? pic : `${API_BASE}${pic}`;

const SidebarStatus = ({ currentUser, onViewStory, users, setRailMode }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [myStatuses, setMyStatuses] = useState([]);
  const [recentStatuses, setRecentStatuses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [privacyType, setPrivacyType] = useState('all'); // all, except, only
  const [privacyList, setPrivacyList] = useState([]); // Selected userIds
  const [showViewers, setShowViewers] = useState(null); // Array of viewers

  const fetchAllStatuses = useCallback(async () => {
    if (!currentUser?.userId) return;
    setLoading(true);
    try {
      const groupedStatuses = await statusService.getStatuses();
      
      if (groupedStatuses[currentUser.userId]) {
        setMyStatuses(groupedStatuses[currentUser.userId]);
      } else {
        setMyStatuses([]);
      }

      const others = [];
      Object.keys(groupedStatuses).forEach(uid => {
        if (uid !== currentUser.userId) {
          const user = users.find(u => u.userId === uid);
          if (user) {
            others.push({
              user,
              stories: groupedStatuses[uid]
            });
          }
        }
      });
      setRecentStatuses(others);
    } catch (err) {
      console.error("Error fetching statuses:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser.userId, users]);

  useEffect(() => {
    fetchAllStatuses();
  }, [fetchAllStatuses]);

  const handlePostStatusSuccess = (newStatus) => {
    setMyStatuses([newStatus, ...myStatuses]);
    setIsCreating(false);
  };

  const handleDeleteStatus = async (statusId) => {
    try {
      await statusService.deleteStatus(statusId);
      setMyStatuses(myStatuses.filter(s => s._id !== statusId));
    } catch (err) {
      console.error("Error deleting status:", err);
    }
  };

  const getMyAvatarChar = () => currentUser?.username?.[0] || 'U';

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
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Status</h2>
        </div>
        <div className="flex items-center gap-1">
          <button 
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all duration-200 cursor-pointer" 
            title="Privacy Settings" 
            onClick={() => setShowPrivacy(true)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </button>
          <button 
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all duration-200 cursor-pointer" 
            title="Text Status" 
            onClick={() => setIsCreating(true)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* My Status Row */}
        <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--bg-hover)] transition-all duration-200 cursor-pointer">
          <div 
            className="relative cursor-pointer"
            onClick={() => myStatuses.length > 0 && onViewStory({ user: currentUser, stories: myStatuses })}
          >
            <StatusAvatar 
              storiesCount={myStatuses.length}
              profilePicture={resolveUrl(currentUser?.profilePicture)}
              username={currentUser?.username}
              size={48}
            />
            <div 
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--whatsapp-green)] text-white flex items-center justify-center text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all duration-250 cursor-pointer" 
              onClick={(e) => { e.stopPropagation(); setIsCreating(true); }}
            >
              +
            </div>
          </div>
          <div className="flex-1 text-left" onClick={() => setIsCreating(true)}>
            <div className="font-semibold text-sm text-[var(--text-primary)]">My Status</div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
              {myStatuses.length > 0 
                ? `${myStatuses.length} update${myStatuses.length > 1 ? 's' : ''}` 
                : "Tap to add status update"}
            </div>
          </div>
        </div>

        {/* Status Creator */}
        <StatusCreator 
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          onPostStatusSuccess={handlePostStatusSuccess}
          privacyType={privacyType}
          privacyList={privacyList}
        />

        {/* Status List */}
        <StatusList 
          myStatuses={myStatuses}
          recentStatuses={recentStatuses}
          loading={loading}
          onViewStory={onViewStory}
          onDeleteStatus={handleDeleteStatus}
          setShowViewers={setShowViewers}
          currentUser={currentUser}
        />
      </div>

      {/* Privacy Settings Modal */}
      <StatusPrivacyModal 
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        privacyType={privacyType}
        setPrivacyType={setPrivacyType}
        privacyList={privacyList}
        setPrivacyList={setPrivacyList}
        users={users}
        currentUser={currentUser}
      />

      {/* Viewers list modal */}
      <StatusViewersModal 
        viewers={showViewers}
        onClose={() => setShowViewers(null)}
      />
    </div>
  );
};

export default SidebarStatus;
