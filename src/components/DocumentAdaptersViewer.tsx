import React, { useState } from 'react';
import {
  FileText,
  Globe,
  Mail,
  FileCheck,
  Columns,
  Table,
  Paperclip,
  ShieldCheck,
  Play,
} from 'lucide-react';

interface DocumentAdaptersViewerProps {
  onLoadIntoReader: (title: string, content: string, type: string) => void;
}

export const DocumentAdaptersViewer: React.FC<DocumentAdaptersViewerProps> = ({
  onLoadIntoReader,
}) => {
  const [activeAdapter, setActiveAdapter] = useState<'word' | 'browser' | 'email' | 'pdf'>('word');
  const [includeFootnotes, setIncludeFootnotes] = useState(true);
  const [includeTrackChanges, setIncludeTrackChanges] = useState(true);
  const [skipWebAds, setSkipWebAds] = useState(true);
  const [skipWebNav, setSkipWebNav] = useState(true);

  return (
    <div className="space-y-6">
      {/* Adapter selector tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold text-white text-sm">
            Applicatie-Specifieke Tekstextractie Adapters
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveAdapter('word')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeAdapter === 'word' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Microsoft Word
          </button>
          <button
            onClick={() => setActiveAdapter('browser')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeAdapter === 'browser' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Web Browser DOM
          </button>
          <button
            onClick={() => setActiveAdapter('email')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeAdapter === 'email' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            E-mail Client
          </button>
          <button
            onClick={() => setActiveAdapter('pdf')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeAdapter === 'pdf' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            PDF / Kolomdetectie
          </button>
        </div>
      </div>

      {/* Word Adapter View */}
      {activeAdapter === 'word' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-semibold text-white text-base">Microsoft Word Native COM/OpenXML Adapter</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ondersteuning voor track changes revisies, cel-voor-cel tabelnavigatie en voetnoten
              </p>
            </div>
            <button
              onClick={() =>
                onLoadIntoReader(
                  'Project_Specificaties_2026.docx',
                  'Hoofdstuk 1: Tekst-naar-spraak engine architectuur voor Windows, macOS en Linux. De engine integreert direct met de ingebouwde accessibility interfaces. Tabelparameter: WPM snelheid bereik 50 tot 500 met standaard 175 WPM. Voetnoot 1: Zie Microsoft UI Automation standaarden.',
                  'word'
                )
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Laad in Voorlezer</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTrackChanges}
                onChange={(e) => setIncludeTrackChanges(e.target.checked)}
                className="rounded text-indigo-500"
              />
              <span>Track Changes (wijzigingen bijhouden) meelezen</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeFootnotes}
                onChange={(e) => setIncludeFootnotes(e.target.checked)}
                className="rounded text-indigo-500"
              />
              <span>Voetnoten en eindnoten voorlezen</span>
            </label>
          </div>

          {/* Interactive Document Simulation */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400">
              <Table className="w-4 h-4" />
              <span>Tabel-navigatie (Rij-voor-rij en Cel-voor-cel akoestische markering):</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-2 px-3">Parameter</th>
                    <th className="py-2 px-3">Bereik</th>
                    <th className="py-2 px-3">Standaardwaarde</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  <tr className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2 px-3 font-medium text-slate-200">Snelheid</td>
                    <td className="py-2 px-3">50 - 500 WPM</td>
                    <td className="py-2 px-3">175 WPM</td>
                    <td className="py-2 px-3 text-emerald-400">Geverifieerd</td>
                  </tr>
                  <tr className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2 px-3 font-medium text-slate-200">Toonhoogte</td>
                    <td className="py-2 px-3">-10 tot +10</td>
                    <td className="py-2 px-3">0</td>
                    <td className="py-2 px-3 text-emerald-400">Geverifieerd</td>
                  </tr>
                  <tr className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2 px-3 font-medium text-slate-200">Audio Ducking</td>
                    <td className="py-2 px-3">Aan / Uit</td>
                    <td className="py-2 px-3">Aan (-12 dB)</td>
                    <td className="py-2 px-3 text-emerald-400">Actief</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {includeTrackChanges && (
              <div className="p-3 rounded bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
                <span>[Track Change door Auteur: "automatische audio-ducking toegevoegd"]</span>
                <span className="font-mono text-[10px] text-amber-400">Revisie v1.4</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Browser DOM Adapter */}
      {activeAdapter === 'browser' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-semibold text-white text-base">Web Browser DOM Extractor & Readability Filter</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatische herkenning van hoofdinhoud, overslaan van banneradvertenties, navigatiemenu's en cookie popups
              </p>
            </div>
            <button
              onClick={() =>
                onLoadIntoReader(
                  'Web: Toegankelijkheid op het Internet',
                  'Het web is fundamenteel ontworpen om voor alle mensen te werken. Wanneer websites voldoen aan WCAG 2.2 richtlijnen, kunnen lezers met een screenreader of TTS hulpmiddel direct en zonder afleiding de hoofdtekst tot zich nemen.',
                  'browser'
                )
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Laad in Voorlezer</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={skipWebAds}
                onChange={(e) => setSkipWebAds(e.target.checked)}
                className="rounded text-indigo-500"
              />
              <span>Advertenties en tracking-elementen overslaan</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={skipWebNav}
                onChange={(e) => setSkipWebNav(e.target.checked)}
                className="rounded text-indigo-500"
              />
              <span>Navigatiebalken en footers overslaan</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-semibold text-rose-400">Overgeslagen Elementen (Noise Reduction):</span>
              <ul className="space-y-1 text-slate-400">
                <li>• 12x Navigatiekoppen &lt;nav&gt; (Home, Over Ons, Contact)</li>
                <li>• 3x Advertentiecontainers &lt;aside class="banner-ad"&gt;</li>
                <li>• 1x Cookie consent dialoog &lt;dialog id="cookie-banner"&gt;</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-slate-950 border border-indigo-900/50 space-y-2">
              <span className="font-semibold text-emerald-400">Gezuiverde Hoofdtekst (&lt;article&gt;):</span>
              <p className="text-slate-300 leading-relaxed">
                "Het web is fundamenteel ontworpen om voor alle mensen te werken. Wanneer websites voldoen aan WCAG 2.2 richtlijnen..."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email Adapter */}
      {activeAdapter === 'email' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-semibold text-white text-base">E-mail Client Integratie</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Gestructureerd voorlezen van afzender, onderwerp, datum, platte tekst en bijlage-aankondigingen
              </p>
            </div>
            <button
              onClick={() =>
                onLoadIntoReader(
                  'E-mail: Kwartaalverslag Toegankelijkheid',
                  'Onderwerp: Voortgang implementatie Tekst naar Spraak. Afzender: directie@overheid.nl. Bericht: Hierbij ontvangt u de nieuwste update met betrekking tot de landelijke uitrol. Bijlage gedetecteerd: verslag_toegankelijkheid.pdf.',
                  'email'
                )
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Laad in Voorlezer</span>
            </button>
          </div>

          <div className="p-5 rounded-lg bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-semibold text-slate-200">Van:</span>
              <span>Directie Digitale Inclusie &lt;directie@overheid.nl&gt;</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-semibold text-slate-200">Onderwerp:</span>
              <span className="text-indigo-400 font-medium">Voortgang implementatie Tekst-naar-Spraak engine</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400 bg-amber-950/20 p-2 rounded border border-amber-500/20">
              <Paperclip className="w-3.5 h-3.5" />
              <span>Bijlage aanwezig: "verslag_toegankelijkheid.pdf" (TTS zal audio-notificatie uitspreken)</span>
            </div>
            <div className="pt-2 text-slate-300 leading-relaxed border-t border-slate-800">
              "Hierbij ontvangt u de nieuwste update m.b.t. de landelijke uitrol van onze cross-platform TTS-toegankelijkheidsengine..."
            </div>
          </div>
        </div>
      )}

      {/* PDF Adapter */}
      {activeAdapter === 'pdf' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-semibold text-white text-base">PDF & Meerkoloms Document Extractie (PDF/UA)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Intelligente kolomvolgorde detectie, reconstructie van alinea's en ondersteuning voor getagde PDF/UA structuren
              </p>
            </div>
            <button
              onClick={() =>
                onLoadIntoReader(
                  'PDF Rapport: 2-Koloms Analyse',
                  'Kolom 1: De implementatie in Rust voorziet in directe koppelingen met native besturingssysteem accessibility architecturen. Kolom 2: De software ondersteunt audio export in WAV en gesynchroniseerde karaoke ondertiteling.',
                  'pdf'
                )
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Laad in Voorlezer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-cyan-400">
                <Columns className="w-4 h-4" />
                <span>Kolom 1 (Leesvolgorde #1)</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                De software in Rust voorziet in directe koppelingen met native besturingssysteem accessibility architecturen op Windows, macOS en Linux.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-cyan-400">
                <Columns className="w-4 h-4" />
                <span>Kolom 2 (Leesvolgorde #2)</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Hierdoor wordt voorkomen dat tekst van kolom 1 en kolom 2 door elkaar heen gelezen wordt, wat cruciaal is voor wetenschappelijke en juridische documenten.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>ISO 14289-1 (PDF/UA) Toegankelijkheidstag validatie: Volledig geslaagd</span>
          </div>
        </div>
      )}
    </div>
  );
};
