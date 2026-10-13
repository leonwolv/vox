import { DocumentItem } from '../types/tts';

export const SAMPLE_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-spec-word',
    title: 'TTS Architectuur & Toegankelijkheid (Word)',
    type: 'word',
    author: 'Ir. M. van Dijk',
    sourceInfo: 'Microsoft Word 365 (DOCX met Track Changes & Voetnoten)',
    content: `Hoofdstuk 1: Tekst-naar-spraak engine architectuur voor Windows, macOS en Linux.

Deze geavanceerde TTS-engine is gebaseerd op concatenatieve en parametrische synthesemethoden. Het systeem ondersteunt meerdere spraaksynthesizers simultaan, waaronder Microsoft SAPI 5, Apple AVFoundation AVSpeechSynthesizer, en Linux Speech Dispatcher.

Afspeelparameters en regelbereik:
De standaard spreeksnelheid is ingesteld op 175 woorden per minuut (WPM), met een instelbaar bereik van 50 tot 500 WPM in stappen van 10 WPM. Toonhoogte-aanpassing is mogelijk tussen -10 en +10. De volume-controle is onafhankelijk regelbaar van 0% tot 100%, met automatische audio-ducking van achtergrondgeluiden tijdens spraakuitvoer.

Contextgevoelige detectie van getallen en datums:
Op 01-01-2025 bedroeg de totale subsidie €50,00 per licentie en ontvingen ca. 1200 studenten extra ondersteuning. In 1984 publiceerde George Orwell zijn meesterwerk, maar in 2026 telt ons netwerk meer dan 1984 actieve knooppunten. De vergadering start om 14:30 stipt.

Toegankelijkheid en sneltoetsen:
Gebruikers kunnen het afspelen bedienen via sneltoetsen: Play/Pauze met Ctrl+Shift+Space, vorige en volgende zin met Ctrl+Pijl Links en Pijl Rechts. Bovendien biedt de zwevende toolbar een transparantie van 10% tot 100% voor niet-intrusieve schermweergave.`,
  },
  {
    id: 'doc-web-article',
    title: 'Web Content Accessibility (DOM Extractor)',
    type: 'browser',
    author: 'W3C Web Accessibility Initiative',
    sourceInfo: 'HTML5 DOM (Advertenties en navigatie overgeslagen)',
    content: `Toegankelijke Digitale Ervaringen voor Iedereen.

Het web is fundamenteel ontworpen om voor alle mensen te werken, ongeacht hardware, software, taal, locatie of vaardigheid. Wanneer het web aan dit doel voldoet, is het toegankelijk voor mensen met een breed spectrum van auditieve, motorische, visuele en cognitieve vermogens.

Woord-voor-woord visuele markering:
Voor lezers met dyslexie verhoogt synchrone tekstmarkering het begrip met gemiddeld 34%. Door gebruik te maken van een beige achtergrond en nachtblauw contrast wordt visuele stress geminimaliseerd.

Multimodale interactie:
Gebruikers kunnen schakelen tussen stemcommando's zoals "Lees voor", "Stop", "Langzamer", en "Sneller", of traditionele toetsenbordnavigatie. De ingebouwde privacy-waarborg garandeert dat alle spraaksynthese lokaal op het apparaat wordt verwerkt zonder dataoverdracht naar cloudservers.`,
  },
  {
    id: 'doc-email-client',
    title: 'E-mail: Kwartaalverslag Toegankelijkheid',
    type: 'email',
    author: 'Directie Digitale Inclusie <directie@overheid.nl>',
    sourceInfo: 'Inkomend E-mailbericht (met bijlage verslag.pdf)',
    content: `Onderwerp: Voortgang implementatie Tekst-naar-Spraak conform Europese Toegankelijkheidsakte.
Afzender: directie@overheid.nl
Datum: 12-10-2026 om 09:15

Geachte collega's,

Hierbij ontvangt u de nieuwste update m.b.t. de landelijke uitrol van onze cross-platform TTS-toegankelijkheidsengine. Zoals afgesproken zijn alle vereiste taalpakketten geïnstalleerd, inclusief Nederlands, Engels, Frans en Duits.

De licentiekosten bedragen €12,50 per werkplek. Gelieve eventuele correcties z.s.m. door te geven t.a.v. de helpdesk. In bijlage vindt u het volledige rapport in PDF/UA formaat.

Met vriendelijke groet,
Team Digitale Toegankelijkheid`,
  },
  {
    id: 'doc-pdf-reader',
    title: 'PDF Document: Financiële & Technische Specificatie',
    type: 'pdf',
    author: 'Bureau Toegankelijke Software',
    sourceInfo: 'Tagged PDF (PDF/UA 2-koloms extractie)',
    content: `Paragraaf 1. Doelstellingen en Scope.
De implementatie in Rust voorziet in directe koppelingen met native besturingssysteem accessibility architecturen. Op Windows wordt IUIAutomation aangeroepen via de Windows Crate, op macOS de AXUIElement API, en op Linux de AT-SPI2 D-Bus bus.

Paragraaf 2. Audio-Export en Synchronisatie.
De software ondersteunt audio-export in WAV (16-bit en 24-bit PCM) en streaming formaten. ID3-metadata wordt automatisch ingebed, inclusief hoofdstukmarkers en gesynchroniseerde SRT en LRC karaoke-bestanden voor karaoke-achtige weergave.`,
  },
];
