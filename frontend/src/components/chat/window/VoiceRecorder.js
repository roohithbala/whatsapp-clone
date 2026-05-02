import React, { useState, useEffect, useRef } from 'react';

const VoiceRecorder = ({ onStop, onCancel }) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const timerId = useRef(null);

  useEffect(() => {
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        audioChunks.current = [];

        mediaRecorder.current.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunks.current.push(e.data);
        };

        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          onStop(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.current.start();
        timerId.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } catch (err) {
        console.error("Mic access denied", err);
        alert("Could not access microphone");
        onCancel();
      }
    };

    startRecording();

    return () => {
      if (timerId.current) clearInterval(timerId.current);
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.stop();
      }
    };
  }, [onCancel, onStop]);

  return (
    <div className="voice-recorder-bar">
      <div className="recording-dot"></div>
      <div className="recording-timer">
        {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
      </div>
      <button className="voice-cancel-btn" onClick={onCancel}>✕</button>
      <button className="voice-stop-btn" onClick={() => mediaRecorder.current.stop()}>✔</button>
    </div>
  );
};

export default VoiceRecorder;
