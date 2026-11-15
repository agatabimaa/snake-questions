// Game Announcer & Voice Over with lively varied intonations (Indonesian Arcade Style)

type SubtitleListener = (text: string | null) => void;

class GameAnnouncer {
  public enabled: boolean = true;
  private currentVoice: SpeechSynthesisVoice | null = null;
  private listeners: SubtitleListener[] = [];
  private subtitleTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  private initVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();

    // Prioritize natural Indonesian voices
    // Examples: Google Bahasa Indonesia, Microsoft Gadis Online (Natural), Microsoft Ardi, Apple Damayanti
    const bestIndonesian = voices.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      return (
        (lang.includes('id-id') || lang.includes('id_id') || lang === 'id') &&
        (name.includes('natural') || name.includes('google') || name.includes('gadis') || name.includes('ardi'))
      );
    }) || voices.find((v) => {
      const lang = v.lang.toLowerCase();
      return lang.includes('id-id') || lang.includes('id_id') || lang === 'id' || v.name.toLowerCase().includes('indonesia');
    });

    this.currentVoice = bestIndonesian || null;
  }

  public subscribeSubtitle(fn: SubtitleListener) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private showSubtitle(text: string) {
    if (this.subtitleTimer) clearTimeout(this.subtitleTimer);
    this.listeners.forEach((fn) => fn(text));
    this.subtitleTimer = setTimeout(() => {
      this.listeners.forEach((fn) => fn(null));
    }, 3200);
  }

  // Core speak method with varied intonation and micro-jitter for organic speech
  public speak(
    text: string,
    options?: {
      pitch?: number;
      rate?: number;
      volume?: number;
      onEnd?: () => void;
      skipSubtitle?: boolean;
    }
  ) {
    if (!options?.skipSubtitle) {
      this.showSubtitle(text);
    }

    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.currentVoice) {
        utterance.voice = this.currentVoice;
      }
      utterance.lang = 'id-ID';

      // Varied intonation with micro-jitter
      const basePitch = options?.pitch ?? 1.1;
      const baseRate = options?.rate ?? 1.05;
      const pitchJitter = (Math.random() * 0.08 - 0.04);
      const rateJitter = (Math.random() * 0.06 - 0.03);

      utterance.pitch = Math.max(0.5, Math.min(2.0, basePitch + pitchJitter));
      utterance.rate = Math.max(0.5, Math.min(1.8, baseRate + rateJitter));
      utterance.volume = options?.volume ?? 1.0;

      if (options?.onEnd) {
        utterance.onend = options.onEnd;
        utterance.onerror = options.onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Announcer speech synthesis error:', e);
      if (options?.onEnd) options.onEnd();
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    this.listeners.forEach((fn) => fn(null));
  }

  // 1. ANNOUNCE TURN: "Ayo giliran kamu!", "Giliran kamu nih!"
  public announceTurn(playerName?: string) {
    const lines = [
      'Ayo, giliran kamu!',
      'Giliran kamu nih, kocok dadunya!',
      'Yuk giliran kamu melangkah!',
      playerName ? `Saatnya giliran ${playerName}!` : 'Giliran kamu nih, buktikan hokimu!',
      playerName ? `Ayo ${playerName}, lempar dadunya!` : 'Ayo lempar dadunya!',
    ];
    const picked = lines[Math.floor(Math.random() * lines.length)];
    this.speak(picked, { pitch: 1.18, rate: 1.08 });
  }

  // 2. ANNOUNCE DICE NUMBER: 1 to 6 with expressive commentary
  public announceDice(val: number) {
    const diceReactions: Record<number, string[]> = {
      1: [
        'Satu! Pelan-pelan asal pasti!',
        'Satu! Santai dulu yaa.',
        'Satu! Yang penting maju bersama.',
        'Dapat satu! Tetap semangat!',
      ],
      2: [
        'Dua! Melangkah berdua!',
        'Dua! Asyik, jalan berdua!',
        'Dua! Mantap melangkah!',
        'Dapat dua!',
      ],
      3: [
        'Tiga! Asyik meluncur!',
        'Tiga! Melangkah mantap!',
        'Tiga! Terus maju!',
        'Dapat tiga! Keren!',
      ],
      4: [
        'Empat! Makin dekat nih!',
        'Empat! Keren banget!',
        'Empat! Melangkah pasti!',
        'Dapat empat!',
      ],
      5: [
        'Lima! Dikit lagi sampai!',
        'Lima! Cepat banget melesat!',
        'Lima! Mantap jiwa!',
        'Dapat lima! Hoki nih!',
      ],
      6: [
        'Enam! Hoki banget! Yeay!',
        'Enam! Mantap jiwa!',
        'Wah, enam! Rezeki anak baik!',
        'Enam! Hoki maksimal!',
        'Dapat enam! Keren abis!',
      ],
    };

    const choices = diceReactions[val] || [`Dadu ${val}!`];
    const picked = choices[Math.floor(Math.random() * choices.length)];

    // Higher pitch and energy for higher rolls!
    const pitch = 1.0 + (val - 1) * 0.05;
    const rate = 1.02 + (val - 1) * 0.02;

    this.speak(picked, { pitch, rate });
  }

  // 3. ANNOUNCE LADDER: "Wah, naik tangga nih!"
  public announceLadder(_playerName?: string) {
    const lines = [
      'Wah, naik tangga nih! Asyik banget!',
      'Mantap! Melesat naik ke atas!',
      'Rezeki anak baik, naik tangga cinta!',
      'Yeay! Jalan tol ke atas, keren!',
      'Wah, naik tangga! Terbang tinggi!',
      'Asyik naik tangga, makin dekat finish!',
    ];
    const picked = lines[Math.floor(Math.random() * lines.length)];
    this.speak(picked, { pitch: 1.28, rate: 1.12 });
  }

  // 4. ANNOUNCE SNAKE: "Kasian, prosotan pakai ular!"
  public announceSnake(_playerName?: string) {
    const lines = [
      'Kasian... prosotan pakai ular deh! Hehehe.',
      'Yaaah... digigit ular manja, turun dulu yaa!',
      'Aduh, kepeleset ular! Sabar ya sayang!',
      'Oopps! Meluncur ke bawah dulu, jangan sedih ya!',
      'Waduh kena ular! Kasian prosotan!',
      'Kasian prosotan pakai ular! Nanti naik lagi yaa!',
    ];
    const picked = lines[Math.floor(Math.random() * lines.length)];
    // Playful, cute, empathetic cadence
    this.speak(picked, { pitch: 0.98, rate: 1.0 });
  }

  // 5. ANNOUNCE QUESTION CARD
  public announceQuestion() {
    const lines = [
      'Saatnya deep talk berdua!',
      'Wah, ada pertanyaan seru nih!',
      'Jawab jujur dari hati yaa!',
      'Pertanyaan cinta, dengarkan baik-baik!',
      'Waktunya saling membuka hati!',
    ];
    const picked = lines[Math.floor(Math.random() * lines.length)];
    this.speak(picked, { pitch: 1.12, rate: 1.04 });
  }

  // 6. ANNOUNCE DARE CARD
  public announceDare() {
    const lines = [
      'Cieee, ada aksi manis nih!',
      'Tantangan cinta! Wajib dilakukan yaa!',
      'Saatnya buktikan cintamu!',
      'Aksi manis khusus buat kamu!',
    ];
    const picked = lines[Math.floor(Math.random() * lines.length)];
    this.speak(picked, { pitch: 1.2, rate: 1.08 });
  }

  // 7. ANNOUNCE VICTORY
  public announceVictory(winnerName: string) {
    const lines = [
      `Horeee! Selamat ${winnerName} jadi pemenangnya! Cinta kalian luar biasa!`,
      `Yeaaay! Finish tercapai! Kalian berdua pasangan paling serasi!`,
    ];
    const picked = lines[Math.floor(Math.random() * lines.length)];
    this.speak(picked, { pitch: 1.25, rate: 1.06 });
  }
}

export const announcer = new GameAnnouncer();
