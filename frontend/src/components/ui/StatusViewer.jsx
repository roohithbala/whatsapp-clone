import React, { useState, useEffect } from 'react';

const StatusViewer = ({ statuses, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!statuses || statuses.length === 0) return;

    const timer = setTimeout(() => {
      if (currentIndex < statuses.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onClose();
      }
    }, 5000); // 5 seconds per status

    return () => clearTimeout(timer);
  }, [currentIndex, statuses, onClose]);

  if (!statuses || statuses.length === 0) return null;

  const currentStatus = statuses[currentIndex];

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0b141a] z-[9999] flex flex-col text-white">
      <div className="p-5 bg-gradient-to-b from-black/60 to-transparent z-10">
        <div className="flex gap-1.5 mb-4">
          {statuses.map((s, i) => (
            <div key={i} className="flex-1 h-[3px] bg-white/30 rounded-[2px] overflow-hidden">
              <div 
                className={`h-full bg-white transition-all ${i < currentIndex ? 'w-full' : i === currentIndex ? 'animate-status-progress' : 'w-0'}`}
              ></div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="bg-transparent border-none text-white text-3xl cursor-pointer hover:opacity-80 transition">&times;</button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center relative overflow-hidden p-10 cursor-pointer" onClick={handleNext}>
        {currentStatus.mediaUrl && <img src={currentStatus.mediaUrl} alt="Status" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg" />}
        {currentStatus.text && <div className="text-3xl text-center mt-6 max-w-[80%] break-words font-sans font-medium">{currentStatus.text}</div>}
      </div>

      <button className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white border-none rounded-full w-12 h-12 text-xl cursor-pointer flex items-center justify-center transition z-20" onClick={(e) => { e.stopPropagation(); handlePrev(); }}>
        &#10094;
      </button>
      <button className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white border-none rounded-full w-12 h-12 text-xl cursor-pointer flex items-center justify-center transition z-20" onClick={(e) => { e.stopPropagation(); handleNext(); }}>
        &#10095;
      </button>
    </div>
  );
};

export default StatusViewer;
