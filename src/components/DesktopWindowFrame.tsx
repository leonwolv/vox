import React, { useState } from 'react';
import {
  Minus,
  Square,
  X,
  Volume2,
  Monitor,
  Command,
  Shield,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface DesktopWindowFrameProps {
  osStyle: 'windows' | 'macos' | 'linux';
  setOsStyle: (style: 'windows' | 'macos' | 'linux') => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

export const DesktopWindowFrame: React.FC<DesktopWindowFrameProps> = ({
  osStyle,
  setOsStyle,
  isMaximized,
  onToggleMaximize,
  onMinimize,
  onClose,
}) => {
  return (
    <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs text-slate-300 select-none">
      {/* Left side: OS window controls or brand badge */}
      <div className="flex items-center gap-3">
        {osStyle === 'macos' ? (
          /* macOS Traffic Lights */
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-rose-500 hover:brightness-110 flex items-center justify-center group"
              title="Sluiten"
            >
              <X className="w-2 h-2 text-rose-950 opacity-0 group-hover:opacity-100" />
            </button>
            <button
              onClick={onMinimize}
              className="w-3 h-3 rounded-full bg-amber-500 hover:brightness-110 flex items-center justify-center group"
              title="Minimaliseren naar dock"
            >
              <Minus className="w-2 h-2 text-amber-950 opacity-0 group-hover:opacity-100" />
            </button>
            <button
              onClick={onToggleMaximize}
              className="w-3 h-3 rounded-full bg-emerald-500 hover:brightness-110 flex items-center justify-center group"
              title="Maximaliseren"
            >
              <Square className="w-1.5 h-1.5 text-emerald-950 opacity-0 group-hover:opacity-100" />
            </button>
          </div>
        ) : null}

        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-semibold text-slate-200">VoxA11y Desktop</span>
          <span>—</span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Cross-Platform Rust &amp; OS Accessibility Runtime
          </span>
        </div>
      </div>

      {/* Center: Desktop Environment Selector */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">OS Frame:</span>
        <select
          value={osStyle}
          onChange={(e) => setOsStyle(e.target.value as any)}
          className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
        >
          <option value="windows" className="bg-slate-900">Windows 11 (Fluent / SAPI 5)</option>
          <option value="macos" className="bg-slate-900">macOS Sonoma (Cocoa / AVSpeech)</option>
          <option value="linux" className="bg-slate-900">Linux (GNOME / AT-SPI2)</option>
        </select>
      </div>

      {/* Right side: Global hotkey indicator and Windows/Linux control buttons */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
          <Shield className="w-3 h-3" />
          <span>Systeemvak &amp; Sneltoets Actief (Ctrl+Shift+Space)</span>
        </div>

        {osStyle !== 'macos' && (
          <div className="flex items-center -mr-2">
            <button
              onClick={onMinimize}
              className="px-3 py-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Minimaliseren"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggleMaximize}
              className="px-3 py-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Maximaliseren / Venster herstellen"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-slate-400 hover:text-white hover:bg-rose-700 transition-colors"
              title="Sluiten"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
