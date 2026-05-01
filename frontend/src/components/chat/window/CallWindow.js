import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CallWindow.css';
import socket from '../../../socket';

const CallWindow = ({ remoteUser, type, onEndCall, isIncoming, initialOffer }) => {
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState(isIncoming ? 'Incoming...' : 'Calling...');
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pc = useRef(null);

  const stopMedia = useCallback(() => {
    localStream?.getTracks().forEach(track => track.stop());
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
  }, [localStream]);

  const startCall = useCallback(async () => {
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
          } else if (pc.current?.connectionState === 'failed') {
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

      socket.on('call-answer', async ({ answer }) => {
        if (pc.current?.signalingState !== 'closed') {
          await pc.current?.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      socket.on('call-candidate', async ({ candidate }) => {
        if (pc.current?.signalingState !== 'closed') {
          await pc.current?.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

      return () => { isCancelled = true; };
    } catch (err) {
      console.error("Call Error:", err);
      onEndCall();
    }
  }, [remoteUser.userId, type, isIncoming, initialOffer, onEndCall]);

  useEffect(() => {
    let timer;
    if (callStatus === 'Connected') {
      timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  useEffect(() => {
    startCall();
    return () => stopMedia();
  }, [startCall, stopMedia]);

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

        <video ref={localVideoRef} autoPlay playsInline muted className="local-video-preview" />

        <div className="call-controls">
          <button className="control-btn" onClick={() => localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled}>🎤</button>
          <button className="control-btn hangup" onClick={onEndCall}>📞</button>
        </div>
      </div>
    </div>
  );
};

export default CallWindow;
