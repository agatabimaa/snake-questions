// Rich Arcade Game Sound Effects (No robotic TTS - 100% Fun Game Atmosphere)
class SoundSystem {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public bgmEnabled: boolean = true; // Default ON as requested
  private bgmInterval: any = null;

  constructor() {
    // Automatically start relaxing music on the very first user touch or click
    if (typeof window !== 'undefined') {
      const autoStartBgm = () => {
        if (this.bgmEnabled && !this.bgmInterval) {
          this.init();
          this.startGentleChords();
        }
        window.removeEventListener('click', autoStartBgm);
        window.removeEventListener('touchstart', autoStartBgm);
        window.removeEventListener('pointerdown', autoStartBgm);
      };
      window.addEventListener('click', autoStartBgm, { passive: true });
      window.addEventListener('touchstart', autoStartBgm, { passive: true });
      window.addEventListener('pointerdown', autoStartBgm, { passive: true });
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Tactile click
  public playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  // Tactile dice cup shake while holding button
  public playDiceShake() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + i * 0.035;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(160 + Math.random() * 220, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.025);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.03);
      }
    } catch (e) {}
  }

  // Dice tumbling roll that slows down
  public playDiceTumble(progress: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch lowers as dice decelerates
      const freq = 420 - progress * 240 + (Math.random() * 40 - 20);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15 + (1 - progress) * 0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  // Final dice landing thud / impact
  public playDiceLand(val: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Low thud
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);

      // Chime if high roll (5 or 6)
      if (val >= 5) {
        setTimeout(() => {
          this.playFanfareMini();
        }, 80);
      }
    } catch (e) {}
  }

  // Mini celebratory chime for high roll
  private playFanfareMini() {
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = this.ctx!.currentTime + i * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.2);
      });
    } catch (e) {}
  }

  // Juicy cartoon pawn hop sound
  public playPawnHop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.09);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  // Tangga Cinta - Triumphant ascending harmonic scale
  public playLadderClimb() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25]; // C, E, G, C, E
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + idx * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.24);
      });
    } catch (e) {}
  }

  // Ular Manja - Cartoon sliding whistle down
  public playSnakeSlide() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.45);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.46);
    } catch (e) {}
  }

  // Dramatic card modal pop-up sound
  public playModalPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.17);
    } catch (e) {}
  }

  // Victory fanfare
  public playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const melody = [
        { f: 523.25, d: 0.15 },
        { f: 659.25, d: 0.15 },
        { f: 783.99, d: 0.18 },
        { f: 1046.5, d: 0.45 },
      ];
      let t = this.ctx.currentTime;

      melody.forEach((note) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + note.d);
        t += note.d * 0.85;
      });
    } catch (e) {}
  }

  // Relaxing acoustic chord loop toggle
  public toggleBGM(): boolean {
    this.init();
    this.bgmEnabled = !this.bgmEnabled;

    if (this.bgmEnabled) {
      this.startGentleChords();
    } else {
      this.stopGentleChords();
    }
    return this.bgmEnabled;
  }

  public startBGM() {
    this.bgmEnabled = true;
    this.init();
    if (!this.bgmInterval) {
      this.startGentleChords();
    }
  }

  private startGentleChords() {
    if (this.bgmInterval) clearInterval(this.bgmInterval);
    // Soothing Lofi / Acoustic chords for couples (Cmaj7, Am9, Fmaj7, G7sus4)
    const chords = [
      [130.81, 261.63, 329.63, 392.0, 493.88], // Cmaj7 (C3, C4, E4, G4, B4)
      [110.0, 220.0, 261.63, 329.63, 493.88],  // Am9 (A2, A3, C4, E4, B4)
      [87.31, 174.61, 220.0, 261.63, 329.63],   // Fmaj7 (F2, F3, A3, C4, E4)
      [98.0, 196.0, 261.63, 293.66, 392.0],     // Gsus4/G (G2, G3, C4, D4, G4)
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.bgmEnabled || !this.ctx) return;
      try {
        const chord = chords[chordIdx % chords.length];
        chordIdx++;
        const now = this.ctx.currentTime;

        chord.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);

          // Soft attack and long gentle resonance
          gain.gain.setValueAtTime(0.001, now + idx * 0.04);
          gain.gain.linearRampToValueAtTime(0.025, now + idx * 0.04 + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.04 + 3.4);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 3.5);
        });
      } catch (e) {}
    };

    playChord();
    this.bgmInterval = setInterval(playChord, 3600);
  }

  private stopGentleChords() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const sound = new SoundSystem();
