import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, Sparkles, BookOpen, Volume2, Check } from 'lucide-react';
import { LexiconEntry } from '../types/tts';
import { normalizeText } from '../utils/normalizer';

interface NormalizerLabProps {
  lexicon: LexiconEntry[];
  onAddLexiconEntry: (entry: Omit<LexiconEntry, 'id'>) => void;
  onRemoveLexiconEntry: (id: string) => void;
  onSpeakText: (text: string) => void;
}

export const NormalizerLab: React.FC<NormalizerLabProps> = ({
  lexicon,
  onAddLexiconEntry,
  onRemoveLexiconEntry,
  onSpeakText,
}) => {
  const [inputText, setInputText] = useState(
    'In 1984 kostte een boek ca. €12,50, maar op 01-01-2025 bedroeg de subsidie €50,00 voor 1984 studenten. De FBI en de AIVD vergaderen om 14:30 stipt m.b.t. de beveiliging van het NAVO verdrag.'
  );

  const [newPattern, setNewPattern] = useState('');
  const [newReplacement, setNewReplacement] = useState('');
  const [newCategory, setNewCategory] = useState<'afkorting' | 'valuta' | 'uitspraak' | 'acroniem'>('afkorting');

  const normalizedOutput = normalizeText(inputText, lexicon);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPattern.trim() || !newReplacement.trim()) return;

    onAddLexiconEntry({
      pattern: newPattern.trim(),
      replacement: newReplacement.trim(),
      isRegex: false,
      matchWholeWord: true,
      category: newCategory,
    });

    setNewPattern('');
    setNewReplacement('');
  };

  const samplePresets = [
    {
      title: 'Valuta & Getallen',
      text: 'Het ticket kost €50,00 per volwassene en €12,50 voor kinderen. In totaal zijn er 2500 tickets verkocht.',
    },
    {
      title: 'Jaartallen vs Aantallen',
      text: 'In 1984 verscheen het boek, en in het jaar 2026 telde de club precies 1984 geregistreerde leden.',
    },
    {
      title: 'Datums & Tijden',
      text: 'De inspectie vindt plaats op 01-01-2025 om 14:30 uur, met een tweede zitting om 08:15 uur.',
    },
    {
      title: 'Afkortingen & Acroniemen',
      text: 'Gelieve bijv. ca. 5 exemplaren z.s.m. op te sturen naar de FBI en de AIVD i.v.m. de NAVO top.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Presets */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-white text-base">
              Contextgevoelige Tekstnormalisator (Dutch NLP Pipeline)
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Intelligente conversie van valuta, datums, tijden, jaartallen en afkortingen
          </span>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Snelle tests:</span>
          {samplePresets.map((p) => (
            <button
              key={p.title}
              onClick={() => setInputText(p.text)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Raw Input Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Oorspronkelijke Tekst (Ruwe invoer)
            </label>
            <span className="text-xs text-slate-500 font-mono">{inputText.length} tekens</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={6}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
            placeholder="Typ of plak hier een tekst met bijv., €50,00, 01-01-2025, 14:30..."
          />
        </div>

        {/* Normalized Output Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Genormaliseerde Spraaktekst (TTS Output)</span>
            </label>
            <button
              onClick={() => onSpeakText(normalizedOutput)}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Beluister Uitspraak</span>
            </button>
          </div>
          <div className="w-full min-h-[148px] bg-slate-950 border border-indigo-900/40 rounded-lg p-3 text-sm text-indigo-100 leading-relaxed font-sans select-all">
            {normalizedOutput}
          </div>
        </div>
      </div>

      {/* Uitspraakwoordenboek (Lexicon Editor) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white text-sm">
              Gebruiker-definieerbaar Uitspraakwoordenboek (Lexicon)
            </span>
            <span className="text-xs text-slate-400 font-mono">({lexicon.length} regels)</span>
          </div>
        </div>

        {/* Add Entry Form */}
        <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-3 text-xs">
          <input
            type="text"
            placeholder="Patroon / Woord (bijv. kvk, z.s.m.)"
            value={newPattern}
            onChange={(e) => setNewPattern(e.target.value)}
            className="flex-1 min-w-[160px] bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
          <input
            type="text"
            placeholder="Vervangende uitspraak (bijv. kamer van koophandel)"
            value={newReplacement}
            onChange={(e) => setNewReplacement(e.target.value)}
            className="flex-1 min-w-[200px] bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300"
          >
            <option value="afkorting">Afkorting</option>
            <option value="acroniem">Acroniem (per letter)</option>
            <option value="uitspraak">Eigen Woord</option>
            <option value="valuta">Valuta</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Regel Toevoegen</span>
          </button>
        </form>

        {/* Existing Entries Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pt-2">
          {lexicon.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5 truncate pr-2">
                <div className="font-mono text-slate-300 font-semibold truncate">{item.pattern}</div>
                <div className="text-indigo-400 truncate">→ {item.replacement}</div>
              </div>
              <button
                onClick={() => onRemoveLexiconEntry(item.id)}
                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
                title="Verwijder regel"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
