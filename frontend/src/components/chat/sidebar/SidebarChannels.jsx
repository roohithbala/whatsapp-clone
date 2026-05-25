import React, { useState, useEffect } from 'react';
import channelService from '../../../services/channelService';

const API_BASE = 'http://localhost:5000';

const SidebarChannels = ({ currentUser, setSelectedUser, setRailMode }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const data = await channelService.getChannels();
      setChannels(data);
    } catch (err) {
      console.error("Error fetching channels:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleFollow = async (channelId) => {
    try {
      await channelService.followChannel(channelId);
      // Update local state to reflect follow status
      setChannels(prev => prev.map(ch => {
        if (ch.channelId === channelId) {
          const isFollowing = ch.followers.includes(currentUser.userId);
          const newFollowers = isFollowing 
            ? ch.followers.filter(id => id !== currentUser.userId)
            : [...ch.followers, currentUser.userId];
          return { ...ch, followers: newFollowers };
        }
        return ch;
      }));
    } catch (err) {
      console.error("Error following channel:", err);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const newCh = await channelService.createChannel({ name: newName, description: newDesc });
      setChannels([newCh, ...channels]);
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
    } catch (err) {
      console.error("Error creating channel:", err);
    }
  };

  const filteredChannels = channels.filter(ch => 
    ch.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ch.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-sidebar)]">
      {/* Header */}
      <div className="p-5 border-b border-[var(--border-light)] flex items-center justify-between text-left bg-[var(--bg-sidebar-alt)]">
        <div className="flex items-center gap-3">
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
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Channels</h2>
        </div>
        <button 
          className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition duration-200 shrink-0 ${showCreate ? 'bg-whatsapp-green/20 text-whatsapp-green' : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'}`} 
          onClick={() => setShowCreate(!showCreate)}
          title="Create Channel"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Create Panel card */}
        {showCreate && (
          <div className="px-4 pt-3 pb-1 shrink-0">
            <div className="bg-[var(--bg-sidebar-alt)] border border-[var(--border-light)] rounded-2xl p-4 shadow-xl flex flex-col gap-3 animate-[slideDown_0.2s_ease_forwards]">
              <h3 className="text-sm font-bold text-[var(--text-primary)] text-left">Create a Channel</h3>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-transparent rounded-xl text-sm focus:border-whatsapp-green focus:bg-[var(--bg-sidebar)] focus:outline-none transition duration-200" 
                placeholder="Channel name..." 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <textarea 
                className="w-full h-[75px] px-4 py-2.5 bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-transparent rounded-xl text-sm focus:border-whatsapp-green focus:bg-[var(--bg-sidebar)] focus:outline-none transition duration-200 resize-none" 
                placeholder="Description..." 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              <div className="flex gap-2.5 justify-end mt-1">
                <button 
                  className="px-4 py-2 bg-transparent text-[var(--text-secondary)] hover:bg-white/5 text-xs font-semibold rounded-full border-0 cursor-pointer transition duration-150" 
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-5 py-2 bg-whatsapp-green hover:bg-whatsapp-dark-green text-white text-xs font-semibold rounded-full shadow-md transition duration-150 cursor-pointer disabled:opacity-50" 
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Text / Banner */}
        <div className="px-4 py-3 select-none text-left shrink-0">
          <div className="bg-[var(--bg-sidebar-alt)]/35 border border-[var(--border-light)]/40 p-3.5 rounded-2xl">
            <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
              📢 <strong>Stay updated on topics that matter to you.</strong> Explore public channels to get news, announcements, and info directly from creators.
            </p>
          </div>
        </div>

        {/* Local Search input */}
        <div className="px-4 py-1.5 shrink-0">
          <div className="flex items-center gap-3 bg-[var(--bg-input)] px-3.5 h-[38px] rounded-lg w-full transition-all duration-200 focus-within:border-whatsapp-green/40 border border-transparent">
            <svg viewBox="0 0 24 24" width="16" height="16" className="fill-[var(--text-secondary)] shrink-0">
              <path d="M15.009 13.805h-.636l-.226-.217a5.184 5.184 0 0 0 1.256-3.386 5.2 5.2 0 1 0-5.2 5.2 5.184 5.184 0 0 0 3.386-1.256l.217.226v.636l4.022 4.013 1.199-1.2-4.013-4.022zm-4.807 0a3.606 3.606 0 1 1 0-7.211 3.606 3.606 0 0 1 0 7.211z"/>
            </svg>
            <input 
              type="text" 
              className="bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] text-[13px] outline-none w-full"
              placeholder="Search channels..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Channels List Header */}
        <div className="px-4 pt-4 pb-2 text-xs font-bold text-[var(--whatsapp-green)] tracking-wider uppercase text-left shrink-0">
          Find Channels
        </div>

        {/* Channels list */}
        <div className="flex-1 px-4 pb-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-6 h-6 border-2 border-[var(--whatsapp-green)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredChannels.length > 0 ? (
            <div className="flex flex-col">
              {filteredChannels.map(ch => {
                const isFollowing = ch.followers?.includes(currentUser?.userId);
                const followersCount = ch.followers?.length || 0;
                
                return (
                  <div 
                    key={ch.channelId} 
                    className="flex items-center py-3 border-b border-[var(--border-light)]/70 hover:bg-white/[0.02] cursor-pointer transition select-none group text-left"
                    onClick={() => {
                      if (setSelectedUser) {
                        setSelectedUser({
                          ...ch,
                          userId: ch.channelId,
                          username: ch.name,
                          isChannel: true
                        });
                      }
                      if (setRailMode) {
                        setRailMode("messages");
                      }
                    }}
                  >
                    {/* Avatar with fallback character */}
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-whatsapp-green to-whatsapp-teal flex items-center justify-center font-bold text-white text-base shrink-0 mr-3.5 shadow-md overflow-hidden relative select-none">
                      <span>{ch.name[0]?.toUpperCase()}</span>
                      {ch.avatarUrl && (
                        <img src={ch.avatarUrl} alt="" className="w-full h-full object-cover absolute inset-0" onError={e => { e.target.style.display = "none"; }} />
                      )}
                    </div>

                    <div className="flex-grow flex flex-col min-w-0 mr-3">
                      <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5 truncate">
                        <span className="truncate">{ch.name}</span>
                        {/* Verified badge */}
                        <span className="w-4 h-4 bg-whatsapp-green text-white rounded-full flex items-center justify-center text-[9px] shrink-0 font-bold" title="Verified Channel">✓</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 font-medium shrink-0">
                        {followersCount} follower{followersCount !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] truncate mt-1 leading-normal">
                        {ch.description || "Stay tuned for updates!"}
                      </div>
                    </div>

                    <button 
                      className={`ml-auto px-4 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition shrink-0 border-0 ${
                        isFollowing 
                          ? 'bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]' 
                          : 'bg-whatsapp-green hover:bg-whatsapp-dark-green text-white shadow-md'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow(ch.channelId);
                      }}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--text-secondary)]">
              <p className="text-sm">No channels found.</p>
              {searchQuery && <p className="text-xs text-[var(--text-muted)] mt-1">Try another search term</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarChannels;
