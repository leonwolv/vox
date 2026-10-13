import React from 'react';
import { Volume2, Play, Square, Code, Settings2, Sliders, FileText, Monitor, Layers, Mic } from 'lucide-react';

interface HeaderProps {
  activeTab: 'reader' | 'gui' | 'stt' | 'desktop' | 'normalizer' | 'adapters' | 'a11y' | 'rust';
  setActiveTab: (tab: 'reader' | 'gui' | 'stt' | 'desktop' | 'normalizer' | 'adapters' | 'a11y' | 'rust') => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isPlaying,
  onTogglePlay,
  onOpenExport,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
          <Volume2 className="w-4 h-4" />
        </div>
        <span className="text-base font-semibold tracking-tight text-white whitespace-nowrap">
          VoxA11y Desktop
        </span>
      </div>

      {/* Zone 2: Concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('gui')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'gui' ? 'text-white font-semibold' : 'text-slate-400'
          }`}
        >
          <Monitor className="w-4 h-4 text-indigo-400" />
          <span>Voorbeeld van de GUI</span>
        </button>

        <button
          onClick={() => setActiveTab('stt')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'stt' ? 'text-white font-semibold' : 'text-slate-400'
          }`}
        >
          <Mic className="w-4 h-4 text-emerald-400" />
          <span>Dicteren &amp; STT (Whisper)</span>
        </button>

        <button
          onClick={() => setActiveTab('reader')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'reader' ? 'text-white font-semibold' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Voorlezer &amp; Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('desktop')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'desktop' ? 'text-white font-semibold' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Bèta Installeren</span>
        </button>

        <button
          onClick={() => setActiveTab('normalizer')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'normalizer' ? 'text-white font-semibold' : 'text-slate-400'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>Normalisator</span>
        </button>

        <button
          onClick={() => setActiveTab('adapters')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'adapters' ? 'text-white font-semibold' : 'text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Document Lezers</span>
        </button>

        <button
          onClick={() => setActiveTab('rust')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
            activeTab === 'rust' ? 'text-white font-semibold' : 'text-slate-400'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Rust Broncode</span>
        </button>
      </nav>

      {/* Zone 3: Primary action button */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenExport}
          className="hidden sm:inline-flex px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap"
        >
          Exporteer Audio / SRT
        </button>

        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md shadow-sm transition-colors whitespace-nowrap ${
            isPlaying
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop (Ctrl+Shift+Space)</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Lees Voor</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
