import React from 'react';
import { Eye, Palette, Sparkles, Type } from 'lucide-react';
import { ColorTheme, HighlightStyle, VisualSettings } from '../types/tts';

interface VisualSettingsPanelProps {
  settings: VisualSettings;
  onUpdate: (newSettings: Partial<VisualSettings>) => void;
}

export const VisualSettingsPanel: React.FC<VisualSettingsPanelProps> = ({
  settings,
  onUpdate,
}) => {
  const highlightStyles: { id: HighlightStyle; label: string }[] = [
    { id: 'background', label: 'Achtergrondkleur' },
    { id: 'underline-single', label: 'Enkel onderstreept' },
    { id: 'underline-double', label: 'Dubbel onderstreept' },
    { id: 'underline-wavy', label: 'Golvend onderstreept' },
    { id: 'bordered', label: 'Omkaderd kader' },
    { id: 'bold-italic', label: 'Vet & Cursief' },
  ];

  const colorThemes: { id: ColorTheme; label: string; bg: string; fg: string }[] = [
    { id: 'dyslexia', label: 'Dyslexie Beige / Nachtblauw', bg: '#FAF6EE', fg: '#1A2B4C' },
    { id: 'high-contrast-yellow', label: 'Hoog Contrast Geel / Zwart', bg: '#000000', fg: '#FFE600' },
    { id: 'high-contrast-cyan', label: 'Hoog Contrast Cyaan / Zwart', bg: '#000000', fg: '#00F0FF' },
    { id: 'slate-dark', label: 'Donker Leisteen', bg: '#0F172A', fg: '#F8FAFC' },
    { id: 'clean-light', label: 'Helder Wit', bg: '#FFFFFF', fg: '#0F172A' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-semibold text-sm text-white">
          <Palette className="w-4 h-4 text-indigo-400" />
          <span>Visuele Weergave & Dyslexie Instellingen</span>
        </div>
        <span className="text-xs text-slate-400">WCAG AAA Geoptimaliseerd</span>
      </div>

      {/* Kleurenschema Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span>Kleurenschema & Toegankelijkheidsprofiel</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          {colorThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onUpdate({ theme: theme.id })}
              className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                settings.theme === theme.id
                  ? 'border-indigo-500 bg-indigo-950/30 text-white shadow-xs'
                  : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span className="font-medium truncate pr-2">{theme.label}</span>
              <div
                className="w-5 h-5 rounded-md border border-slate-600 shrink-0"
                style={{ backgroundColor: theme.bg }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-xs m-1"
                  style={{ backgroundColor: theme.fg }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamische Woordmarkering Stijl */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Dynamische Woordmarkering Stijl</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {highlightStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => onUpdate({ highlightStyle: style.id })}
              className={`p-2 rounded-lg border text-left transition-colors font-medium ${
                settings.highlightStyle === style.id
                  ? 'border-indigo-500 bg-indigo-950/30 text-white'
                  : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-400'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Markering Kleur en Randdikte */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
        {/* Highlight Color */}
        <div className="space-y-1.5">
          <span className="text-slate-400">Markeerkleur</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.highlightColor}
              onChange={(e) => onUpdate({ highlightColor: e.target.value })}
              className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={settings.highlightColor}
              onChange={(e) => onUpdate({ highlightColor: e.target.value })}
              className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-xs w-24 font-mono"
            />
          </div>
        </div>

        {/* Border Width */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Rand/Lijndikte</span>
            <span className="font-mono text-indigo-400">{settings.borderWidth}px</span>
          </div>
          <input
            type="range"
            min={1}
            max={4}
            step={1}
            value={settings.borderWidth}
            onChange={(e) => onUpdate({ borderWidth: parseInt(e.target.value, 10) })}
            className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded"
          />
        </div>

        {/* Font Size */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Tekstgrootte</span>
            <span className="font-mono text-indigo-400">{settings.fontSize}px</span>
          </div>
          <input
            type="range"
            min={14}
            max={28}
            step={1}
            value={settings.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value, 10) })}
            className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded"
          />
        </div>
      </div>

      {/* Zin en Alinea Tracking Opties */}
      <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={settings.sentenceHighlight}
            onChange={(e) => onUpdate({ sentenceHighlight: e.target.checked })}
            className="rounded text-indigo-500"
          />
          <span>Huidige zin accentueren</span>
        </label>

        <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={settings.fadeOutReadText}
            onChange={(e) => onUpdate({ fadeOutReadText: e.target.checked })}
            className="rounded text-indigo-500"
          />
          <span>Reeds gelezen tekst dimmen (Fade-out)</span>
        </label>

        <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={settings.nextSentencePreview}
            onChange={(e) => onUpdate({ nextSentencePreview: e.target.checked })}
            className="rounded text-indigo-500"
          />
          <span>Preview balk volgende zin tonen</span>
        </label>
      </div>

      {/* Typografie & Spatiëring */}
      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <Type className="w-4 h-4 text-slate-500" />
          <span>Regelafstand:</span>
          <button
            onClick={() => onUpdate({ lineSpacing: 1.5 })}
            className={`px-2 py-1 rounded ${settings.lineSpacing === 1.5 ? 'bg-indigo-600 text-white' : 'bg-slate-800'}`}
          >
            1.5
          </button>
          <button
            onClick={() => onUpdate({ lineSpacing: 1.8 })}
            className={`px-2 py-1 rounded ${settings.lineSpacing === 1.8 ? 'bg-indigo-600 text-white' : 'bg-slate-800'}`}
          >
            1.8 (Dyslexie aanbevolen)
          </button>
          <button
            onClick={() => onUpdate({ lineSpacing: 2.1 })}
            className={`px-2 py-1 rounded ${settings.lineSpacing === 2.1 ? 'bg-indigo-600 text-white' : 'bg-slate-800'}`}
          >
            2.1 Ruim
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span>Letterspatiëring:</span>
          <button
            onClick={() => onUpdate({ letterSpacing: 0 })}
            className={`px-2 py-1 rounded ${settings.letterSpacing === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-800'}`}
          >
            Normaal
          </button>
          <button
            onClick={() => onUpdate({ letterSpacing: 0.05 })}
            className={`px-2 py-1 rounded ${settings.letterSpacing === 0.05 ? 'bg-indigo-600 text-white' : 'bg-slate-800'}`}
          >
            +0.05em
          </button>
          <button
            onClick={() => onUpdate({ letterSpacing: 0.1 })}
            className={`px-2 py-1 rounded ${settings.letterSpacing === 0.1 ? 'bg-indigo-600 text-white' : 'bg-slate-800'}`}
          >
            +0.1em
          </button>
        </div>
      </div>
    </div>
  );
};
