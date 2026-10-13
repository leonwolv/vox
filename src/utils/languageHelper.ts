import { VoiceItem } from '../types/tts';

export interface DynamicLanguageOption {
  code: string; // e.g. 'nl', 'en', 'de'
  name: string; // e.g. 'Nederlands', 'Engels'
  shortLabel: string; // e.g. 'NL'
  fullLabel: string; // e.g. 'NL (Nederlands)'
  dropdownLabel: string; // e.g. 'NL (Nederlands) (5)'
  count: number;
}

// Well-known Dutch display names for common language codes
const KNOWN_LANG_NAMES: Record<string, { name: string; short: string }> = {
  nl: { name: 'Nederlands', short: 'NL' },
  en: { name: 'Engels', short: 'EN' },
  de: { name: 'Duits', short: 'DE' },
  fr: { name: 'Frans', short: 'FR' },
  es: { name: 'Spaans', short: 'ES' },
  it: { name: 'Italiaans', short: 'IT' },
  sv: { name: 'Zweeds', short: 'SV' },
  no: { name: 'Noors', short: 'NO' },
  nb: { name: 'Noors Bokmål', short: 'NO' },
  nn: { name: 'Nynorsk', short: 'NN' },
  da: { name: 'Deens', short: 'DA' },
  pt: { name: 'Portugees', short: 'PT' },
  pl: { name: 'Pools', short: 'PL' },
  ru: { name: 'Russisch', short: 'RU' },
  tr: { name: 'Turks', short: 'TR' },
  ja: { name: 'Japans', short: 'JA' },
  zh: { name: 'Chinees', short: 'ZH' },
  ko: { name: 'Koreaans', short: 'KO' },
  ar: { name: 'Arabisch', short: 'AR' },
  fi: { name: 'Fins', short: 'FI' },
  cs: { name: 'Tsjechisch', short: 'CS' },
  el: { name: 'Grieks', short: 'EL' },
  uk: { name: 'Oekraïens', short: 'UK' },
  hi: { name: 'Hindi', short: 'HI' },
  id: { name: 'Indonesisch', short: 'ID' },
  hu: { name: 'Hongaars', short: 'HU' },
  ro: { name: 'Roemeens', short: 'RO' },
};

/**
 * Normalizes voice language tag (e.g. 'nl-NL', 'nb-NO', 'en_US') to a primary 2-letter code.
 * Maps 'nb' and 'nn' to 'no' for Norwegian unification.
 */
export function normalizeLangCode(rawLang?: string): string {
  if (!rawLang) return 'nl';
  const clean = rawLang.replace(/_/g, '-').toLowerCase();
  const prefix = clean.split('-')[0];
  if (prefix === 'nb' || prefix === 'nn') return 'no';
  return prefix || 'nl';
}

/**
 * Checks if a voice matches a given normalized target language code.
 */
export function voiceMatchesLang(voice: VoiceItem, targetLangCode: string): boolean {
  if (!voice || !voice.lang) return false;
  const voiceCode = normalizeLangCode(voice.lang);
  if (targetLangCode === 'no') {
    return voiceCode === 'no' || voice.lang.toLowerCase().startsWith('nb') || voice.lang.toLowerCase().startsWith('nn');
  }
  return voiceCode === targetLangCode;
}

/**
 * Dynamically scans all currently available voices (including OS/browser voices)
 * and constructs an array of languages that are ACTUALLY available in the system.
 */
export function getDynamicLanguagesFromVoices(voices: VoiceItem[]): DynamicLanguageOption[] {
  if (!voices || voices.length === 0) {
    return [
      {
        code: 'nl',
        name: 'Nederlands',
        shortLabel: 'NL',
        fullLabel: 'NL (Nederlands)',
        dropdownLabel: 'NL (Nederlands) (0)',
        count: 0,
      },
    ];
  }

  // Count available voices per normalized language code
  const counts = new Map<string, number>();
  for (const v of voices) {
    const code = normalizeLangCode(v.lang);
    counts.set(code, (counts.get(code) || 0) + 1);
  }

  let intlDisplay: Intl.DisplayNames | null = null;
  try {
    if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
      intlDisplay = new Intl.DisplayNames(['nl'], { type: 'language' });
    }
  } catch {
    // Fallback if Intl.DisplayNames is not supported
  }

  const result: DynamicLanguageOption[] = [];

  counts.forEach((count, code) => {
    let name = KNOWN_LANG_NAMES[code]?.name;
    const short = KNOWN_LANG_NAMES[code]?.short || code.toUpperCase();

    if (!name && intlDisplay) {
      try {
        const intlName = intlDisplay.of(code);
        if (intlName) {
          name = intlName.charAt(0).toUpperCase() + intlName.slice(1);
        }
      } catch {
        // keep fallback
      }
    }

    if (!name) {
      name = code.toUpperCase();
    }

    result.push({
      code,
      name,
      shortLabel: short,
      fullLabel: `${short} (${name})`,
      dropdownLabel: `${short} · ${name} (${count})`,
      count,
    });
  });

  // Sort with Dutch ('nl') first, then English ('en'), then German, then alphabetical
  result.sort((a, b) => {
    if (a.code === 'nl') return -1;
    if (b.code === 'nl') return 1;
    if (a.code === 'en') return -1;
    if (b.code === 'en') return 1;
    if (a.code === 'de') return -1;
    if (b.code === 'de') return 1;
    return a.name.localeCompare(b.name, 'nl');
  });

  return result;
}

/**
 * Filter voices strictly for a chosen language code.
 */
export function getVoicesForLanguage(voices: VoiceItem[], langCode: string): VoiceItem[] {
  const filtered = voices.filter((v) => voiceMatchesLang(v, langCode));
  return filtered.length > 0 ? filtered : voices;
}

/**
 * Find best matching voice when language switches (prefer neural/natural if available).
 */
export function getDefaultVoiceForLanguage(voices: VoiceItem[], langCode: string): VoiceItem | undefined {
  const langVoices = voices.filter((v) => voiceMatchesLang(v, langCode));
  if (langVoices.length === 0) return undefined;
  // Prefer neural voice if present
  const neural = langVoices.find((v) => v.isNeural);
  return neural || langVoices[0];
}

/**
 * Maps language code / voice tag to standard BCP-47 SpeechRecognition language tag
 */
export function toSpeechRecLang(rawLang?: string): string {
  if (!rawLang) return 'nl-NL';
  const clean = rawLang.replace(/_/g, '-');
  if (clean.includes('-')) return clean;
  const map: Record<string, string> = {
    nl: 'nl-NL',
    en: 'en-US',
    de: 'de-DE',
    fr: 'fr-FR',
    es: 'es-ES',
    it: 'it-IT',
    sv: 'sv-SE',
    no: 'nb-NO',
    da: 'da-DK',
    pt: 'pt-PT',
    pl: 'pl-PL',
    ru: 'ru-RU',
    tr: 'tr-TR',
    ja: 'ja-JP',
    zh: 'zh-CN',
    ar: 'ar-SA',
  };
  return map[clean.toLowerCase()] || `${clean.toLowerCase()}-${clean.toUpperCase()}`;
}

