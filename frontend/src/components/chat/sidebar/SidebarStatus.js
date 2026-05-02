import React, { useState, useEffect, useCallback } from 'react';
import './SidebarStatus.css';
import statusService from '../../../services/statusService';

const SidebarStatus = ({ currentUser, onViewStory, users }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [statusMedia, setStatusMedia] = useState(null);
  const [statusType, setStatusType] = useState("text");
  const [myStatuses, setMyStatuses] = useState([]);
  const [recentStatuses, setRecentStatuses] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const type = file.type.startsWith('video') ? 'video' : 'image';
    setStatusType(type);

    const reader = new FileReader();
    reader.onloadend = () => {
      setStatusMedia(reader.result); // Base64
    };
    reader.readAsDataURL(file);
  };

  const [statusBg, setStatusBg] = useState("#25D366");
  const [statusFont, setStatusFont] = useState("Inter");

  const colors = ["#25D366", "#128C7E", "#34B7F1", "#FF2D55", "#FF9500", "#5856D6", "#007AFF", "#3F51B5", "#9C27B0", "#673AB7", "#795548", "#607D8B", "#212121"];
  const fonts = ["Inter", "serif", "monospace", "cursive", "system-ui"];

  const handleNextColor = () => {
    const nextIdx = (colors.indexOf(statusBg) + 1) % colors.length;
    setStatusBg(colors[nextIdx]);
  };

  const handleNextFont = () => {
    const nextIdx = (fonts.indexOf(statusFont) + 1) % fonts.length;
    setStatusFont(fonts[nextIdx]);
  };

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [privacyType, setPrivacyType] = useState('all'); // all, except, only
  const [privacyList, setPrivacyList] = useState([]); // Selected userIds
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [showViewers, setShowViewers] = useState(null); // Array of viewers

  const handlePostStatus = async () => {
    if (!statusText.trim() && !statusMedia) return;
    try {
      const newStatus = await statusService.createStatus({ 
        text: statusText, 
        mediaUrl: statusMedia,
        type: statusType,
        backgroundColor: statusBg,
        fontFamily: statusFont,
        privacyType: privacyType,
        privacyList: privacyList
      });
      setMyStatuses([newStatus, ...myStatuses]);
      setStatusText("");
      setStatusMedia(null);
      setStatusType("text");
      setIsCreating(false);
    } catch (err) {
      console.error("Error posting status:", err);
    }
  };

  const toggleUserSelection = (userId) => {
    if (privacyList.includes(userId)) {
      setPrivacyList(privacyList.filter(id => id !== userId));
    } else {
      setPrivacyList([...privacyList, userId]);
    }
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
    <div className="sidebar-content-view">
      <div className="chat-sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h2>Status</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
             <button className="chat-header-icon-btn" title="Privacy Settings" onClick={() => setShowPrivacy(true)}>🛡️</button>
             <button className="chat-header-icon-btn" title="Text Status" onClick={() => { setIsCreating(true); setStatusType('text'); }}>✎</button>
             <button className="chat-header-icon-btn" title="Media Status" onClick={() => { setIsCreating(true); setStatusType('image'); }}>📷</button>
          </div>
        </div>
      </div>

      <div className="sidebar-status-container">
        {showPrivacy && (
          <div className="status-privacy-overlay" onClick={() => setShowPrivacy(false)}>
            {!showUserSelection ? (
              <div className="status-privacy-modal" onClick={e => e.stopPropagation()}>
                <h3>Status privacy</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Who can see your status updates</p>
                <div className="privacy-option" onClick={() => { setPrivacyType('all'); setPrivacyList([]); }}>
                    <input type="radio" checked={privacyType === 'all'} readOnly />
                    <label>My contacts</label>
                </div>
                <div className="privacy-option" onClick={() => { setPrivacyType('except'); setShowUserSelection(true); }}>
                    <input type="radio" checked={privacyType === 'except'} readOnly />
                    <div style={{ flex: 1 }}>
                      <label>My contacts except...</label>
                      {privacyType === 'except' && <div style={{ fontSize: '12px', color: 'var(--whatsapp-green)' }}>{privacyList.length} excluded</div>}
                    </div>
                </div>
                <div className="privacy-option" onClick={() => { setPrivacyType('only'); setShowUserSelection(true); }}>
                    <input type="radio" checked={privacyType === 'only'} readOnly />
                    <div style={{ flex: 1 }}>
                      <label>Only share with...</label>
                      {privacyType === 'only' && <div style={{ fontSize: '12px', color: 'var(--whatsapp-green)' }}>{privacyList.length} selected</div>}
                    </div>
                </div>
                <button className="professional-button" style={{ width: '100%', marginTop: '20px' }} onClick={() => setShowPrivacy(false)}>Done</button>
              </div>
            ) : (
              <div className="status-privacy-modal" onClick={e => e.stopPropagation()} style={{ minWidth: '350px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <button className="icon-button" onClick={() => setShowUserSelection(false)}>←</button>
                  <h3 style={{ margin: 0 }}>{privacyType === 'except' ? 'Hide status from' : 'Share status with'}</h3>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                  {users.filter(u => u.userId !== currentUser.userId && !u.isGroup && !u.groupId && !u.communityId && !u.isCommunity && !u.isCommunityGroup).map(u => (
                    <div key={u.userId} className="modal-list-item clickable" onClick={() => toggleUserSelection(u.userId)}>
                       <div className="modal-avatar">{u.username?.[0]}</div>
                       <div className="modal-list-name" style={{ flex: 1 }}>{u.username}</div>
                       <input type="checkbox" checked={privacyList.includes(u.userId)} readOnly style={{ width: '18px', height: '18px' }} />
                    </div>
                  ))}
                </div>
                <button className="professional-button" style={{ width: '100%', marginTop: '16px' }} onClick={() => setShowUserSelection(false)}>Done</button>
              </div>
            )}
          </div>
        )}

        <div className="status-my-status">
          <div 
            className={`status-avatar-ring ${myStatuses.length > 0 ? 'has-status' : ''}`} 
            onClick={() => myStatuses.length > 0 && onViewStory({ user: currentUser, stories: myStatuses })}
          >
            <div className="status-avatar">{getMyAvatarChar()}</div>
            <div className="status-add-icon" onClick={(e) => { e.stopPropagation(); setIsCreating(true); }}>+</div>
          </div>
          <div className="status-info" onClick={() => setIsCreating(true)}>
            <div className="status-name">My Status</div>
            <div className="status-time">
              {myStatuses.length > 0 
                ? `${myStatuses.length} update${myStatuses.length > 1 ? 's' : ''}` 
                : "Tap to add status update"}
            </div>
          </div>
        </div>
        
        {isCreating && (
          <div className="status-creator-panel" style={{ 
            background: statusType === 'text' ? statusBg : 'var(--bg-panel)',
            transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div className="status-media-preview">
              {statusMedia && (
                statusType === 'video' ? (
                  <video src={statusMedia} style={{ width: '100%', maxHeight: '200px', borderRadius: '12px' }} controls />
                ) : (
                  <img src={statusMedia} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '12px' }} />
                )
              )}
            </div>
            
            <textarea 
              className={`status-textarea ${statusType === 'text' ? 'large-text' : ''}`} 
              placeholder={statusType === 'text' ? "Type a status" : "Add a caption..."}
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              style={{ 
                fontFamily: statusType === 'text' ? statusFont : 'inherit',
                color: statusType === 'text' ? 'white' : 'var(--text-primary)',
                background: 'transparent',
                border: 'none',
                width: '100%',
                minHeight: statusType === 'text' ? '150px' : '60px',
                textAlign: statusType === 'text' ? 'center' : 'left',
                fontSize: statusType === 'text' ? '24px' : '15px',
                outline: 'none',
                resize: 'none',
                padding: '20px'
              }}
            />
            
            <div className="status-creator-tools">
              {statusType === 'text' && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <button className="tool-btn" onClick={handleNextColor} title="Change Background">🎨</button>
                  <button className="tool-btn" onClick={handleNextFont} title="Change Font">T</button>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label className="icon-tool" title="Photo">
                    <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                    🖼️
                  </label>
                  <label className="icon-tool" title="Video">
                    <input type="file" accept="video/*" hidden onChange={handleFileChange} />
                    📹
                  </label>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="text-button" onClick={() => { setIsCreating(false); setStatusMedia(null); setStatusText(''); }}>Cancel</button>
                  <button className="send-status-btn" onClick={handlePostStatus} disabled={!statusText.trim() && !statusMedia}>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {myStatuses.length > 0 && (
          <div className="my-statuses-list" style={{ marginTop: '10px' }}>
            <div className="status-section-title">MY UPDATES</div>
            {myStatuses.map(s => (
              <div 
                key={s._id} 
                className="my-status-item clickable" 
                style={{ display: 'flex', alignItems: 'center', padding: '12px', background: 'var(--bg-panel)', borderRadius: '12px', marginBottom: '8px' }}
                onClick={() => onViewStory({ user: currentUser, stories: [s] })}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: s.backgroundColor || 'var(--whatsapp-green)', marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                   {s.type === 'text' ? <span style={{ fontSize: '10px', color: 'white' }}>T</span> : <img src={s.mediaUrl} alt="Status" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{s.text || (s.type === 'image' ? 'Photo' : 'Video')}</div>
                  <div 
                    style={{ fontSize: '12px', color: 'var(--whatsapp-green)', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); setShowViewers(s.viewedBy); }}
                  >
                    👁️ {s.viewedBy?.length || 0} views • {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <button className="icon-button danger" onClick={(e) => { e.stopPropagation(); handleDeleteStatus(s._id); }} title="Delete status">🗑️</button>
              </div>
            ))}
          </div>
        )}

        {showViewers && (
          <div className="whatsapp-modal-overlay" onClick={() => setShowViewers(null)}>
            <div className="whatsapp-modal" onClick={e => e.stopPropagation()} style={{ minWidth: '300px', padding: '20px' }}>
               <h3 style={{ marginTop: 0 }}>Viewed by</h3>
               <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {showViewers.length > 0 ? showViewers.map(viewer => (
                    <div key={viewer._id || viewer} className="modal-list-item" style={{ padding: '10px 0' }}>
                       <div className="modal-avatar">{viewer.username?.[0] || '?'}</div>
                       <div className="modal-list-name">{viewer.username || 'Unknown'}</div>
                    </div>
                  )) : <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No views yet</p>}
               </div>
               <button className="professional-button" style={{ width: '100%', marginTop: '16px' }} onClick={() => setShowViewers(null)}>Close</button>
            </div>
          </div>
        )}

        <div className="status-section-title">RECENT UPDATES</div>
        
        <div className="status-list">
          {loading ? (
            <div className="status-loading">Loading...</div>
          ) : recentStatuses.length > 0 ? (
            recentStatuses.map((item) => (
              <div 
                key={item.user.userId} 
                className="status-item" 
                onClick={() => onViewStory(item)}
              >
                <div className="status-avatar-ring has-status">
                  <div className="status-avatar">{item.user.username?.[0] || '?'}</div>
                </div>
                <div className="status-info">
                  <div className="status-name">{item.user.username}</div>
                  <div className="status-time">
                    {new Date(item.stories[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="status-empty-message">
              <p>No recent updates from your contacts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarStatus;
