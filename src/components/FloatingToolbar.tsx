import React, { useState, useMemo } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Minimize2,
  Maximize2,
  Sliders,
  Move,
  Volume2,
  Mic,
  MicOff,
  Plus,
  Minus,
  Globe,
  User,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { VoiceItem } from '../types/tts';
import {
  getDynamicLanguagesFromVoices,
  normalizeLangCode,
  getVoicesForLanguage,
  getDefaultVoiceForLanguage,
} from '../utils/languageHelper';

interface FloatingToolbarProps {
  isVisible: boolean;
  onClose: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  onPrev: () => void;
  onNext: () => void;
  rateWpm: number;
  onRateChange: (wpm: number) => void;
  voices: VoiceItem[];
  selectedVoice: VoiceItem;
  onSelectVoice: (voice: VoiceItem) => void;
  isRecordingStt: boolean;
  onToggleStt: () => void;
  sttInterimText?: string;
  sttStatusNotification?: { message: string; type: 'success' | 'command' | 'info' | 'error' } | null;
  onSimulateStt?: (text: string) => void;
  sttMicVolume?: number;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  isVisible,
  onClose,
  isPlaying,
  isPaused,
  onTogglePlay,
  onStop,
  onPrev,
  onNext,
  rateWpm,
  onRateChange,
  voices,
  selectedVoice,
  onSelectVoice,
  isRecordingStt,
  onToggleStt,
  sttInterimText = '',
  sttStatusNotification = null,
  onSimulateStt,
  sttMicVolume = 0,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [opacityPercent, setOpacityPercent] = useState(90);
  const [showQuickSettings, setShowQuickSettings] = useState(false);

  // Dynamically populated languages strictly based on currently available voices
  const dynamicLanguages = useMemo(() => {
    return getDynamicLanguagesFromVoices(voices);
  }, [voices]);

  // Current language prefix normalized
  const currentLangCode = useMemo(() => {
    if (!selectedVoice || !selectedVoice.lang) return 'nl';
    return normalizeLangCode(selectedVoice.lang);
  }, [selectedVoice]);

  // Voices filtered strictly by the chosen language
  const filteredVoices = useMemo(() => {
    return getVoicesForLanguage(voices, currentLangCode);
  }, [voices, currentLangCode]);

  // Handle changing the language dropdown
  const handleLanguageChange = (newLangCode: string) => {
    const match = getDefaultVoiceForLanguage(voices, newLangCode);
    if (match) {
      onSelectVoice(match);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl transition-all duration-150 select-none text-slate-100"
      style={{
        backgroundColor: `rgba(15, 23, 42, ${opacityPercent / 100})`,
      }}
    >
      {/* Minimized Dock Icon */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="p-3.5 flex items-center gap-2 hover:scale-105 transition-transform"
          title="Herstel zwevende werkbalk"
        >
          <Volume2 className="w-5 h-5 text-indigo-400" />
          <Maximize2 className="w-4 h-4 text-slate-400" />
        </button>
      ) : (
        <div className="p-3 space-y-2.5">
          {/* Top drag & minimize handle */}
          <div className="flex items-center justify-between gap-4 text-slate-400 border-b border-slate-800 pb-1.5 px-0.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
              <Move className="w-3 h-3 text-slate-500 cursor-move" />
              <span>VoxA11y Desktop Dock</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowQuickSettings(!showQuickSettings)}
                className={`p-1 rounded transition-colors ${showQuickSettings ? 'bg-indigo-600 text-white' : 'hover:text-white'}`}
                title="Quick Settings (Stem, Taal & Snelheid)"
              >
                <Sliders className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:text-white rounded"
                title="Minimaliseren naar dock"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Transport group */}
            <div className="flex items-center gap-1">
              <button
                onClick={onPrev}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Vorige zin"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onTogglePlay}
                className={`p-2.5 rounded-lg font-bold text-white transition-colors ${
                  isPlaying && !isPaused
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
                title="Play / Pause"
              >
                {isPlaying && !isPaused ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
              </button>

              <button
                onClick={onStop}
                disabled={!isPlaying && !isPaused}
                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 disabled:opacity-40 transition-colors"
                title="Stop"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>

              <button
                onClick={onNext}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Volgende zin"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* STT Microphone Button */}
            <button
              onClick={onToggleStt}
              className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold ${
                isRecordingStt
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-sm shadow-rose-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
              }`}
              title={isRecordingStt ? 'Stop dicteren (Whisper AI)' : 'Start dicteren & stemcommando (Whisper AI)'}
            >
              {isRecordingStt ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span className="text-[11px] hidden sm:inline">{isRecordingStt ? 'Dicteert...' : 'STT'}</span>
            </button>

            {/* Quick Setting Knop voor Stem- en Spraakinstellingen */}
            <button
              onClick={() => setShowQuickSettings(!showQuickSettings)}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold ${
                showQuickSettings
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/30 ring-1 ring-indigo-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title="Quick Settings: Stem, Taal en Snelheid instellen"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px]">Quick Settings</span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">[{rateWpm} WPM]</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showQuickSettings ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Live Whisper STT HUD Bar */}
          {(isRecordingStt || sttStatusNotification || sttInterimText) && (
            <div className="pt-2 border-t border-slate-800 text-xs space-y-2 bg-slate-950/95 p-2.5 rounded-xl border border-slate-700/80 shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-end gap-0.5 h-3.5">
                    <span
                      className={`w-1 rounded-full transition-all duration-75 ${
                        sttMicVolume > 10 ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                      style={{ height: `${Math.max(4, Math.min(14, (sttMicVolume / 100) * 14))}px` }}
                    />
                    <span
                      className={`w-1 rounded-full transition-all duration-75 ${
                        sttMicVolume > 30 ? 'bg-emerald-300' : 'bg-slate-600'
                      }`}
                      style={{ height: `${Math.max(4, Math.min(14, (sttMicVolume / 70) * 14))}px` }}
                    />
                    <span
                      className={`w-1 rounded-full transition-all duration-75 ${
                        sttMicVolume > 50 ? 'bg-cyan-400' : 'bg-slate-600'
                      }`}
                      style={{ height: `${Math.max(4, Math.min(14, (sttMicVolume / 50) * 14))}px` }}
                    />
                    <span
                      className={`w-1 rounded-full transition-all duration-75 ${
                        sttMicVolume > 20 ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                      style={{ height: `${Math.max(4, Math.min(14, (sttMicVolume / 80) * 14))}px` }}
                    />
                  </div>
                  <span className="font-semibold text-emerald-400 text-[11px] flex items-center gap-1">
                    <span>{isRecordingStt ? 'Whisper AI Luistert...' : 'STT Systeem'}</span>
                    <span className="text-[9px] font-mono text-slate-400">[{selectedVoice?.lang || 'nl-NL'}]</span>
                  </span>
                </div>
                {sttStatusNotification && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded truncate max-w-[210px] ${
                    sttStatusNotification.type === 'error' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    sttStatusNotification.type === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    sttStatusNotification.type === 'command' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {sttStatusNotification.message}
                  </span>
                )}
              </div>

              {/* Interim detected speech with live indicator */}
              <div className="bg-slate-900/95 rounded-lg p-2 border border-slate-800 text-[11px] min-h-[30px] flex items-center justify-between">
                <span className="text-slate-200 italic truncate mr-2">
                  {sttInterimText ? (
                    <span className="text-amber-300 font-medium">«{sttInterimText}»</span>
                  ) : (
                    <span className="text-slate-400">Spreek nu of klik op een testcommando...</span>
                  )}
                </span>
                {isRecordingStt && (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] font-mono text-rose-400 font-semibold animate-pulse">MIC LIVE</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  </div>
                )}
              </div>

              {/* Quick simulation pills for commands and document appending */}
              {onSimulateStt && (
                <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto text-[10px] no-scrollbar">
                  <span className="text-slate-500 shrink-0">Direct testen:</span>
                  <button
                    onClick={() => onSimulateStt('Nieuwe alinea gedicteerd via lokale Whisper AI.')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0 font-medium"
                    title="Voeg gedicteerde zin toe aan document"
                  >
                    + Dicteer
                  </button>
                  <button
                    onClick={() => onSimulateStt('lees voor')}
                    className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/80 hover:bg-indigo-900 text-indigo-300 transition-colors shrink-0"
                    title="Commando: start TTS"
                  >
                    ▶ "lees voor"
                  </button>
                  <button
                    onClick={() => onSimulateStt('stop')}
                    className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800/80 hover:bg-rose-900 text-rose-300 transition-colors shrink-0"
                    title="Commando: stop TTS"
                  >
                    ⏹ "stop"
                  </button>
                  <button
                    onClick={() => onSimulateStt('sneller')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                    title="Commando: snelheid +20"
                  >
                    + Sneller
                  </button>
                  <button
                    onClick={() => onSimulateStt('volgende')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                    title="Commando: volgende zin"
                  >
                    ⏭ Volgende
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Stem- en Spraakinstellingen onder Quick Setting knop */}
          {showQuickSettings && (
            <div className="pt-2 border-t border-slate-800 text-xs space-y-3 bg-slate-950/95 p-3 rounded-xl border border-slate-700/80 shadow-2xl animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Stem- & Quick Settings</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 font-mono">
                    {dynamicLanguages.length} talen
                  </span>
                  <button
                    onClick={() => setShowQuickSettings(false)}
                    className="text-slate-400 hover:text-white px-1 font-bold text-xs"
                    title="Sluit quick settings"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Grid with Taal & Stem */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Dynamische Taal Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-indigo-400" />
                    <span>Taal (dynamisch gevuld)</span>
                  </label>
                  <select
                    value={currentLangCode}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1.5 text-slate-100 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    title="Kies een dynamisch gedetecteerde taal"
                  >
                    {dynamicLanguages.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-100">
                        {lang.dropdownLabel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stem voor gekozen taal */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-indigo-400" />
                    <span>Stem ({filteredVoices.length} beschikbaar)</span>
                  </label>
                  <select
                    value={selectedVoice.id}
                    onChange={(e) => {
                      const v = voices.find((item) => item.id === e.target.value);
                      if (v) onSelectVoice(v);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1.5 text-slate-100 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer truncate"
                    title="Selecteer stem voor de gekozen taal"
                  >
                    {filteredVoices.map((voice) => (
                      <option key={voice.id} value={voice.id} className="bg-slate-900 text-slate-100">
                        {voice.name} {voice.isNeural ? '✨' : ''} ({voice.gender === 'female' ? 'V' : 'M'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Spreeksnelheid (Speed WPM) */}
              <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Spreeksnelheid</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onRateChange(Math.max(50, rateWpm - 10))}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="-10 WPM"
                    >
                      <Minus className="w-2.5 h-2.5 inline" />
                    </button>
                    <span className="font-mono text-indigo-400 font-bold">{rateWpm} WPM</span>
                    <button
                      onClick={() => onRateChange(Math.min(500, rateWpm + 10))}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="+10 WPM"
                    >
                      <Plus className="w-2.5 h-2.5 inline" />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={50}
                  max={500}
                  step={10}
                  value={rateWpm}
                  onChange={(e) => onRateChange(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <button onClick={() => onRateChange(120)} className="hover:text-white">120 Langzaam</button>
                  <button onClick={() => onRateChange(170)} className="hover:text-white font-bold text-indigo-300">170 Normaal</button>
                  <button onClick={() => onRateChange(220)} className="hover:text-white">220 Snel</button>
                  <button onClick={() => onRateChange(300)} className="hover:text-white">300+ Zeer snel</button>
                </div>
              </div>

              {/* Transparantie Dock Slider */}
              <div className="pt-1 border-t border-slate-800/80 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Dock Transparantie</span>
                  <span className="font-mono text-slate-300">{opacityPercent}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={opacityPercent}
                  onChange={(e) => setOpacityPercent(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
