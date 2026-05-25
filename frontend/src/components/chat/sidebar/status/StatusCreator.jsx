import React, { useState } from 'react';
import statusService from '../../../../services/statusService';

const StatusCreator = ({ isOpen, onClose, onPostStatusSuccess, privacyType, privacyList }) => {
  const [statusText, setStatusText] = useState("");
  const [statusMedia, setStatusMedia] = useState(null);
  const [statusType, setStatusType] = useState("text");
  const [statusBg, setStatusBg] = useState("#25D366");
  const [statusFont, setStatusFont] = useState("Inter");

  if (!isOpen) return null;

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
      onPostStatusSuccess(newStatus);
      setStatusText("");
      setStatusMedia(null);
      setStatusType("text");
    } catch (err) {
      console.error("Error posting status:", err);
    }
  };

  return (
    <div 
      className="p-5 rounded-2xl border border-[var(--border-light)] flex flex-col gap-4 shadow-xl relative" 
      style={{ 
        background: statusType === 'text' ? statusBg : 'var(--bg-panel)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="w-full flex justify-center">
        {statusMedia && (
          statusType === 'video' ? (
            <video src={statusMedia} className="w-full max-h-[220px] rounded-xl object-contain bg-black" controls />
          ) : (
            <img src={statusMedia} alt="Preview" className="w-full max-h-[220px] object-contain rounded-xl bg-black/20" />
          )
        )}
      </div>
      
      <textarea 
        className={`w-full bg-transparent text-white border-none outline-none resize-none px-4 py-2 font-medium focus:ring-0 ${
          statusType === 'text' ? 'text-2xl text-center min-h-[150px]' : 'text-sm text-left min-h-[60px] text-[var(--text-primary)]'
        }`}
        placeholder={statusType === 'text' ? "Type a status" : "Add a caption..."}
        value={statusText}
        onChange={(e) => setStatusText(e.target.value)}
        style={{ 
          fontFamily: statusType === 'text' ? statusFont : 'inherit',
          color: statusType === 'text' ? 'white' : 'var(--text-primary)',
        }}
      />
      
      <div className="flex flex-col gap-3">
        {statusType === 'text' && (
          <div className="flex items-center gap-2">
            <button 
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition duration-200 cursor-pointer" 
              onClick={handleNextColor} 
              title="Change Background"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.03345 19.1749 5.099 19.4318 5.0245 19.6644L4.7645 20.4764C4.60635 20.9702 5.0298 21.464 5.54466 21.3644L6.96328 21.0894C7.15876 21.0515 7.36395 21.1092 7.50974 21.2464C8.79018 21.7377 10.334 22 12 22Z"/>
                <circle cx="7.5" cy="10.5" r="1"/>
                <circle cx="11.5" cy="7.5" r="1"/>
                <circle cx="16.5" cy="9.5" r="1"/>
              </svg>
            </button>
            <button 
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition duration-200 cursor-pointer" 
              onClick={handleNextFont} 
              title="Change Font"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 7 4 4 20 4 20 7"/>
                <line x1="9" y1="20" x2="15" y2="20"/>
                <line x1="12" y1="4" x2="12" y2="20"/>
              </svg>
            </button>
          </div>
        )}
        
        <div className="flex items-center justify-between border-t border-[var(--border-light)]/20 pt-3">
          <div className="flex items-center gap-2">
            <label className="w-9 h-9 rounded-full bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] border border-[var(--border-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition duration-200 cursor-pointer" title="Photo">
              <input type="file" accept="image/*" hidden onChange={handleFileChange} />
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </label>
            <label className="w-9 h-9 rounded-full bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] border border-[var(--border-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition duration-200 cursor-pointer" title="Video">
              <input type="file" accept="video/*" hidden onChange={handleFileChange} />
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M23 7l-7 5 7 5V7z"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition duration-200 cursor-pointer" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="w-10 h-10 rounded-full bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white flex items-center justify-center transition-all duration-200 shadow-md hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={handlePostStatus} 
              disabled={!statusText.trim() && !statusMedia}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCreator;
