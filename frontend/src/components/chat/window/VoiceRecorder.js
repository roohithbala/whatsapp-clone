import React from 'react';

const VoiceRecorder = ({ isRecording, recordingTime, onStop, onCancel }) => {
  if (!isRecording) return null;

  return (
    <div className="voice-recorder-overlay">
      <div className="recording-indicator">Recording {recordingTime}s</div>
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onStop}>Stop & Send</button>
    </div>
  );
};

export default VoiceRecorder;
