// Web Speech API Voice Over (Bahasa Indonesia) - Tanpa perlu file audio besar eksternal
class VoiceOverSystem {
  public enabled: boolean = true;
  private voice: SpeechSynthesisVoice | null = null;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.isSupported = true;
      this.initVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  private initVoice() {
    if (!this.isSupported) return;
    const voices = window.speechSynthesis.getVoices();
    // Prioritize Indonesian voice (Google Bahasa Indonesia, Microsoft Gadis, Apple Damayanti, etc.)
    const idVoice = voices.find(
      (v) => v.lang.includes('id') || v.lang.includes('ID') || v.lang.toLowerCase().includes('indonesia')
    );
    this.voice = idVoice || null;
  }

  // Speak text with expressive cadence
  public speak(text: string, options?: { rate?: number; pitch?: number; onEnd?: () => void }) {
    if (!this.enabled || !this.isSupported) return;

    try {
      window.speechSynthesis.cancel(); // cancel previous speech

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.lang = 'id-ID';
      utterance.rate = options?.rate || 1.05; // slightly upbeat
      utterance.pitch = options?.pitch || 1.1; // friendly, warm pitch

      if (options?.onEnd) {
        utterance.onend = options.onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  public stop() {
    if (this.isSupported) {
      window.speechSynthesis.cancel();
    }
  }

  // Voice over for dice rolls ala MainWarga62
  public speakDiceRoll(value: number, power: number) {
    if (!this.enabled) return;

    const commentaries: Record<number, string[]> = {
      1: [
        'Aduh, dadu satu! Pelan-pelan asal selamat ya.',
        'Kocokan santai! Cuma geser satu petak nih.',
        'Dadu satu! Santai dulu, jangan buru-buru.',
      ],
      2: [
        'Dadu dua! Melangkah pelan penuh cinta.',
        'Dua petak! Terus maju bersama pasangan.',
      ],
      3: [
        'Dadu tiga! Lumayan, melangkah mantap.',
        'Tiga langkah ke depan! Siap-siap ya.',
      ],
      4: [
        'Dadu empat! Langkah yang pas di hati.',
        'Empat petak! Suasana makin seru nih.',
      ],
      5: [
        'Dadu lima! Kencang juga kocokannya!',
        'Wah, lima langkah sekaligus! Mantap.',
      ],
      6: [
        'Hoki maksimal! Dadu enam meluncur kencang!',
        'Sultan boss! Dadu enam mendarat sempurna!',
        'Keren banget! Dadu enam, siap-siap buka hati!',
      ],
    };

    const list = commentaries[value] || [`Dadu ${value}!`];
    const text = list[Math.floor(Math.random() * list.length)];
    this.speak(text, { rate: 1.1, pitch: 1.15 });
  }

  // Voice over for landing on special tiles
  public speakTileEvent(type: string, target?: number) {
    if (!this.enabled) return;

    switch (type) {
      case 'LADDER':
        this.speak(
          `Ciyee, dapat tangga cinta! Naik ke petak ${target}. Saatnya berikan apresiasi terbaik untuk pasanganmu!`,
          { rate: 1.05, pitch: 1.2 }
        );
        break;
      case 'SNAKE':
        this.speak(
          `Yaaah, kepeleset ular manja! Meluncur turun ke petak ${target}. Tenang, ini saatnya melunakkan ego berdua.`,
          { rate: 1.0, pitch: 1.05 }
        );
        break;
      case 'BOY':
        this.speak(
          'Petak biru! Pertanyaan khusus cowok. Buka hatimu, sampaikan apa yang sebenarnya kamu rasakan.',
          { rate: 1.05, pitch: 1.1 }
        );
        break;
      case 'GIRL':
        this.speak(
          'Petak pink! Pertanyaan khusus cewek. Waktunya mengungkapkan apa yang paling kamu butuhkan.',
          { rate: 1.05, pitch: 1.15 }
        );
        break;
      case 'DEEPTALK':
        this.speak(
          'Waduh, petak ungu! Saatnya deep talk berdua tentang hubungan dan masa depan kalian.',
          { rate: 1.0, pitch: 1.1 }
        );
        break;
      case 'ACTION':
        this.speak(
          'Love dare! Ada tantangan manis yang harus kamu lakukan sekarang juga!',
          { rate: 1.1, pitch: 1.2 }
        );
        break;
      case 'FINISH':
        this.speak(
          'Selamat! Kalian berhasil mencapai garis akhir Love Milestone! Hubungan kalian luar biasa!',
          { rate: 1.05, pitch: 1.2 }
        );
        break;
    }
  }

  // Read full question text
  public speakQuestionText(title: string, question: string) {
    if (!this.enabled) return;
    this.speak(`Pertanyaan: ${title}. ${question}`, { rate: 1.0, pitch: 1.05 });
  }
}

export const voiceOver = new VoiceOverSystem();
