import React from "react";

const CallControls = ({
  isAnswered,
  isMicMuted,
  isVideoOff,
  type,
  handleAnswer,
  handleReject,
  toggleMic,
  toggleVideo,
  endCall
}) => {
  return (
    <div className="flex justify-center gap-4 py-4 z-10">
      {!isAnswered ? (
        <>
          <button 
            className="w-14 h-14 rounded-full border-none flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition shadow-lg bg-[#25d366] text-white" 
            onClick={handleAnswer}
            title="Answer Call"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 0 0-1.02.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 0 0 8.5 4c0-.56-.44-1-1-1H4c-.56 0-1 .44-1 1 0 9.39 7.61 17 17 17 .56 0 1-.44 1-1v-3.5c0-.56-.44-1-1-1z"/>
            </svg>
          </button>
          <button 
            className="w-14 h-14 rounded-full border-none flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition shadow-lg bg-[#ef4444] text-white" 
            onClick={handleReject}
            title="Decline Call"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 9c-2.2 0-4.3.3-6.2.9c-.2.1-.4.2-.5.4l-1.2 1.2c-.3.3-.3.8 0 1.1l1.8 1.8c.2.2.5.3.8.1l2.4-1.5c.2-.1.3-.3.3-.6v-3c1.9-.5 3.9-.8 6-.8s4.1.3 6 .8v3c0 .3.1.5.3.6l2.4 1.5c.3.2.6.1.8-.1l1.8-1.8c.3-.3.3-.8 0-1.1l-1.2-1.2c-.1-.2-.3-.3-.5-.4c-1.9-.6-4-1-6.2-.9z"/>
            </svg>
          </button>
        </>
      ) : (
        <>
          <button 
            className={`w-12 h-12 rounded-full border-none flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition shadow-lg ${isMicMuted ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`} 
            onClick={toggleMic}
            title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMicMuted ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17l-1.98-1.98V5c0-1.66-1.34-3-3-3S7 3.34 7 5v3.17l8.02 8.02c.07-.38.1-.78.1-1.19v-3.83zM4.27 3L3 4.27l6.01 6.01V11c0 2.76 2.24 5 5 5 .74 0 1.43-.16 2.05-.43l2.67 2.67 1.27-1.27L4.27 3zM12 18c-3.28 0-6-2.72-6-6H4c0 3.87 3.13 7 7 7.23V22h2v-2.77c.36-.04.72-.1 1.07-.2l-2.05-2.05L12 18z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
              </svg>
            )}
          </button>
          {type === "video" && (
            <button 
              className={`w-12 h-12 rounded-full border-none flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition shadow-lg ${isVideoOff ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`} 
              onClick={toggleVideo}
              title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
            >
              {isVideoOff ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M3.27 2L2 3.27l2.28 2.28C4.1 5.7 4 5.85 4 6v10c0 1.1.9 2 2 2h10c.15 0 .3-.1.45-.18L18.73 20l1.27-1.27L3.27 2zM6 16V8.82L13.18 16H6zm15-9.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
              )}
            </button>
          )}
          <button 
            className="w-12 h-12 rounded-full border-none flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition shadow-lg bg-[#ef4444] text-white" 
            onClick={() => endCall(true)}
            title="End Call"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 9c-2.2 0-4.3.3-6.2.9c-.2.1-.4.2-.5.4l-1.2 1.2c-.3.3-.3.8 0 1.1l1.8 1.8c.2.2.5.3.8.1l2.4-1.5c.2-.1.3-.3.3-.6v-3c1.9-.5 3.9-.8 6-.8s4.1.3 6 .8v3c0 .3.1.5.3.6l2.4 1.5c.3.2.6.1.8-.1l1.8-1.8c.3-.3.3-.8 0-1.1l-1.2-1.2c-.1-.2-.3-.3-.5-.4c-1.9-.6-4-1-6.2-.9z"/>
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default CallControls;
