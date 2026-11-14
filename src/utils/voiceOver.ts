// VoiceOver system replaced by game arcade sounds to avoid robotic TTS
class VoiceOverSystem {
  public enabled: boolean = false;
  public speak(_text: string, options?: { onEnd?: () => void }) {
    if (options?.onEnd) options.onEnd();
  }
  public stop() {}
  public toggle() {
    return false;
  }
}

export const voiceOver = new VoiceOverSystem();
