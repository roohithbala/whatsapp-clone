import React from 'react';
import StatusAvatar from './StatusAvatar';

const StatusList = ({
  myStatuses,
  recentStatuses,
  loading,
  onViewStory,
  onDeleteStatus,
  setShowViewers,
  currentUser
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* My Status Updates List */}
      {myStatuses.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          <div className="text-xs font-bold text-[var(--whatsapp-green)] tracking-wider uppercase mb-1">My Updates</div>
          {myStatuses.map(s => (
            <div 
              key={s._id} 
              className="flex items-center gap-3 p-3 bg-[var(--bg-panel)] border border-[var(--border-light)] rounded-xl hover:bg-[var(--bg-hover)] transition-all duration-200 cursor-pointer text-left" 
              onClick={() => onViewStory({ user: currentUser, stories: [s] })}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ background: s.backgroundColor || 'var(--whatsapp-green)' }}
              >
                 {s.type === 'text' 
                   ? <span className="text-xs font-bold text-white uppercase">Text</span> 
                   : <img src={s.mediaUrl} alt="Status" className="w-full h-full object-cover" />
                 }
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {s.text || (s.type === 'image' ? 'Photo' : 'Video')}
                </div>
                <div 
                  className="text-xs text-[var(--whatsapp-green)] font-medium mt-0.5 cursor-pointer hover:underline flex items-center gap-1.5"
                  onClick={(e) => { e.stopPropagation(); setShowViewers(s.viewedBy); }}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>{s.viewedBy?.length || 0} views • {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <button 
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 transition duration-200 cursor-pointer flex-shrink-0" 
                onClick={(e) => { e.stopPropagation(); onDeleteStatus(s._id); }} 
                title="Delete status"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recent Updates Section */}
      <div>
        <div className="text-xs font-bold text-[var(--whatsapp-green)] tracking-wider uppercase mb-2">Recent Updates</div>
        
        <div className="flex flex-col gap-1">
          {loading ? (
            <div className="py-8 text-center text-sm text-[var(--text-secondary)] animate-pulse">Loading...</div>
          ) : recentStatuses.length > 0 ? (
            recentStatuses.map((item) => (
              <div 
                key={item.user.userId} 
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--bg-hover)] transition-all duration-200 cursor-pointer text-left" 
                onClick={() => onViewStory(item)}
              >
                <StatusAvatar 
                  storiesCount={item.stories?.length || 0}
                  profilePicture={item.user.profilePicture}
                  username={item.user.username}
                  size={48}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-[var(--text-primary)] truncate">{item.user.username}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {new Date(item.stories[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-[var(--text-secondary)]">
              <p>No recent updates from your contacts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusList;
