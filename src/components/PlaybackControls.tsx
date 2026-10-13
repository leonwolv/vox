import React, { useState } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Moon,
  Sliders,
  Volume2,
  Wind,
  Gauge,
  Mic,
} from 'lucide-react';
import { PlaybackSettings } from '../types/tts';

interface PlaybackControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onPrevSentence: () => void;
  onNextSentence: () => void;
  onPrevParagraph: () => void;
  onNextParagraph: () => void;
  settings: PlaybackSettings;
  onUpdateSettings: (newSettings: Partial<PlaybackSettings>) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  sleepTimerMinutes: number | null;
  onSetSleepTimer: (minutes: number | null) => void;
  onOpenVoiceCommands: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onResume,
  onStop,
  onPrevSentence,
  onNextSentence,
  onPrevParagraph,
  onNextParagraph,
  settings,
  onUpdateSettings,
  isLooping,
  onToggleLoop,
  sleepTimerMinutes,
  onSetSleepTimer,
  onOpenVoiceCommands,
}) => {
  const [showPauseConfig, setShowPauseConfig] = useState(false);

  const speedPresets = [
    { label: '80 Zeer langzaam', wpm: 80 },
    { label: '120 Langzaam', wpm: 120 },
    { label: '170 Normaal', wpm: 170 },
    { label: '220 Snel', wpm: 220 },
    { label: '300+ Zeer snel', wpm: 320 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 text-slate-100 shadow-sm space-y-4">
      {/* Primary Transport Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Playback action buttons */}
        <div className="flex items-center gap-2">
          {/* Paragraph step back */}
          <button
            onClick={onPrevParagraph}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Vorige alinea (Ctrl+Up)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Sentence step back */}
          <button
            onClick={onPrevSentence}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Vorige zin (Ctrl+Left)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Main Play / Pause Button */}
          {!isPlaying || isPaused ? (
            <button
              onClick={isPaused ? onResume : onPlay}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-sm transition-colors"
              title="Play (Ctrl+Shift+Space)"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isPaused ? 'Hervat' : 'Afspelen'}</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 font-semibold text-white shadow-sm transition-colors"
              title="Pauze (Ctrl+Shift+Space)"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pauzeren</span>
            </button>
          )}

          {/* Stop Button */}
          <button
            onClick={onStop}
            disabled={!isPlaying && !isPaused}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 hover:text-rose-400 text-slate-400 disabled:opacity-40 transition-colors"
            title="Stop onmiddellijk"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          {/* Sentence step forward */}
          <button
            onClick={onNextSentence}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Volgende zin (Ctrl+Right)"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Paragraph step forward */}
          <button
            onClick={onNextParagraph}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Volgende alinea (Ctrl+Down)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Secondary options: Loop, Sleep Timer, Voice commands, Pause config */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Loop toggle */}
          <button
            onClick={onToggleLoop}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium ${
              isLooping
                ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Herhaalmodus (Loop)"
          >
            <Repeat className="w-4 h-4" />
            <span className="hidden sm:inline">Loop</span>
          </button>

          {/* Sleep Timer */}
          <div className="relative">
            <select
              value={sleepTimerMinutes ?? ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value, 10) : null;
                onSetSleepTimer(val);
              }}
              className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2.5 py-2 text-slate-300 hover:text-white focus:outline-none"
              title="Slaaptimer"
            >
              <option value="">Timer: Uit</option>
              <option value="5">Timer: 5 min</option>
              <option value="15">Timer: 15 min</option>
              <option value="30">Timer: 30 min</option>
              <option value="60">Timer: 60 min</option>
            </select>
          </div>

          {/* Voice Commands */}
          <button
            onClick={onOpenVoiceCommands}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Spraakgestuurde bediening (Voice Commands)"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Voice Control</span>
          </button>

          {/* Pause Settings Toggle */}
          <button
            onClick={() => setShowPauseConfig(!showPauseConfig)}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium ${
              showPauseConfig
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Configureer leesteken pauzes en ademhaling"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Pauzes & Ademhaling</span>
          </button>
        </div>
      </div>

      {/* Speed, Pitch and Volume Control Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-slate-800/80 text-xs">
        {/* Speed (WPM) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              <span>Snelheid (50-500 WPM)</span>
            </span>
            <span className="font-mono text-indigo-400 font-semibold">{settings.rateWpm} WPM</span>
          </div>
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={settings.rateWpm}
            onChange={(e) => onUpdateSettings({ rateWpm: parseInt(e.target.value, 10) })}
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            {speedPresets.map((preset) => (
              <button
                key={preset.wpm}
                onClick={() => onUpdateSettings({ rateWpm: preset.wpm })}
                className={`hover:text-slate-300 transition-colors ${
                  settings.rateWpm === preset.wpm ? 'text-indigo-400 font-bold' : ''
                }`}
              >
                {preset.wpm}
              </button>
            ))}
          </div>
        </div>

        {/* Pitch (-10 to +10) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Toonhoogte (-10 tot +10)</span>
            </span>
            <span className="font-mono text-amber-400 font-semibold">
              {settings.pitch > 0 ? `+${settings.pitch}` : settings.pitch}
            </span>
          </div>
          <input
            type="range"
            min={-10}
            max={10}
            step={1}
            value={settings.pitch}
            onChange={(e) => onUpdateSettings({ pitch: parseInt(e.target.value, 10) })}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <button onClick={() => onUpdateSettings({ pitch: -10 })}>Diep (-10)</button>
            <button onClick={() => onUpdateSettings({ pitch: 0 })}>Neutraal (0)</button>
            <button onClick={() => onUpdateSettings({ pitch: 10 })}>Hoog (+10)</button>
          </div>
        </div>

        {/* Volume (0-100%) and Ducking */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Volume & Ducking</span>
            </span>
            <span className="font-mono text-emerald-400 font-semibold">{settings.volume}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={settings.volume}
            onChange={(e) => onUpdateSettings({ volume: parseInt(e.target.value, 10) })}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <div className="flex items-center justify-between text-[10px]">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
              <input
                type="checkbox"
                checked={settings.ducking}
                onChange={(e) => onUpdateSettings({ ducking: e.target.checked })}
                className="rounded text-indigo-500"
              />
              <span>Auto Audio Ducking</span>
            </label>
            <span className="text-slate-500">Systeemmix</span>
          </div>
        </div>
      </div>

      {/* Expandable Pause & Breathing Configuration Subpanel */}
      {showPauseConfig && (
        <div className="pt-4 border-t border-slate-800 bg-slate-950/60 -mx-4 -mb-4 p-4 rounded-b-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span>Pauze-instellingen bij Interpunctie & Ademhaling</span>
            </div>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={settings.breathingSimulation}
                onChange={(e) => onUpdateSettings({ breathingSimulation: e.target.checked })}
                className="rounded text-cyan-500"
              />
              <span>Ademhalings-simulatie</span>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Komma (,)</span>
                <span className="font-mono text-cyan-400">{settings.pauseCommaMs}ms</span>
              </div>
              <input
                type="range"
                min={100}
                max={500}
                step={25}
                value={settings.pauseCommaMs}
                onChange={(e) => onUpdateSettings({ pauseCommaMs: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-500 h-1 bg-slate-700 rounded"
              />
            </div>

            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Punt (.)</span>
                <span className="font-mono text-cyan-400">{settings.pausePeriodMs}ms</span>
              </div>
              <input
                type="range"
                min={200}
                max={1000}
                step={50}
                value={settings.pausePeriodMs}
                onChange={(e) => onUpdateSettings({ pausePeriodMs: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-500 h-1 bg-slate-700 rounded"
              />
            </div>

            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Vraag/Uitroep (?!)</span>
                <span className="font-mono text-cyan-400">{settings.pauseExclamationQuestionMs}ms</span>
              </div>
              <input
                type="range"
                min={300}
                max={1200}
                step={50}
                value={settings.pauseExclamationQuestionMs}
                onChange={(e) => onUpdateSettings({ pauseExclamationQuestionMs: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-500 h-1 bg-slate-700 rounded"
              />
            </div>

            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Alinea-pauze</span>
                <span className="font-mono text-cyan-400">{settings.pauseParagraphMs}ms</span>
              </div>
              <input
                type="range"
                min={500}
                max={2000}
                step={100}
                value={settings.pauseParagraphMs}
                onChange={(e) => onUpdateSettings({ pauseParagraphMs: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-500 h-1 bg-slate-700 rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
