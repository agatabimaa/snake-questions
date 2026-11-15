// Studio-Quality Human Voice Announcer (Real Recorded Neural Voice Audio Files)

type SubtitleListener = (text: string | null) => void;

interface VoiceClip {
  id: string;
  text: string;
  file: string;
}

const CLIPS: Record<string, VoiceClip[]> = {
  TURN: [
    { id: 'turn_1', text: 'Ayo, giliran kamu!', file: '/audio/voices/turn_1.mp3' },
    { id: 'turn_2', text: 'Giliran kamu nih, kocok dadunya!', file: '/audio/voices/turn_2.mp3' },
    { id: 'turn_3', text: 'Yuk giliran kamu melangkah!', file: '/audio/voices/turn_3.mp3' },
  ],
  DICE_1: [
    { id: 'dice_1', text: 'Satu! Pelan-pelan asal pasti.', file: '/audio/voices/dice_1.mp3' },
    { id: 'dice_1_short', text: 'Satu!', file: '/audio/voices/dice_1_short.mp3' },
  ],
  DICE_2: [
    { id: 'dice_2', text: 'Dua! Melangkah berdua!', file: '/audio/voices/dice_2.mp3' },
    { id: 'dice_2_short', text: 'Dua!', file: '/audio/voices/dice_2_short.mp3' },
  ],
  DICE_3: [
    { id: 'dice_3', text: 'Tiga! Asyik meluncur!', file: '/audio/voices/dice_3.mp3' },
    { id: 'dice_3_short', text: 'Tiga!', file: '/audio/voices/dice_3_short.mp3' },
  ],
  DICE_4: [
    { id: 'dice_4', text: 'Empat! Makin dekat nih!', file: '/audio/voices/dice_4.mp3' },
    { id: 'dice_4_short', text: 'Empat!', file: '/audio/voices/dice_4_short.mp3' },
  ],
  DICE_5: [
    { id: 'dice_5', text: 'Lima! Dikit lagi sampai!', file: '/audio/voices/dice_5.mp3' },
    { id: 'dice_5_short', text: 'Lima!', file: '/audio/voices/dice_5_short.mp3' },
  ],
  DICE_6: [
    { id: 'dice_6', text: 'Enam! Hoki banget! Yeay!', file: '/audio/voices/dice_6.mp3' },
    { id: 'dice_6_short', text: 'Enam! Mantap jiwa!', file: '/audio/voices/dice_6_short.mp3' },
  ],
  LADDER: [
    { id: 'ladder_1', text: 'Wah, naik tangga nih! Asyik banget!', file: '/audio/voices/ladder_1.mp3' },
    { id: 'ladder_2', text: 'Mantap, melesat naik ke atas!', file: '/audio/voices/ladder_2.mp3' },
    { id: 'ladder_3', text: 'Rezeki anak baik, naik tangga cinta!', file: '/audio/voices/ladder_3.mp3' },
  ],
  SNAKE: [
    { id: 'snake_1', text: 'Kasian, prosotan pakai ular deh! Hehehe.', file: '/audio/voices/snake_1.mp3' },
    { id: 'snake_2', text: 'Yaaah, digigit ular manja, turun deh!', file: '/audio/voices/snake_2.mp3' },
    { id: 'snake_3', text: 'Aduh kena ular, sabar ya sayang!', file: '/audio/voices/snake_3.mp3' },
  ],
  QUESTION_GIRL: [
    { id: 'girl_1', text: 'Pertanyaan khusus buat si cewek nih! Jawab jujur ya!', file: '/audio/voices/girl_1.mp3' },
    { id: 'girl_2', text: 'Yuk, si cewek yang cerita! Didengerin baik-baik ya!', file: '/audio/voices/girl_2.mp3' },
  ],
  QUESTION_BOY: [
    { id: 'boy_1', text: 'Nah, pertanyaan khusus buat si cowok nih! Jangan ngeles ya!', file: '/audio/voices/boy_1.mp3' },
    { id: 'boy_2', text: 'Giliran si cowok yang buka suara! Cerita yang jujur ya!', file: '/audio/voices/boy_2.mp3' },
  ],
  QUESTION_DEEPTALK: [
    { id: 'question_1', text: 'Saatnya deep talk berdua!', file: '/audio/voices/question_1.mp3' },
    { id: 'question_2', text: 'Wah, ada pertanyaan seru nih!', file: '/audio/voices/question_2.mp3' },
    { id: 'deeptalk_2', text: 'Yuk, ngobrol dari hati ke hati berdua!', file: '/audio/voices/deeptalk_2.mp3' },
  ],
  QUESTION: [
    { id: 'question_1', text: 'Saatnya deep talk berdua!', file: '/audio/voices/question_1.mp3' },
    { id: 'question_2', text: 'Wah, ada pertanyaan seru nih!', file: '/audio/voices/question_2.mp3' },
  ],
  DARE: [
    { id: 'dare_1', text: 'Cieee, ada aksi manis nih! Lakukan ya!', file: '/audio/voices/dare_1.mp3' },
  ],
  VICTORY: [
    { id: 'victory_1', text: 'Horeee! Selamat kamu menang! Cinta kalian berdua luar biasa!', file: '/audio/voices/victory_1.mp3' },
  ],
};

class HumanAnnouncer {
  public enabled: boolean = true;
  private currentAudio: HTMLAudioElement | null = null;
  private listeners: SubtitleListener[] = [];
  private subtitleTimer: any = null;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    // Preload common audio files in browser
    if (typeof window !== 'undefined') {
      try {
        Object.values(CLIPS).forEach((group) => {
          group.forEach((clip) => {
            const audio = new Audio();
            audio.src = clip.file;
            audio.preload = 'auto';
            this.audioCache.set(clip.file, audio);
          });
        });
      } catch (e) {}
    }
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

  // Play natural human voice audio clip
  private playClip(clip: VoiceClip, options?: { onEnd?: () => void }) {
    this.showSubtitle(clip.text);

    if (!this.enabled || typeof window === 'undefined') {
      if (options?.onEnd) options.onEnd();
      return;
    }

    try {
      // Stop ongoing voice
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }

      let audio = this.audioCache.get(clip.file);
      if (!audio) {
        audio = new Audio(clip.file);
        this.audioCache.set(clip.file, audio);
      }

      this.currentAudio = audio;
      audio.currentTime = 0;
      audio.volume = 1.0;

      audio.onended = () => {
        if (options?.onEnd) options.onEnd();
      };

      audio.onerror = () => {
        if (options?.onEnd) options.onEnd();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          // Auto-play policy or file error
          if (options?.onEnd) options.onEnd();
        });
      }
    } catch (e) {
      if (options?.onEnd) options.onEnd();
    }
  }

  public stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
    }
    this.listeners.forEach((fn) => fn(null));
  }

  // 1. ANNOUNCE TURN: "Ayo giliran kamu!"
  public announceTurn(_playerName?: string) {
    const list = CLIPS.TURN;
    const picked = list[Math.floor(Math.random() * list.length)];
    this.playClip(picked);
  }

  // 2. ANNOUNCE DICE: "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam"
  public announceDice(val: number) {
    const key = `DICE_${val}`;
    const list = CLIPS[key] || CLIPS.DICE_1;
    const picked = list[Math.floor(Math.random() * list.length)];
    this.playClip(picked);
  }

  // 3. ANNOUNCE LADDER: "Wah, naik tangga nih!"
  public announceLadder(_playerName?: string) {
    const list = CLIPS.LADDER;
    const picked = list[Math.floor(Math.random() * list.length)];
    this.playClip(picked);
  }

  // 4. ANNOUNCE SNAKE: "Kasian, prosotan pakai ular deh!"
  public announceSnake(_playerName?: string) {
    const list = CLIPS.SNAKE;
    const picked = list[Math.floor(Math.random() * list.length)];
    this.playClip(picked);
  }

  // 5a. ANNOUNCE GIRL QUESTION
  public announceGirlQuestion() {
    const list = CLIPS.QUESTION_GIRL;
    const picked = list[Math.floor(Math.random() * list.length)];
    this.playClip(picked);
  }

  // 5b. ANNOUNCE BOY QUESTION
  public announceBoyQuestion() {
    const list = CLIPS.QUESTION_BOY;
    const picked = list[Math.floor(Math.random() * list.length)];
    this.playClip(picked);
  }

  // 5c. ANNOUNCE DEEPTALK QUESTION
  public announceDeeptalkQuestion() {
    const list = CLIPS.QUESTION_DEEPTALK;
    const picked = list[Math.floor(Math.random() * list.length)];
    this.playClip(picked);
  }

  // Generic fallback
  public announceQuestion() {
    this.announceDeeptalkQuestion();
  }

  // 6. ANNOUNCE DARE: "Cieee, ada aksi manis nih!"
  public announceDare() {
    const list = CLIPS.DARE;
    const picked = list[Math.floor(Math.random() * list.length)];
    this.playClip(picked);
  }

  // 7. ANNOUNCE VICTORY
  public announceVictory(_winnerName?: string) {
    const list = CLIPS.VICTORY;
    const picked = list[Math.floor(Math.random() * list.length)];
    this.playClip(picked);
  }
}

export const announcer = new HumanAnnouncer();
