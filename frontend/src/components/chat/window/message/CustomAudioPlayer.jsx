import React, { useState, useRef, useEffect } from "react";

const CustomAudioPlayer = ({ src }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    // Initial check in case it's cached
    if (audio.duration && isFinite(audio.duration)) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  const togglePlay = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(err => console.error("Playback failed:", err));
      setIsPlaying(true);
    }
  };

  const handleSliderChange = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="flex items-center gap-3 p-2 bg-black/15 rounded-xl w-full min-w-[240px] max-w-[280px] select-none text-left" onClick={e => e.stopPropagation()}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <button 
        onClick={togglePlay}
        className="w-9 h-9 rounded-full bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white flex items-center justify-center shrink-0 shadow-sm border-none cursor-pointer transition active:scale-95"
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <rect x="6" y="4" width="3" height="16" rx="1" />
            <rect x="15" y="4" width="3" height="16" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="ml-0.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1 min-w-0 pr-1">
        <input 
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSliderChange}
          className="w-full h-1 bg-white/20 accent-[var(--whatsapp-green)] rounded-lg appearance-none cursor-pointer outline-none transition hover:bg-white/30"
          style={{
            background: `linear-gradient(to right, var(--whatsapp-green) 0%, var(--whatsapp-green) ${
              duration ? (currentTime / duration) * 100 : 0
            }%, rgba(255, 255, 255, 0.2) ${
              duration ? (currentTime / duration) * 100 : 0
            }%, rgba(255, 255, 255, 0.2) 100%)`
          }}
        />
        <div className="flex justify-between items-center text-[9px] text-[var(--text-secondary)] font-semibold leading-none mt-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default CustomAudioPlayer;
