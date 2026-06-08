import React, { useState, useEffect, useRef, useCallback } from 'react';
import socket from '../../../socket';

class SyntheticRingtone {
  constructor(isIncoming) {
    this.isIncoming = isIncoming;
    this.audioCtx = null;
    this.intervalId = null;
  }

  start() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.audioCtx = new AudioContextClass();
      
      const playRing = () => {
        if (!this.audioCtx || this.audioCtx.state === 'closed') return;
        
        const now = this.audioCtx.currentTime;
        if (this.isIncoming) {
          // Double ring: ring 0.4s, pause 0.2s, ring 0.4s, pause 2s
          this.createBeep(now, 0.4, 480, 440);
          this.createBeep(now + 0.6, 0.4, 480, 440);
        } else {
          // Outgoing ringback: ring 1.5s, pause 2s
          this.createBeep(now, 1.5, 440, 400);
        }
      };

      playRing();
      this.intervalId = setInterval(playRing, this.isIncoming ? 3000 : 4000);
    } catch (e) {
      console.warn("Web Audio API not supported or blocked:", e);
    }
  }

  createBeep(startTime, duration, freq1, freq2) {
    if (!this.audioCtx) return;
    
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.value = freq1;
    
    osc2.type = 'sine';
    osc2.frequency.value = freq2;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
    gainNode.gain.setValueAtTime(0.08, startTime + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

const CallWindow = ({ remoteUser, type, onEndCall, isIncoming, initialOffer, currentUser }) => {
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState(isIncoming ? 'Incoming...' : 'Calling...');
  const [isAnswered, setIsAnswered] = useState(!isIncoming);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  const hasEndedRef = useRef(false);
  const localStreamRef = useRef(null);
  const callStartedRef = useRef(false);
  const pc = useRef(null);

  const localVideoRef = useCallback((node) => {
    if (node && localStream) {
      if (node.srcObject !== localStream) {
        node.srcObject = localStream;
      }
    }
  }, [localStream]);

  const remoteVideoRef = useCallback((node) => {
    if (node && remoteStream) {
      if (node.srcObject !== remoteStream) {
        node.srcObject = remoteStream;
      }
    }
  }, [remoteStream]);

  const isAnsweredRef = useRef(!isIncoming);
  const callDurationRef = useRef(0);
  const typeRef = useRef(type);
  const callStatusRef = useRef(callStatus);
  const iceQueue = useRef([]);

  // Sync state variables to refs to prevent re-creating endCall callbacks
  useEffect(() => {
    isAnsweredRef.current = isAnswered;
  }, [isAnswered]);

  useEffect(() => {
    callDurationRef.current = callDuration;
  }, [callDuration]);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  const stopMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
  }, []);

  const endCall = useCallback((emitCallEnd = true) => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    setHasEnded(true);

    if (emitCallEnd && remoteUser?.userId) {
      socket.emit('call-end', {
        to: remoteUser.userId,
        callData: {
          callerId: isIncoming ? remoteUser.userId : (currentUser?.userId || ''),
          receiverId: isIncoming ? (currentUser?.userId || '') : remoteUser.userId,
          type: typeRef.current,
          status: callStatusRef.current === 'Connected' ? 'ended' : 'missed',
          duration: callDurationRef.current,
          startedAt: new Date(Date.now() - callDurationRef.current * 1000).toISOString()
        }
      });
    }

    stopMedia();
    onEndCall();
  }, [remoteUser?.userId, onEndCall, stopMedia, isIncoming, currentUser]);

  const handleAnswer = () => {
    setIsAnswered(true);
    setCallStatus('Connecting...');
  };

  const handleReject = () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    setHasEnded(true);
    socket.emit('call-reject', { to: remoteUser.userId, type: typeRef.current });
    stopMedia();
    onEndCall();
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Ringtone playback
  useEffect(() => {
    let ringtone = null;
    if (callStatus === 'Calling...' || callStatus === 'Incoming...') {
      ringtone = new SyntheticRingtone(isIncoming);
      ringtone.start();
    }
    return () => {
      if (ringtone) {
        ringtone.stop();
      }
    };
  }, [callStatus, isIncoming]);

  // Dedicated mount-level socket listeners
  useEffect(() => {
    const handleRemoteAnswer = async ({ answer }) => {
      if (pc.current && pc.current.signalingState !== 'closed') {
        try {
          setCallStatus('Connecting...');
          await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
          // Drain ICE candidates queue
          while (iceQueue.current.length > 0) {
            const candidate = iceQueue.current.shift();
            if (pc.current && pc.current.signalingState !== 'closed') {
              await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
          }
        } catch (e) {
          console.error("Error setting remote description:", e);
        }
      }
    };

    const handleRemoteCandidate = async ({ candidate }) => {
      if (pc.current && pc.current.remoteDescription && pc.current.signalingState !== 'closed') {
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding ICE candidate:", e);
        }
      } else {
        // Queue candidates until remote description is set
        iceQueue.current.push(candidate);
      }
    };

    const handleCallEnd = () => {
      setCallStatus('Call ended');
      endCall(false);
    };

    const handleCallReject = () => {
      setCallStatus('Rejected');
      setTimeout(() => endCall(false), 1200);
    };

    socket.on('call-answer', handleRemoteAnswer);
    socket.on('call-candidate', handleRemoteCandidate);
    socket.on('call-end', handleCallEnd);
    socket.on('call-reject', handleCallReject);

    return () => {
      socket.off('call-answer', handleRemoteAnswer);
      socket.off('call-candidate', handleRemoteCandidate);
      socket.off('call-end', handleCallEnd);
      socket.off('call-reject', handleCallReject);
    };
  }, [endCall]);

  const startCall = useCallback(async () => {
    if (!isAnswered) return;
    if (callStartedRef.current) return;
    callStartedRef.current = true;

    try {
      // 1. Get user media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });
      setLocalStream(stream);
      localStreamRef.current = stream;

      // 2. Initialize RTCPeerConnection
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pc.current = peerConnection;

      // 3. Add tracks
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

      // 4. Handle ICE candidates generated locally
      peerConnection.onicecandidate = (e) => {
        if (e.candidate && peerConnection.signalingState !== 'closed') {
          socket.emit('call-candidate', { to: remoteUser.userId, candidate: e.candidate });
        }
      };

      // 5. Handle remote stream tracks
      peerConnection.ontrack = (e) => {
        setRemoteStream(e.streams[0]);
      };

      // 6. Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'connected') {
          setCallStatus('Connected');
        } else if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
          endCall(false);
        }
      };

      // 7. Establish signaling
      if (isIncoming && initialOffer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(initialOffer));
        // Drain ICE candidates collected while ringing
        while (iceQueue.current.length > 0) {
          const candidate = iceQueue.current.shift();
          if (peerConnection.signalingState !== 'closed') {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          }
        }
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('call-answer', { to: remoteUser.userId, answer });
      } else {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('call-offer', { to: remoteUser.userId, offer, type });
      }
    } catch (err) {
      console.error("Call Setup Error:", err);
      setCallStatus('Error');
      setTimeout(() => endCall(true), 2000);
    }
  }, [isAnswered, type, isIncoming, initialOffer, remoteUser.userId, endCall]);

  // Start call session
  useEffect(() => {
    if (isAnswered) {
      startCall();
    }
  }, [isAnswered, startCall]);

  // Duration timer
  useEffect(() => {
    let timer;
    if (callStatus === 'Connected') {
      timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  // Auto-reject / Missed call timer for outgoing call
  useEffect(() => {
    if (!isIncoming && callStatus === 'Calling...') {
      const timeout = setTimeout(() => {
        setCallStatus('No answer');
        setTimeout(() => {
          endCall(true);
        }, 2000);
      }, 30000); // 30 seconds
      return () => clearTimeout(timeout);
    }
  }, [isIncoming, callStatus, endCall]);

  // Auto-missed call timer for incoming call
  useEffect(() => {
    if (isIncoming && !isAnswered && callStatus === 'Incoming...') {
      const timeout = setTimeout(() => {
        handleReject();
      }, 30000); // 30 seconds
      return () => clearTimeout(timeout);
    }
  }, [isIncoming, isAnswered, callStatus]);

  // Final unmount cleanup
  useEffect(() => {
    return () => {
      stopMedia();
    };
  }, [stopMedia]);

  // Handle tab/window close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!hasEndedRef.current && remoteUser?.userId) {
        socket.emit('call-end', {
          to: remoteUser.userId,
          callData: {
            callerId: isIncoming ? remoteUser.userId : (currentUser?.userId || ''),
            receiverId: isIncoming ? (currentUser?.userId || '') : remoteUser.userId,
            type: typeRef.current,
            status: 'missed',
            duration: callDurationRef.current,
            startedAt: new Date(Date.now() - callDurationRef.current * 1000).toISOString()
          }
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [remoteUser?.userId, isIncoming, currentUser]);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div className="fixed inset-0 bg-[#0b141a]/95 flex items-center justify-center z-[3000] backdrop-blur-md animate-overlay-fade">
      <div className="relative w-full max-w-[480px] h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col justify-between p-8 overflow-hidden shadow-2xl animate-modal-appear">
        <div className="flex flex-col items-center justify-center flex-1">
          {type === 'video' ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover rounded-3xl" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-whatsapp-green to-whatsapp-teal flex items-center justify-center font-bold text-white text-4xl shadow-lg animate-pulse mb-6 select-none">
              {(remoteUser?.username || remoteUser?.name || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="text-2xl font-bold text-white mb-2 z-10">{remoteUser?.username || remoteUser?.name || "Unknown User"}</h2>
          <div className="text-sm text-zinc-400 font-medium z-10">
            {callStatus === 'Connected' ? formatTime(callDuration) : callStatus}
          </div>
        </div>

        {isAnswered && type === 'video' && (
          <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-24 right-6 w-28 h-36 bg-black border border-zinc-700 rounded-xl object-cover shadow-md z-20" />
        )}

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
                className={`w-12 h-12 rounded-full border-none flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition shadow-lg ${isMicMuted ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`} 
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
              {type === 'video' && (
                <button 
                  className={`w-12 h-12 rounded-full border-none flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition shadow-lg ${isVideoOff ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`} 
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
      </div>
    </div>
  );
};

export default CallWindow;
