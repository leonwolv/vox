import React, { useState, useMemo } from 'react';
import {
  Monitor,
  Layers,
  Sliders,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  Move,
  CheckCircle,
  Eye,
  Command,
  Sparkles,
  Maximize2,
  ExternalLink,
  Mic,
  MicOff,
  Plus,
  Minus,
  ChevronDown,
  Globe,
  User,
} from 'lucide-react';
import { PlaybackSettings, VisualSettings, VoiceItem } from '../types/tts';
import {
  getDynamicLanguagesFromVoices,
  normalizeLangCode,
  getVoicesForLanguage,
  getDefaultVoiceForLanguage,
} from '../utils/languageHelper';

interface DesktopGuiShowcaseProps {
  osStyle: 'windows' | 'macos' | 'linux';
  setOsStyle: (style: 'windows' | 'macos' | 'linux') => void;
  isPlaying: boolean;
  isPaused: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentSentenceText: string;
  currentWordText: string;
  settings: PlaybackSettings;
  onUpdateSettings: (settings: Partial<PlaybackSettings>) => void;
  visualSettings: VisualSettings;
  onUpdateVisualSettings: (settings: Partial<VisualSettings>) => void;
  voices: VoiceItem[];
  selectedVoice: VoiceItem;
  onSelectVoice: (voice: VoiceItem) => void;
  isRecordingStt: boolean;
  onToggleStt: () => void;
  onSwitchToStudio: () => void;
  activeDocumentContent?: string;
  activeDocumentTitle?: string;
  sttInterimText?: string;
  sttStatusNotification?: { message: string; type: 'success' | 'command' | 'info' | 'error' } | null;
  onSimulateStt?: (text: string) => void;
  sttMicVolume?: number;
}

export const DesktopGuiShowcase: React.FC<DesktopGuiShowcaseProps> = ({
  osStyle,
  setOsStyle,
  isPlaying,
  isPaused,
  onTogglePlay,
  onStop,
  onPrev,
  onNext,
  currentSentenceText,
  currentWordText,
  settings,
  onUpdateSettings,
  visualSettings,
  onUpdateVisualSettings,
  voices,
  selectedVoice,
  onSelectVoice,
  isRecordingStt,
  onToggleStt,
  onSwitchToStudio,
  activeDocumentContent,
  activeDocumentTitle,
  sttInterimText = '',
  sttStatusNotification = null,
  onSimulateStt,
  sttMicVolume = 0,
}) => {
  const [activeGuiView, setActiveGuiView] = useState<'overlay' | 'tray' | 'hud'>('overlay');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(88);
  const [trayMenuOpen, setTrayMenuOpen] = useState<boolean>(true);
  const [showMiniQuickSettings, setShowMiniQuickSettings] = useState<boolean>(false);

  // Dynamically populated languages strictly based on currently available voices
  const dynamicLanguages = useMemo(() => {
    return getDynamicLanguagesFromVoices(voices);
  }, [voices]);

  const currentLangCode = useMemo(() => {
    if (!selectedVoice || !selectedVoice.lang) return 'nl';
    return normalizeLangCode(selectedVoice.lang);
  }, [selectedVoice]);

  const filteredVoices = useMemo(() => {
    return getVoicesForLanguage(voices, currentLangCode);
  }, [voices, currentLangCode]);

  const handleLanguageChange = (newLangCode: string) => {
    const match = getDefaultVoiceForLanguage(voices, newLangCode);
    if (match) {
      onSelectVoice(match);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Selector Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Voorbeeld van de Desktop GUI (Interactieve Demonstratie)
              </h2>
              <p className="text-xs text-slate-400">
                Bekijk hoe de applicatie eruitziet als zwevende desktop-overlay, in het systeemvak (tray) en als screen reader HUD
              </p>
            </div>
          </div>

          {/* View mode switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveGuiView('overlay')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeGuiView === 'overlay'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Zwevend Mini-Widget
            </button>
            <button
              onClick={() => setActiveGuiView('tray')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeGuiView === 'tray'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Systeemvak (Tray Menu)
            </button>
            <button
              onClick={() => setActiveGuiView('hud')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeGuiView === 'hud'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. OS Accessibility HUD
            </button>
          </div>
        </div>

        {/* OS Switcher Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Vensterstijl simulatie:</span>
            <button
              onClick={() => setOsStyle('windows')}
              className={`px-2.5 py-1 rounded-md border transition-colors ${
                osStyle === 'windows'
                  ? 'border-blue-500 bg-blue-950/40 text-blue-300 font-semibold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Windows 11 (Fluent)
            </button>
            <button
              onClick={() => setOsStyle('macos')}
              className={`px-2.5 py-1 rounded-md border transition-colors ${
                osStyle === 'macos'
                  ? 'border-purple-500 bg-purple-950/40 text-purple-300 font-semibold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              macOS Sonoma
            </button>
            <button
              onClick={() => setOsStyle('linux')}
              className={`px-2.5 py-1 rounded-md border transition-colors ${
                osStyle === 'linux'
                  ? 'border-amber-500 bg-amber-950/40 text-amber-300 font-semibold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Linux GNOME
            </button>
          </div>

          <button
            onClick={onSwitchToStudio}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Open Studio Leesvenster</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* VIEW 1: Zwevend Overlay Mini-Widget Simulatie */}
      {activeGuiView === 'overlay' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-semibold text-white text-sm">
                Frameless Always-on-Top Zwevend Desktop Widget
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Blijft permanent boven Microsoft Word, Acrobat Reader of uw browser zweven
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">Transparantie: {overlayOpacity}%</span>
              <input
                type="range"
                min={20}
                max={100}
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseInt(e.target.value, 10))}
                className="w-24 accent-indigo-500 h-1 bg-slate-700 rounded"
              />
            </div>
          </div>

          {/* Desktop Wallpaper Simulation with floating widget */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl h-[420px] bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 flex flex-col justify-between p-6">
            {/* Background simulated Word document window */}
            <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 p-5 max-w-2xl shadow-xl space-y-2 opacity-90 select-none overflow-y-auto max-h-[160px]">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-semibold text-slate-200 truncate">
                  {activeDocumentTitle || 'Word Document — Project_Specificaties_2026.docx'}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded">
                  Live Document
                </span>
              </div>
              {(activeDocumentContent || 'Hoofdstuk 1: Tekst-naar-spraak engine architectuur voor Windows, macOS en Linux. De engine integreert direct met de ingebouwde besturingssysteem accessibility interfaces.\n\nAfspeelparameters en regelbereik: De standaard spreeksnelheid is ingesteld op 175 woorden per minuut (WPM). Op 01-01-2025 bedroeg de totale subsidie €50,00 per licentie...')
                .split('\n\n')
                .slice(-3)
                .map((para, idx) => (
                  <p key={idx} className="text-xs text-slate-300 leading-relaxed font-serif">
                    {para}
                  </p>
                ))}
            </div>

            {/* The actual Floating Overlay Widget (Interactive) */}
            <div
              className="self-center sm:self-end mt-4 backdrop-blur-md rounded-2xl border border-slate-700/90 shadow-2xl p-3.5 space-y-3 transition-all duration-150 w-full max-w-md"
              style={{
                backgroundColor: `rgba(15, 23, 42, ${overlayOpacity / 100})`,
              }}
            >
              {/* Drag bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5 px-0.5">
                <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                  <Move className="w-3 h-3 text-slate-500 cursor-move" />
                  <span>VoxA11y Mini-Player</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded text-[10px]">
                    ALWAYS ON TOP
                  </span>
                </div>
              </div>

              {/* Active sentence readout preview */}
              <div className="bg-slate-950/60 rounded-lg p-2 text-xs border border-slate-800/80 truncate">
                <span className="text-slate-400 mr-1.5">Zin:</span>
                <span className="text-indigo-200 italic font-medium truncate">
                  "{currentSentenceText || 'De standaard spreeksnelheid is ingesteld op 175 woorden per minuut.'}"
                </span>
              </div>

              {/* Controls strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={onPrev}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    title="Vorige zin"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={onTogglePlay}
                    className={`px-3 py-1.5 rounded-lg font-bold text-white transition-colors flex items-center gap-1.5 text-xs ${
                      isPlaying && !isPaused
                        ? 'bg-amber-600 hover:bg-amber-500'
                        : 'bg-indigo-600 hover:bg-indigo-500'
                    }`}
                  >
                    {isPlaying && !isPaused ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pauze</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isPaused ? 'Hervat' : 'Lees Voor'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onStop}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-200 transition-colors"
                    title="Stop"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <button
                    onClick={onNext}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    title="Volgende zin"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>

                  {/* STT Microphone Button */}
                  <button
                    onClick={onToggleStt}
                    className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-semibold ${
                      isRecordingStt
                        ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
                    }`}
                    title={isRecordingStt ? 'Stop dicteren' : 'Start dicteren (Whisper AI)'}
                  >
                    {isRecordingStt ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span className="text-[10px] hidden sm:inline">{isRecordingStt ? 'Opname...' : 'STT'}</span>
                  </button>
                </div>

                {/* Quick Setting Knop voor Stem- en Spraakinstellingen */}
                <button
                  onClick={() => setShowMiniQuickSettings(!showMiniQuickSettings)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    showMiniQuickSettings
                      ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                  title="Quick Settings: Stem, Taal en Snelheid instellen"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[11px]">Quick Settings</span>
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">[{settings.rateWpm} WPM]</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showMiniQuickSettings ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Stem- en Taalinstellingen onder Quick Setting knop in Mini Player */}
              {showMiniQuickSettings && (
                <div className="bg-slate-950/95 rounded-xl p-3 border border-slate-700/80 space-y-3 text-xs shadow-xl animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                      Stem- & Quick Settings
                    </span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 font-mono">
                        {dynamicLanguages.length} talen
                      </span>
                      <button
                        onClick={() => setShowMiniQuickSettings(false)}
                        className="text-slate-400 hover:text-white px-1 font-bold text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Dynamische Taal */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-indigo-400" />
                        Taal (dynamisch)
                      </label>
                      <select
                        value={currentLangCode}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-100 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        title="Selecteer taal"
                      >
                        {dynamicLanguages.map((lang) => (
                          <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-100">
                            {lang.dropdownLabel}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Stemkeuze */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3 text-indigo-400" />
                        Stem ({filteredVoices.length} beschikbaar)
                      </label>
                      <select
                        value={selectedVoice.id}
                        onChange={(e) => {
                          const v = voices.find((item) => item.id === e.target.value);
                          if (v) onSelectVoice(v);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-100 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer truncate"
                        title="Selecteer stem voor gekozen taal"
                      >
                        {filteredVoices.map((voice) => (
                          <option key={voice.id} value={voice.id} className="bg-slate-900 text-slate-100">
                            {voice.name} {voice.isNeural ? '✨' : ''} ({voice.gender === 'female' ? 'V' : 'M'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Snelheid stepper & slider */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Spreeksnelheid</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onUpdateSettings({ rateWpm: Math.max(50, settings.rateWpm - 10) })}
                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="-10 WPM"
                        >
                          <Minus className="w-2.5 h-2.5 inline" />
                        </button>
                        <span className="font-mono text-indigo-400 font-bold">{settings.rateWpm} WPM</span>
                        <button
                          onClick={() => onUpdateSettings({ rateWpm: Math.min(500, settings.rateWpm + 10) })}
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
                      value={settings.rateWpm}
                      onChange={(e) => onUpdateSettings({ rateWpm: parseInt(e.target.value, 10) })}
                      className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <button onClick={() => onUpdateSettings({ rateWpm: 120 })} className="hover:text-white">120 Langzaam</button>
                      <button onClick={() => onUpdateSettings({ rateWpm: 170 })} className="hover:text-white font-bold text-indigo-300">170 Normaal</button>
                      <button onClick={() => onUpdateSettings({ rateWpm: 220 })} className="hover:text-white">220 Snel</button>
                      <button onClick={() => onUpdateSettings({ rateWpm: 300 })} className="hover:text-white">300+ Zeer snel</button>
                    </div>
                  </div>
                </div>
              )}

              {/* STT Feedback Strip if active */}
              {(isRecordingStt || sttStatusNotification || sttInterimText) && (
                <div className="bg-slate-950/95 rounded-lg p-2.5 border border-slate-800 space-y-2 text-[11px] shadow-lg">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <div className="flex items-end gap-0.5 h-3">
                        <span
                          className={`w-1 rounded-full transition-all duration-75 ${
                            sttMicVolume > 10 ? 'bg-emerald-400' : 'bg-slate-600'
                          }`}
                          style={{ height: `${Math.max(3, Math.min(12, (sttMicVolume / 100) * 12))}px` }}
                        />
                        <span
                          className={`w-1 rounded-full transition-all duration-75 ${
                            sttMicVolume > 30 ? 'bg-emerald-300' : 'bg-slate-600'
                          }`}
                          style={{ height: `${Math.max(3, Math.min(12, (sttMicVolume / 70) * 12))}px` }}
                        />
                        <span
                          className={`w-1 rounded-full transition-all duration-75 ${
                            sttMicVolume > 50 ? 'bg-cyan-400' : 'bg-slate-600'
                          }`}
                          style={{ height: `${Math.max(3, Math.min(12, (sttMicVolume / 50) * 12))}px` }}
                        />
                      </div>
                      <span>{isRecordingStt ? 'Whisper AI Luistert...' : 'STT Systeem'}</span>
                      <span className="text-[9px] font-mono text-slate-400">[{selectedVoice?.lang || 'nl-NL'}]</span>
                    </div>
                    {sttStatusNotification && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded truncate max-w-[200px] ${
                        sttStatusNotification.type === 'error' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        sttStatusNotification.type === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        sttStatusNotification.type === 'command' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {sttStatusNotification.message}
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-900/90 rounded p-1.5 border border-slate-800 text-slate-200 italic truncate flex items-center justify-between">
                    <span>
                      {sttInterimText ? (
                        <span className="text-amber-300 font-medium">«{sttInterimText}»</span>
                      ) : (
                        <span className="text-slate-400">Spreek nu in microfoon of klik op een testcommando...</span>
                      )}
                    </span>
                    {isRecordingStt && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0 ml-2" />
                    )}
                  </div>

                  {onSimulateStt && (
                    <div className="flex items-center gap-1.5 text-[10px] pt-0.5 overflow-x-auto no-scrollbar">
                      <span className="text-slate-500 shrink-0">Direct testen:</span>
                      <button
                        onClick={() => onSimulateStt('Nieuwe alinea gedicteerd via lokale Whisper AI.')}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium shrink-0"
                        title="Dicteer zin naar document"
                      >
                        + Dicteer
                      </button>
                      <button
                        onClick={() => onSimulateStt('lees voor')}
                        className="px-1.5 py-0.5 rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 shrink-0"
                        title="Commando 'lees voor'"
                      >
                        ▶ "lees voor"
                      </button>
                      <button
                        onClick={() => onSimulateStt('stop')}
                        className="px-1.5 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 shrink-0"
                        title="Commando 'stop'"
                      >
                        ⏹ "stop"
                      </button>
                      <button
                        onClick={() => onSimulateStt('sneller')}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
                        title="Commando 'sneller'"
                      >
                        + Sneller
                      </button>
                      <button
                        onClick={() => onSimulateStt('volgende')}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
                        title="Commando 'volgende'"
                      >
                        ⏭ Volgende
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Taskbar / Dock Bar at bottom */}
            <div className="h-10 bg-slate-950/80 backdrop-blur-md border-t border-slate-800/80 -mx-6 -mb-6 px-4 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-300">
                  {osStyle === 'windows' ? 'Start' : osStyle === 'macos' ? 'Finder' : 'Activiteiten'}
                </span>
                <span className="text-[11px] text-slate-500">Microsoft Word (Actief)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-mono text-[11px]">Sneltoets: Ctrl+Shift+Space</span>
                <span className="font-mono text-slate-400">12:30</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Systeemvak (System Tray) Simulatie */}
      {activeGuiView === 'tray' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-semibold text-white text-sm">
                Native Systeemvak (System Tray / Menubalk) Integratie
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Draait op de achtergrond. Klik op het taakbalkicoon om het contextmenu te openen
              </p>
            </div>
            <button
              onClick={() => setTrayMenuOpen(!trayMenuOpen)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium"
            >
              {trayMenuOpen ? 'Sluit Tray Menu' : 'Open Tray Menu'}
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl h-[380px] bg-slate-950 flex flex-col justify-end p-6">
            {/* Center Explanatory Note */}
            <div className="self-center text-center space-y-2 mb-12">
              <Volume2 className="w-10 h-10 text-indigo-400 mx-auto" />
              <h4 className="font-semibold text-white text-sm">VoxA11y Achtergrondservice Actief</h4>
              <p className="text-xs text-slate-400 max-w-md">
                De TTS-daemon luistert globaal via het besturingssysteem naar <kbd className="text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">Ctrl+Shift+Space</kbd>.
              </p>
            </div>

            {/* Taskbar Tray Dock */}
            <div className="relative">
              {/* Tray Popup Menu */}
              {trayMenuOpen && (
                <div className="absolute bottom-12 right-6 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 space-y-1 text-xs text-slate-200 z-20">
                  <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-white">VoxA11y Desktop</span>
                    <span className="text-emerald-400">v0.1.0</span>
                  </div>

                  <button
                    onClick={onTogglePlay}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <span>{isPlaying && !isPaused ? 'Pauzeer Spraak' : 'Start Voorlezen'}</span>
                    <kbd className="text-[10px] text-slate-400 bg-slate-950 px-1 py-0.5 rounded">
                      Ctrl+Shift+Space
                    </kbd>
                  </button>

                  <button
                    onClick={onStop}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
                  >
                    Stop Onmiddellijk
                  </button>

                  <div className="px-3 py-1.5 text-[11px] text-slate-400 border-t border-slate-800">
                    <span>Snelheid: {settings.rateWpm} WPM</span>
                    <div className="flex items-center gap-1 mt-1">
                      {[120, 170, 220, 300].map((wpm) => (
                        <button
                          key={wpm}
                          onClick={() => onUpdateSettings({ rateWpm: wpm })}
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            settings.rateWpm === wpm
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {wpm}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={onSwitchToStudio}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-indigo-400 font-medium border-t border-slate-800 transition-colors"
                  >
                    Open Volledig Studio Venster
                  </button>

                  <button
                    onClick={() => {}}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-rose-950/40 text-rose-400 transition-colors"
                  >
                    Afsluiten
                  </button>
                </div>
              )}

              {/* Taskbar Strip */}
              <div className="h-12 bg-slate-900 border border-slate-800 rounded-xl px-4 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-300">
                    {osStyle === 'windows' ? 'Windows Taakbalk' : osStyle === 'macos' ? 'macOS Menubalk' : 'GNOME Paneel'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Systeemvak:</span>
                  {/* Tray icon */}
                  <button
                    onClick={() => setTrayMenuOpen(!trayMenuOpen)}
                    className="p-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/50 transition-colors"
                    title="VoxA11y Systeemvakicoon (Klik voor menu)"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-slate-300 text-[11px] ml-2">12:30</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: OS Accessibility Screen Reader HUD */}
      {activeGuiView === 'hud' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-semibold text-white text-sm">
                OS Accessibility Caret &amp; Screen Reader Visualizer
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time visualisatie van de schermcoördinaten waar de native engine de tekstmarkering tekent
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-mono">
              STATUS: HOOKED (60 FPS)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Coordinates Monitor Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-2.5">
              <span className="font-semibold text-indigo-400 font-sans text-xs">
                Actieve Caret Coördinaten
              </span>
              <div className="flex justify-between text-slate-400">
                <span>Screen X:</span>
                <span className="text-white">480 px</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Screen Y:</span>
                <span className="text-white">240 px</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Bounding Width:</span>
                <span className="text-white">128 px</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Bounding Height:</span>
                <span className="text-white">28 px</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Actief Woord:</span>
                <span className="text-emerald-400 font-bold">"{currentWordText || 'snelheid'}"</span>
              </div>
            </div>

            {/* Active Subsystem Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2.5">
              <span className="font-semibold text-indigo-400 text-xs">
                Actief OS Subsyteem
              </span>
              <div className="space-y-1.5 text-slate-400 text-[11px]">
                <div>
                  <strong className="text-slate-200">OS: </strong>
                  <span>{osStyle === 'windows' ? 'Windows 11 x64' : osStyle === 'macos' ? 'macOS Sonoma (Darwin)' : 'Linux x86_64'}</span>
                </div>
                <div>
                  <strong className="text-slate-200">API: </strong>
                  <span>{osStyle === 'windows' ? 'UI Automation Core' : osStyle === 'macos' ? 'AXUIElement' : 'AT-SPI2 D-Bus'}</span>
                </div>
                <div>
                  <strong className="text-slate-200">TTS Engine: </strong>
                  <span>{selectedVoice.engine} ({selectedVoice.name})</span>
                </div>
                <div>
                  <strong className="text-slate-200">Latency: </strong>
                  <span className="text-emerald-400">&lt; 35 ms</span>
                </div>
              </div>
            </div>

            {/* Highlights Style Indicator */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2.5">
              <span className="font-semibold text-indigo-400 text-xs">
                Actieve Visuele Overlay Stijl
              </span>
              <div className="space-y-2 text-slate-300 text-[11px]">
                <div className="flex items-center justify-between">
                  <span>Markeerstijl:</span>
                  <span className="font-medium text-white capitalize">{visualSettings.highlightStyle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Thema:</span>
                  <span className="font-medium text-white capitalize">{visualSettings.theme}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Randdikte:</span>
                  <span className="font-mono text-white">{visualSettings.borderWidth}px</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
