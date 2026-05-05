import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CallWindow.css';
import socket from '../../../socket';

const CallWindow = ({ remoteUser, type, onEndCall, isIncoming, initialOffer }) => {
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState(isIncoming ? 'Incoming...' : 'Calling...');
  const [isAnswered, setIsAnswered] = useState(!isIncoming);
  const [localStream, setLocalStream] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const hasEndedRef = useRef(false);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pc = useRef(null);
  const ringtoneRef = useRef(null);

  const stopMedia = useCallback(() => {
    localStream?.getTracks().forEach(track => track.stop());
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
  }, [localStream]);

  const endCall = useCallback((emitCallEnd = true) => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    setHasEnded(true);

    if (emitCallEnd && remoteUser?.userId) {
      socket.emit('call-end', { to: remoteUser.userId });
    }

    stopMedia();
    onEndCall();
  }, [remoteUser, onEndCall, stopMedia]);

  const handleAnswer = () => {
    setIsAnswered(true);
    setCallStatus('Connecting...');
  };

  const handleReject = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }

    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    setHasEnded(true);
    socket.emit('call-reject', { to: remoteUser.userId });
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

  const startCall = useCallback(async () => {
    if (!isAnswered) return;

    let isCancelled = false;
    try {
      if (!pc.current) {
        pc.current = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });
      if (isCancelled) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      
      if (pc.current?.signalingState !== 'closed') {
        stream.getTracks().forEach(track => pc.current?.addTrack(track, stream));
      }

      if (pc.current) {
        pc.current.onconnectionstatechange = () => {
          if (pc.current?.connectionState === 'connected') {
            setCallStatus('Connected');
          } else if (pc.current?.connectionState === 'failed' || pc.current?.connectionState === 'disconnected') {
            onEndCall();
          }
        };

        pc.current.onicecandidate = (e) => {
          if (e.candidate && pc.current?.signalingState !== 'closed') {
            socket.emit('call-candidate', { to: remoteUser.userId, candidate: e.candidate });
          }
        };

        pc.current.ontrack = (e) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
        };
      }

      if (isIncoming && initialOffer) {
        if (pc.current?.signalingState !== 'closed') {
          await pc.current?.setRemoteDescription(new RTCSessionDescription(initialOffer));
          const answer = await pc.current?.createAnswer();
          await pc.current?.setLocalDescription(answer);
          socket.emit('call-answer', { to: remoteUser.userId, answer });
        }
      } else {
        if (pc.current?.signalingState !== 'closed') {
          const offer = await pc.current?.createOffer();
          await pc.current?.setLocalDescription(offer);
          socket.emit('call-offer', { to: remoteUser.userId, offer, type });
        }
      }

      // Signaling listeners
      socket.on('call-answer', async ({ answer }) => {
        if (pc.current && pc.current.signalingState !== 'closed') {
          try {
            await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
          } catch (e) {
            console.error("Error setting remote description:", e);
          }
        }
      });

      socket.on('call-candidate', async ({ candidate }) => {
        if (pc.current && pc.current.signalingState !== 'closed' && candidate) {
          try {
            await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error("Error adding ICE candidate:", e);
          }
        }
      });

      socket.on('call-end', () => {
        setCallStatus('Call ended');
        endCall(false);
      });

      socket.on('call-reject', () => {
        setCallStatus('Rejected');
        setTimeout(() => endCall(false), 1200);
      });

      return () => {
        isCancelled = true;
        socket.off('call-answer');
        socket.off('call-candidate');
        socket.off('call-end');
        socket.off('call-reject');
      };
    } catch (err) {
      console.error("Call Error:", err);
      setCallStatus('Error');
      setTimeout(onEndCall, 2000);
    }
  }, [remoteUser.userId, type, isIncoming, initialOffer, onEndCall, isAnswered]);

  useEffect(() => {
    let timer;
    if (callStatus === 'Connected') {
      timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  useEffect(() => {
    const cleanup = startCall();
    return () => {
      if (typeof cleanup === 'function') cleanup();
      if (!hasEndedRef.current && remoteUser?.userId) {
        socket.emit('call-end', { to: remoteUser.userId });
        hasEndedRef.current = true;
      }
      stopMedia();
    };
  }, [startCall, stopMedia, remoteUser.userId]);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div className="call-overlay">
      <div className="call-container">
        <div className="call-main">
          {type === 'video' ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
          ) : (
            <div className="call-user-avatar">{remoteUser?.username?.charAt(0)}</div>
          )}
          <h2 className="call-username">{remoteUser?.username}</h2>
          <div className="call-status">
            {callStatus === 'Connected' ? formatTime(callDuration) : callStatus}
          </div>
        </div>

        {isAnswered && (
          <video ref={localVideoRef} autoPlay playsInline muted className="local-video-preview" />
        )}

        <div className="call-controls">
          {!isAnswered ? (
            <>
              <button className="control-btn answer" onClick={handleAnswer}>📞</button>
              <button className="control-btn reject" onClick={handleReject}>🚫</button>
            </>
          ) : (
            <>
              <button className={`control-btn ${isMicMuted ? 'muted' : ''}`} onClick={toggleMic}>
                {isMicMuted ? '🔇' : '🎤'}
              </button>
              {type === 'video' && (
                <button className={`control-btn ${isVideoOff ? 'muted' : ''}`} onClick={toggleVideo}>
                  {isVideoOff ? '🚫📷' : '📷'}
                </button>
              )}
              <button className="control-btn hangup" onClick={() => endCall(true)}>📞</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallWindow;
