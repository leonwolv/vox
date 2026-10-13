import React, { useState } from 'react';
import { X, Download, FileAudio, FileText, Music, Check, Clock } from 'lucide-react';
import { AudioExportOptions } from '../types/tts';
import { generateLrc, generateSrt, synthesizeAudioBlob } from '../utils/audioExport';

interface AudioExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentAuthor: string;
  textContent: string;
  rateWpm: number;
}

export const AudioExportModal: React.FC<AudioExportModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentAuthor,
  textContent,
  rateWpm,
}) => {
  const [options, setOptions] = useState<AudioExportOptions>({
    format: 'wav-16bit',
    sampleRate: 44100,
    channels: 'mono',
    bitrateKbps: 192,
    title: documentTitle || 'TTS Audio Export',
    author: documentAuthor || 'VoxA11y Engine',
    album: 'Gesproken Toegankelijkheid',
    includeSrt: true,
    includeLrc: true,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadReady, setDownloadReady] = useState(false);
  const [wavUrl, setWavUrl] = useState<string | null>(null);
  const [srtUrl, setSrtUrl] = useState<string | null>(null);
  const [lrcUrl, setLrcUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgress(15);

    try {
      // Step 1: Synthesize audio blob and timestamped sentences
      setProgress(40);
      const result = await synthesizeAudioBlob(textContent, options, rateWpm);

      setProgress(75);
      const wavObjectUrl = URL.createObjectURL(result.blob);
      setWavUrl(wavObjectUrl);

      // Step 2: Generate SRT
      if (options.includeSrt) {
        const srtContent = generateSrt(result.sentences);
        const srtBlob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
        setSrtUrl(URL.createObjectURL(srtBlob));
      }

      // Step 3: Generate LRC Karaoke
      if (options.includeLrc) {
        const lrcContent = generateLrc(options.title, options.author, result.sentences);
        const lrcBlob = new Blob([lrcContent], { type: 'text/plain;charset=utf-8' });
        setLrcUrl(URL.createObjectURL(lrcBlob));
      }

      setProgress(100);
      setDownloadReady(true);
    } catch (err) {
      console.error('Audio export error', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl text-slate-200 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileAudio className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold text-white text-base">Audio-Export & Subtitle Synchronisatie</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300">Audio Formaat & Kwaliteit</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOptions({ ...options, format: 'wav-16bit' })}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  options.format === 'wav-16bit'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white'
                    : 'border-slate-800 bg-slate-800/50 text-slate-400'
                }`}
              >
                <div className="font-semibold">WAV (16-bit PCM)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Ongecomprimeerd, Broadcast kwaliteit</div>
              </button>

              <button
                type="button"
                onClick={() => setOptions({ ...options, format: 'wav-24bit' })}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  options.format === 'wav-24bit'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white'
                    : 'border-slate-800 bg-slate-800/50 text-slate-400'
                }`}
              >
                <div className="font-semibold">WAV (24-bit Hi-Res)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Studio master, hoge dynamiek</div>
              </button>
            </div>
          </div>

          {/* Sample Rate & Channels */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-400">Sample Rate</label>
              <select
                value={options.sampleRate}
                onChange={(e) => setOptions({ ...options, sampleRate: parseInt(e.target.value, 10) as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
              >
                <option value={22050}>22.05 kHz (Spraak compact)</option>
                <option value={44100}>44.1 kHz (CD Kwaliteit)</option>
                <option value={48000}>48.0 kHz (Broadcast Standard)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400">Kanalen</label>
              <select
                value={options.channels}
                onChange={(e) => setOptions({ ...options, channels: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
              >
                <option value="mono">Mono (Geoptimaliseerd voor spraak)</option>
                <option value="stereo">Stereo (Ruimtelijk)</option>
              </select>
            </div>
          </div>

          {/* Metadata ID3 Tags */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="font-semibold text-slate-300">ID3 Metadata Tags & Hoofdstukmarkers</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 text-[11px]">Titel</label>
                <input
                  type="text"
                  value={options.title}
                  onChange={(e) => setOptions({ ...options, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 mt-1"
                />
              </div>
              <div>
                <label className="text-slate-500 text-[11px]">Auteur / Verteller</label>
                <input
                  type="text"
                  value={options.author}
                  onChange={(e) => setOptions({ ...options, author: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Subtitles & Sync Options */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="font-semibold text-slate-300">Gesynchroniseerde Tekst Export</span>
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={options.includeSrt}
                  onChange={(e) => setOptions({ ...options, includeSrt: e.target.checked })}
                  className="rounded text-indigo-500"
                />
                <span>SubRip (.SRT) per zin</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={options.includeLrc}
                  onChange={(e) => setOptions({ ...options, includeLrc: e.target.checked })}
                  className="rounded text-indigo-500"
                />
                <span>Karaoke (.LRC) per woord</span>
              </label>
            </div>
          </div>

          {/* Progress or Ready status */}
          {isExporting && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Bezig met genereren audio buffer & timestamps...</span>
                </span>
                <span className="font-mono text-indigo-400">{progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {downloadReady && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Check className="w-4 h-4" />
                <span>Audio & Synchronisatie succesvol gegenereerd!</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {wavUrl && (
                  <a
                    href={wavUrl}
                    download={`${options.title.replace(/\s+/g, '_')}.wav`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download WAV</span>
                  </a>
                )}
                {srtUrl && (
                  <a
                    href={srtUrl}
                    download={`${options.title.replace(/\s+/g, '_')}.srt`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download SRT</span>
                  </a>
                )}
                {lrcUrl && (
                  <a
                    href={lrcUrl}
                    download={`${options.title.replace(/\s+/g, '_')}.lrc`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>Download LRC</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Sluiten
          </button>
          {!downloadReady && (
            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Start Export</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
