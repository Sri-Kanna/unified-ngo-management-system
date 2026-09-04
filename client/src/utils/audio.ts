// Web Audio API synthesized sounds for high-tech futuristic feedback.
// Ensures zero latency and no external network request/audio asset hosting.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(state?: boolean) {
    this.enabled = state !== undefined ? state : !this.enabled;
    localStorage.setItem('ui_sounds_enabled', String(this.enabled));
    return this.enabled;
  }

  public isEnabled() {
    const saved = localStorage.getItem('ui_sounds_enabled');
    if (saved !== null) {
      this.enabled = saved === 'true';
    }
    return this.enabled;
  }

  public playHover() {
    if (!this.isEnabled()) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  }

  public playClick() {
    if (!this.isEnabled()) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  }

  public playIncoming() {
    if (!this.isEnabled()) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Soft synth blip for chatbot messages
      const now = this.ctx.currentTime;
      const playTone = (time: number, freq: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.02, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
        osc.start(time);
        osc.stop(time + 0.08);
      };

      playTone(now, 523.25); // C5
      playTone(now + 0.06, 659.25); // E5
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  }

  public playVoiceStart() {
    if (!this.isEnabled()) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  }
}

export const soundEngine = new SoundEngine();
