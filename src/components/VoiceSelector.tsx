import React, { useState, useMemo } from 'react';
import { Languages, Sparkles, User, Globe, Check } from 'lucide-react';
import { VoiceGender, VoiceItem } from '../types/tts';
import { getDynamicLanguagesFromVoices, voiceMatchesLang } from '../utils/languageHelper';

interface VoiceSelectorProps {
  voices: VoiceItem[];
  selectedVoice: VoiceItem;
  onSelectVoice: (voice: VoiceItem) => void;
  autoDetectLang: boolean;
  onToggleAutoDetect: (enabled: boolean) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoice,
  onSelectVoice,
  autoDetectLang,
  onToggleAutoDetect,
}) => {
  const [langFilter, setLangFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [neuralOnly, setNeuralOnly] = useState<boolean>(false);

  const dynamicLanguages = useMemo(() => {
    return getDynamicLanguagesFromVoices(voices);
  }, [voices]);

  const filteredVoices = voices.filter((v) => {
    if (langFilter !== 'all' && !voiceMatchesLang(v, langFilter)) return false;
    if (genderFilter !== 'all' && v.gender !== genderFilter) return false;
    if (neuralOnly && !v.isNeural) return false;
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 space-y-4">
      {/* Header and Auto-Detect Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-sm text-white">Stembibliotheek & Meertaligheid</span>
          <span className="text-xs text-slate-400 font-mono">({voices.length} stemmen)</span>
        </div>

        <label className="flex items-center gap-2 text-xs cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={autoDetectLang}
            onChange={(e) => onToggleAutoDetect(e.target.checked)}
            className="rounded text-indigo-500"
          />
          <span>Automatische taaldetectie & Code-switching</span>
        </label>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Language Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setLangFilter('all')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
              langFilter === 'all'
                ? 'bg-indigo-600 text-white font-medium'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Alle Talen ({voices.length})
          </button>
          {dynamicLanguages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLangFilter(l.code)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors flex items-center gap-1 ${
                langFilter === l.code
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{l.fullLabel}</span>
              <span className="text-[10px] opacity-75 font-mono">({l.count})</span>
            </button>
          ))}
        </div>

        {/* Gender & Neural Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs rounded-md px-2 py-1 text-slate-300"
          >
            <option value="all">Alle Stemtypes</option>
            <option value="female">Vrouwelijk</option>
            <option value="male">Mannelijk</option>
            <option value="child">Kinderstem</option>
          </select>

          <button
            onClick={() => setNeuralOnly(!neuralOnly)}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 border transition-colors ${
              neuralOnly
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Alleen Neuraal</span>
          </button>
        </div>
      </div>

      {/* Voices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
        {filteredVoices.map((voice) => {
          const isSelected = selectedVoice.id === voice.id;
          return (
            <button
              key={voice.id}
              onClick={() => onSelectVoice(voice)}
              className={`p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-xs'
                  : 'bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-xs truncate">{voice.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
              </div>

              <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                <span className="bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700/60 font-mono">
                  {voice.lang}
                </span>
                <span className="capitalize">{voice.gender}</span>
                <span>·</span>
                <span>{voice.engine}</span>
                {voice.isNeural && (
                  <span className="text-amber-400 flex items-center gap-0.5 ml-auto">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Neural</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
