import React, { useState, useEffect, useRef } from "react";

const BAR_COUNT = 24;

const VoiceRecorder = ({ onStop, onCancel }) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [amplitudes, setAmplitudes] = useState(Array(BAR_COUNT).fill(3));
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const timerId = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Web Audio API for waveform
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const drawBars = () => {
          analyser.getByteFrequencyData(dataArray);
          const bars = [];
          const step = Math.floor(dataArray.length / BAR_COUNT);
          for (let i = 0; i < BAR_COUNT; i++) {
            const value = dataArray[i * step] || 0;
            bars.push(Math.max(3, Math.round((value / 255) * 28)));
          }
          setAmplitudes(bars);
          animFrameRef.current = requestAnimationFrame(drawBars);
        };
        drawBars();

        mediaRecorder.current = new MediaRecorder(stream);
        audioChunks.current = [];

        mediaRecorder.current.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunks.current.push(e.data);
        };

        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
          onStop(audioBlob);
          stream.getTracks().forEach((t) => t.stop());
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
          audioCtx.close();
        };

        mediaRecorder.current.start();
        timerId.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
      } catch (err) {
        console.error("Mic access denied", err);
        onCancel();
      }
    };

    startRecording();

    return () => {
      if (timerId.current) clearInterval(timerId.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
        mediaRecorder.current.stop();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleSend = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
    }
  };

  const handleCancel = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      // Stop without sending
      mediaRecorder.current.ondataavailable = null;
      mediaRecorder.current.onstop = null;
      mediaRecorder.current.stop();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerId.current) clearInterval(timerId.current);
    }
    onCancel();
  };

  return (
    <div className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border-light)] px-3 py-1.5 rounded-full select-none ml-1 shrink-0 flex-1 max-w-[340px]">
      {/* Red pulse dot */}
      <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 animate-pulse" />

      {/* Timer */}
      <span className="text-xs font-bold text-red-400 font-mono tracking-wider shrink-0 w-9">
        {formatTime(recordingTime)}
      </span>

      {/* Waveform bars */}
      <div className="flex-1 flex items-center justify-center gap-[2px] h-8">
        {amplitudes.map((h, i) => (
          <div
            key={i}
            className="rounded-full bg-[var(--whatsapp-green)] transition-all duration-75"
            style={{ width: "2px", height: `${h}px`, opacity: 0.7 + (h / 28) * 0.3 }}
          />
        ))}
      </div>

      {/* Cancel */}
      <button
        className="w-7 h-7 rounded-full bg-transparent hover:bg-red-500/15 text-[var(--text-secondary)] border-none cursor-pointer transition flex items-center justify-center text-base"
        onClick={handleCancel}
        title="Cancel"
      >
        ✕
      </button>

      {/* Send */}
      <button
        className="w-8 h-8 rounded-full bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white border-none cursor-pointer transition flex items-center justify-center shadow-md"
        onClick={handleSend}
        title="Send voice message"
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  );
};

export default VoiceRecorder;
