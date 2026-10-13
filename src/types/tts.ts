export type VoiceGender = 'male' | 'female' | 'child' | 'neutral';

export interface VoiceItem {
  id: string;
  name: string;
  lang: string;
  gender: VoiceGender;
  isNeural: boolean;
  engine: 'SAPI 5' | 'AVSpeech' | 'Speech Dispatcher' | 'Web Native';
  nativeVoice?: SpeechSynthesisVoice;
}

export type HighlightStyle = 'background' | 'underline-single' | 'underline-double' | 'underline-wavy' | 'bordered' | 'bold-italic';

export type ColorTheme = 'dyslexia' | 'high-contrast-yellow' | 'high-contrast-cyan' | 'slate-dark' | 'clean-light' | 'custom';

export interface VisualSettings {
  highlightStyle: HighlightStyle;
  highlightColor: string;
  highlightOpacity: number; // 0.1 to 1.0
  borderWidth: number; // 1 to 4 px
  theme: ColorTheme;
  customBgColor: string;
  customTextColor: string;
  customHighlightColor: string;
  sentenceHighlight: boolean;
  sentenceHighlightColor: string;
  fadeOutReadText: boolean;
  nextSentencePreview: boolean;
  fontFamily: 'opendyslexic' | 'system' | 'serif' | 'sans';
  fontSize: number; // in px, e.g. 18
  lineSpacing: number; // e.g. 1.8
  letterSpacing: number; // e.g. 0.05em
}

export interface PlaybackSettings {
  rateWpm: number; // 50 - 500 WPM
  pitch: number; // -10 to +10
  volume: number; // 0 - 100
  ducking: boolean;
  pauseCommaMs: number; // 100 - 500
  pausePeriodMs: number; // 200 - 1000
  pauseExclamationQuestionMs: number; // 300 - 1200
  pauseParagraphMs: number; // 500 - 2000
  breathingSimulation: boolean;
}

export interface ReadingBookmark {
  id: string;
  docId: string;
  title: string;
  sentenceIndex: number;
  wordIndex: number;
  createdAt: string;
  snippet: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: 'word' | 'browser' | 'email' | 'pdf' | 'custom';
  content: string;
  sourceInfo?: string;
  author?: string;
}

export interface LexiconEntry {
  id: string;
  pattern: string;
  replacement: string;
  isRegex: boolean;
  matchWholeWord: boolean;
  category: 'afkorting' | 'valuta' | 'uitspraak' | 'acroniem';
}

export interface OsAccessibilityNode {
  id: string;
  role: string;
  name: string;
  value?: string;
  states: string[];
  bounds: { x: number; y: number; width: number; height: number };
  children?: OsAccessibilityNode[];
}

export interface AudioExportOptions {
  format: 'wav-16bit' | 'wav-24bit' | 'webm-stream';
  sampleRate: 22050 | 44100 | 48000;
  channels: 'mono' | 'stereo';
  bitrateKbps: 128 | 192 | 256 | 320;
  title: string;
  author: string;
  album: string;
  includeSrt: boolean;
  includeLrc: boolean;
}
