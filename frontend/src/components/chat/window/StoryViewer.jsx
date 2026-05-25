import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import statusService from '../../../services/statusService';

const StoryViewer = ({ status, onClose }) => {
  const { user, stories } = status;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentStory = stories[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  useEffect(() => {
    if (!currentStory) return;
    
    // Mark as viewed
    statusService.markStatusAsViewed(currentStory._id).catch(err => console.error("Error marking viewed:", err));

    const duration = currentStory.type === 'video' ? 10000 : 5000; // 10s for video, 5s for text/image
    const step = 100 / (duration / 50);
    
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          handleNext();
          return 0;
        }
        return p + step;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [currentStory, handleNext]);

  const [replyText, setReplyText] = useState("");

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    try {
      await api.post("/messages", {
        receiverId: user.userId,
        text: `Replying to status: ${replyText}`,
        messageType: 'text'
      });
      setReplyText("");
      onClose();
      alert("Reply sent!");
    } catch (e) {
      console.error("Reply failed", e);
    }
  };

  const handleReaction = async (emoji) => {
    try {
       await api.post("/messages", {
         receiverId: user.userId,
         text: emoji,
         messageType: 'text'
       });
       onClose();
       alert(`Reacted with ${emoji}`);
    } catch (e) { console.error("Reaction failed", e); }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-[3000] bg-black/95 flex items-center justify-center backdrop-blur-lg animate-overlay-fade">
      <div className="relative w-full max-w-[480px] h-[90vh] flex flex-col z-[3001] bg-black rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent z-20 flex flex-col gap-3">
          <div className="flex gap-1 w-full pt-1">
            {stories.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-whatsapp-green transition-all duration-100 ease-linear" 
                  style={{ 
                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                  }} 
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 text-white justify-between w-full">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-whatsapp-green to-whatsapp-teal flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-md select-none">{user?.username?.[0].toUpperCase()}</div>
            <div className="flex-1 flex flex-col min-w-0">
              <div className="font-semibold text-sm">{user?.username}</div>
              <div className="text-[10px] text-zinc-300 font-medium">{new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <button className="bg-transparent border-0 text-white text-3xl cursor-pointer hover:opacity-80 transition" onClick={onClose}>&times;</button>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black select-none cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x < rect.width / 3) handlePrev();
          else handleNext();
        }}>
          {currentStory.type === 'image' && <img src={currentStory.mediaUrl} alt="status" className="w-full h-full object-contain" />}
          {currentStory.type === 'video' && <video src={currentStory.mediaUrl} autoPlay muted className="w-full h-full object-contain" />}
          {currentStory.type === 'text' && (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white text-center p-10 break-words" style={{ 
              background: currentStory.backgroundColor || 'var(--whatsapp-green)', 
              fontFamily: currentStory.fontFamily || 'inherit'
            }}>
              {currentStory.text}
            </div>
          )}
          <div className="absolute bottom-20 left-0 right-0 text-center text-white/50 text-[10px] pointer-events-none select-none tracking-wider uppercase font-semibold">
             ▲ Tap sides to navigate / reply below
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 py-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 flex flex-col gap-3">
          <div className="flex justify-around items-center gap-1.5 select-none pb-1 border-b border-white/5">
            {['❤️', '😂', '😮', '😢', '🙏', '🔥'].map(emoji => (
              <button key={emoji} onClick={(e) => { e.stopPropagation(); handleReaction(emoji); }} className="text-2xl hover:scale-125 transition bg-transparent border-0 cursor-pointer">{emoji}</button>
            ))}
          </div>
          <div className="flex gap-2 items-center w-full">
            <input 
              type="text" 
              placeholder="Reply..." 
              className="flex-1 px-4 py-2 bg-white/10 text-white placeholder-zinc-400 border border-transparent rounded-full text-sm outline-none focus:border-whatsapp-green focus:bg-white/15 transition" 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <button className="w-8 h-8 rounded-full bg-whatsapp-green text-white flex items-center justify-center border-none cursor-pointer transition hover:scale-105 active:scale-95 shadow-md shrink-0" onClick={(e) => { e.stopPropagation(); handleSendReply(); }}>➤</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
