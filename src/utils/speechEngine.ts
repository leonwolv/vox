import { PlaybackSettings, VoiceGender, VoiceItem } from '../types/tts';

// Virtual curated fallback voices matching the multi-engine SAPI/AVSpeech/SpeechDispatcher libraries
export const CURATED_VOICES: VoiceItem[] = [
  // Dutch
  { id: 'nl-claire-neural', name: 'Claire (Nederlands - Neuraal)', lang: 'nl-NL', gender: 'female', isNeural: true, engine: 'AVSpeech' },
  { id: 'nl-frank-sapi', name: 'Microsoft Frank (Nederlands - SAPI5)', lang: 'nl-NL', gender: 'male', isNeural: true, engine: 'SAPI 5' },
  { id: 'nl-fenna-sapi', name: 'Microsoft Fenna (Nederlands)', lang: 'nl-NL', gender: 'female', isNeural: true, engine: 'SAPI 5' },
  { id: 'nl-ruben-neural', name: 'Ruben (Nederlands - Kind/Jong)', lang: 'nl-NL', gender: 'child', isNeural: true, engine: 'Web Native' },
  { id: 'nl-piper-spd', name: 'Piper RDH (Nederlands - Linux)', lang: 'nl-NL', gender: 'male', isNeural: true, engine: 'Speech Dispatcher' },

  // English
  { id: 'en-jenny-neural', name: 'Jenny (English US - Neural)', lang: 'en-US', gender: 'female', isNeural: true, engine: 'SAPI 5' },
  { id: 'en-guy-neural', name: 'Guy (English US - Natural)', lang: 'en-US', gender: 'male', isNeural: true, engine: 'SAPI 5' },
  { id: 'en-sonia-uk', name: 'Sonia (English UK - Neural)', lang: 'en-GB', gender: 'female', isNeural: true, engine: 'AVSpeech' },
  { id: 'en-oliver-au', name: 'Oliver (English Australia)', lang: 'en-AU', gender: 'male', isNeural: true, engine: 'Web Native' },

  // German
  { id: 'de-katja-neural', name: 'Katja (Deutsch - Neural)', lang: 'de-DE', gender: 'female', isNeural: true, engine: 'SAPI 5' },
  { id: 'de-conrad-neural', name: 'Conrad (Deutsch - Parametric)', lang: 'de-DE', gender: 'male', isNeural: true, engine: 'Speech Dispatcher' },

  // French
  { id: 'fr-denise-neural', name: 'Denise (Français - Studio)', lang: 'fr-FR', gender: 'female', isNeural: true, engine: 'AVSpeech' },
  { id: 'fr-henri-sapi', name: 'Henri (Français - SAPI5)', lang: 'fr-FR', gender: 'male', isNeural: false, engine: 'SAPI 5' },

  // Spanish
  { id: 'es-elvira-neural', name: 'Elvira (Español - Neural)', lang: 'es-ES', gender: 'female', isNeural: true, engine: 'AVSpeech' },

  // Italian
  { id: 'it-elsa-neural', name: 'Elsa (Italiano - Neural)', lang: 'it-IT', gender: 'female', isNeural: true, engine: 'AVSpeech' },

  // Scandinavian
  { id: 'sv-sofie-neural', name: 'Sofie (Svenska)', lang: 'sv-SE', gender: 'female', isNeural: true, engine: 'Speech Dispatcher' },
  { id: 'no-iselin-neural', name: 'Iselin (Norsk Bokmål)', lang: 'nb-NO', gender: 'female', isNeural: true, engine: 'Web Native' },
  { id: 'da-christel-neural', name: 'Christel (Dansk)', lang: 'da-DK', gender: 'female', isNeural: true, engine: 'Web Native' },
];

export class SpeechCoordinator {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private boundaryCallback: ((wordIndex: number, charIndex: number) => void) | null = null;
  private endCallback: (() => void) | null = null;
  private isPaused: boolean = false;
  private wordFallbackTimer: number | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public getAvailableVoices(): Promise<VoiceItem[]> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve(CURATED_VOICES);
        return;
      }

      const populate = () => {
        const sysVoices = this.synth!.getVoices();
        const merged: VoiceItem[] = [...CURATED_VOICES];

        for (const sv of sysVoices) {
          const exists = merged.some(v => v.name.toLowerCase() === sv.name.toLowerCase());
          if (!exists) {
            const isNeural = sv.name.toLowerCase().includes('natural') || sv.name.toLowerCase().includes('neural') || sv.name.toLowerCase().includes('online');
            const gender: VoiceGender = sv.name.toLowerCase().includes('female') || sv.name.toLowerCase().includes('zira') || sv.name.toLowerCase().includes('samantha') ? 'female' : 'male';
            merged.push({
              id: `sys-${sv.name.replace(/\s+/g, '-').toLowerCase()}`,
              name: sv.name,
              lang: sv.lang,
              gender,
              isNeural,
              engine: 'Web Native',
              nativeVoice: sv,
            });
          } else {
            // attach nativeVoice pointer
            const match = merged.find(v => v.name.toLowerCase() === sv.name.toLowerCase());
            if (match) match.nativeVoice = sv;
          }
        }
        resolve(merged);
      };

      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        populate();
      } else {
        this.synth.onvoiceschanged = () => {
          populate();
        };
        setTimeout(populate, 500);
      }
    });
  }

  public speakSentence(
    sentence: string,
    words: string[],
    voice: VoiceItem,
    settings: PlaybackSettings,
    onWordHighlight: (wordIndex: number, charIndex: number) => void,
    onComplete: () => void
  ) {
    this.stop();
    this.isPaused = false;
    this.boundaryCallback = onWordHighlight;
    this.endCallback = onComplete;

    if (!this.synth) {
      // Fallback timer simulation
      this.simulateSpeech(words, settings.rateWpm, onWordHighlight, onComplete);
      return;
    }

    const utter = new SpeechSynthesisUtterance(sentence);
    this.currentUtterance = utter;

    // Map WPM (50 - 500) to rate (0.3 - 2.8)
    // 175 WPM maps to 1.0
    const calculatedRate = Math.max(0.3, Math.min(3.0, settings.rateWpm / 175));
    utter.rate = calculatedRate;

    // Map pitch -10..+10 to 0.5..1.5
    utter.pitch = Math.max(0.5, Math.min(1.8, 1.0 + (settings.pitch / 20)));

    // Volume 0..100 -> 0..1.0
    utter.volume = Math.max(0, Math.min(1.0, settings.volume / 100));

    // Try finding matching native voice
    if (voice.nativeVoice) {
      utter.voice = voice.nativeVoice;
    } else {
      const allSys = this.synth.getVoices();
      const match = allSys.find(v => v.lang.startsWith(voice.lang.slice(0, 2)));
      if (match) utter.voice = match;
    }
    utter.lang = voice.lang;

    let wordIdx = 0;
    let hasReceivedBoundary = false;

    utter.onboundary = (e) => {
      if (e.name === 'word') {
        hasReceivedBoundary = true;
        onWordHighlight(wordIdx, e.charIndex);
        wordIdx = Math.min(words.length - 1, wordIdx + 1);
      }
    };

    utter.onend = () => {
      if (this.wordFallbackTimer) {
        window.clearInterval(this.wordFallbackTimer);
        this.wordFallbackTimer = null;
      }
      onComplete();
    };

    utter.onerror = () => {
      if (this.wordFallbackTimer) {
        window.clearInterval(this.wordFallbackTimer);
        this.wordFallbackTimer = null;
      }
      onComplete();
    };

    // Fallback word timer if browser does not emit boundary events
    const wordsPerSecond = (settings.rateWpm / 60) * calculatedRate;
    const intervalMs = Math.max(120, Math.round(1000 / wordsPerSecond));

    let timerWordIdx = 0;
    this.wordFallbackTimer = window.setInterval(() => {
      if (this.isPaused) return;
      if (!hasReceivedBoundary && timerWordIdx < words.length) {
        onWordHighlight(timerWordIdx, 0);
        timerWordIdx++;
      }
    }, intervalMs);

    this.synth.speak(utter);
  }

  private simulateSpeech(
    words: string[],
    wpm: number,
    onWord: (wIdx: number, cIdx: number) => void,
    onEnd: () => void
  ) {
    let idx = 0;
    const intervalMs = Math.max(150, Math.round(60000 / wpm));
    this.wordFallbackTimer = window.setInterval(() => {
      if (this.isPaused) return;
      if (idx < words.length) {
        onWord(idx, 0);
        idx++;
      } else {
        if (this.wordFallbackTimer) {
          window.clearInterval(this.wordFallbackTimer);
          this.wordFallbackTimer = null;
        }
        onEnd();
      }
    }, intervalMs);
  }

  public pause() {
    this.isPaused = true;
    if (this.synth) {
      this.synth.pause();
    }
  }

  public resume() {
    this.isPaused = false;
    if (this.synth) {
      this.synth.resume();
    }
  }

  public stop() {
    this.isPaused = false;
    if (this.wordFallbackTimer) {
      window.clearInterval(this.wordFallbackTimer);
      this.wordFallbackTimer = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }
}
