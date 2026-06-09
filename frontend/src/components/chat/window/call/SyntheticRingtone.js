export default class SyntheticRingtone {
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
        if (!this.audioCtx || this.audioCtx.state === "closed") return;
        
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

    osc1.type = "sine";
    osc1.frequency.value = freq1;
    
    osc2.type = "sine";
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
