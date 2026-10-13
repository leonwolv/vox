import JSZip from 'jszip';
import { AudioExportOptions } from '../types/tts';

export interface TimedWord {
  word: string;
  startMs: number;
  endMs: number;
}

export interface TimedSentence {
  sentence: string;
  startMs: number;
  endMs: number;
  words: TimedWord[];
}

/**
 * Generate standard RIFF WAV buffer from PCM samples
 */
export function encodeWav16Bit(samples: Float32Array, sampleRate: number = 44100): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Generate SRT subtitle string
 */
export function generateSrt(sentences: TimedSentence[]): string {
  let srt = '';
  sentences.forEach((s, idx) => {
    const startStr = formatSrtTimestamp(s.startMs);
    const endStr = formatSrtTimestamp(s.endMs);
    srt += `${idx + 1}\n${startStr} --> ${endStr}\n${s.sentence.trim()}\n\n`;
  });
  return srt;
}

function formatSrtTimestamp(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor(ms % 1000);
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(millis, 3)}`;
}

/**
 * Generate LRC Karaoke string
 */
export function generateLrc(title: string, author: string, sentences: TimedSentence[]): string {
  let lrc = `[ti:${title}]\n[ar:${author}]\n[by:VoxA11y Rust Engine]\n\n`;
  for (const s of sentences) {
    let line = `[${formatLrcTimestamp(s.startMs)}]`;
    for (const w of s.words) {
      line += `<${formatLrcTimestamp(w.startMs)}>${w.word} `;
    }
    lrc += `${line.trim()}\n`;
  }
  return lrc;
}

function formatLrcTimestamp(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const hundredths = Math.floor((ms % 1000) / 10);
  return `${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(hundredths, 2)}`;
}

function pad(n: number, width: number): string {
  return n.toString().padStart(width, '0');
}

/**
 * Synthesize speech audio using Web Audio API offline speech synthesis or acoustic simulation
 */
export async function synthesizeAudioBlob(
  text: string,
  options: AudioExportOptions,
  wpm: number = 175
): Promise<{ blob: Blob; sentences: TimedSentence[]; durationSeconds: number }> {
  const words = text.split(/\s+/).filter(Boolean);
  const wordsPerSecond = Math.max(1, wpm / 60);
  const avgMsPerWord = 1000 / wordsPerSecond;

  const rawSentences = text.split(/(?<=[.?!])\s+/).filter(Boolean);
  const timedSentences: TimedSentence[] = [];

  let currentMs = 200; // initial breathing pause
  for (const s of rawSentences) {
    const sWords = s.split(/\s+/).filter(Boolean);
    const sStart = currentMs;
    const timedWords: TimedWord[] = [];

    for (const w of sWords) {
      const wStart = currentMs;
      const wDuration = avgMsPerWord * Math.max(0.6, Math.min(1.8, w.length / 5));
      currentMs += wDuration;
      timedWords.push({
        word: w,
        startMs: Math.round(wStart),
        endMs: Math.round(currentMs),
      });
      currentMs += 40; // micro pause between words
    }

    // Punctuation pause
    if (s.endsWith('?') || s.endsWith('!')) {
      currentMs += 500;
    } else {
      currentMs += 400;
    }

    timedSentences.push({
      sentence: s,
      startMs: Math.round(sStart),
      endMs: Math.round(currentMs),
      words: timedWords,
    });
  }

  const sampleRate = options.sampleRate;
  const totalDurationSec = (currentMs + 300) / 1000;
  const totalSamples = Math.floor(totalDurationSec * sampleRate);
  const samples = new Float32Array(totalSamples);

  // Generate gentle harmonized acoustic speech envelope tone for preview WAV
  for (const s of timedSentences) {
    for (const w of s.words) {
      const startSample = Math.floor((w.startMs / 1000) * sampleRate);
      const endSample = Math.min(totalSamples, Math.floor((w.endMs / 1000) * sampleRate));
      const len = endSample - startSample;
      const baseFreq = 220 + ((w.word.charCodeAt(0) * 7) % 180);

      for (let i = 0; i < len; i++) {
        const t = i / sampleRate;
        const env = Math.sin((Math.PI * i) / len); // Hann window envelope
        const signal = (
          Math.sin(2 * Math.PI * baseFreq * t) * 0.4 +
          Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.2 +
          Math.sin(2 * Math.PI * baseFreq * 3 * t) * 0.1
        ) * env * 0.45;
        samples[startSample + i] = signal;
      }
    }
  }

  const wavBlob = encodeWav16Bit(samples, sampleRate);
  return {
    blob: wavBlob,
    sentences: timedSentences,
    durationSeconds: totalDurationSec,
  };
}

/**
 * Package the complete Rust engine crate as a downloadable ZIP archive
 */
export async function createRustProjectZip(files: Record<string, string>): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder('vox_a11y_rust_engine') || zip;

  for (const [path, content] of Object.entries(files)) {
    root.file(path, content);
  }

  return await zip.generateAsync({ type: 'blob' });
}
