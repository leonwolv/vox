import { LexiconEntry } from '../types/tts';

export const DEFAULT_LEXICON: LexiconEntry[] = [
  { id: 'lex-1', pattern: 'bijv.', replacement: 'bijvoorbeeld', isRegex: false, matchWholeWord: true, category: 'afkorting' },
  { id: 'lex-2', pattern: 'etc.', replacement: 'et cetera', isRegex: false, matchWholeWord: true, category: 'afkorting' },
  { id: 'lex-3', pattern: 'ca.', replacement: 'circa', isRegex: false, matchWholeWord: true, category: 'afkorting' },
  { id: 'lex-4', pattern: 'vs.', replacement: 'versus', isRegex: false, matchWholeWord: true, category: 'afkorting' },
  { id: 'lex-5', pattern: 'z.s.m.', replacement: 'zo spoedig mogelijk', isRegex: false, matchWholeWord: true, category: 'afkorting' },
  { id: 'lex-6', pattern: 'm.b.t.', replacement: 'met betrekking tot', isRegex: false, matchWholeWord: true, category: 'afkorting' },
  { id: 'lex-7', pattern: 'i.v.m.', replacement: 'in verband met', isRegex: false, matchWholeWord: true, category: 'afkorting' },
  { id: 'lex-8', pattern: 'd.w.z.', replacement: 'dat wil zeggen', isRegex: false, matchWholeWord: true, category: 'afkorting' },
  { id: 'lex-9', pattern: 'o.a.', replacement: 'onder andere', isRegex: false, matchWholeWord: true, category: 'afkorting' },
  { id: 'lex-10', pattern: 't.a.v.', replacement: 'ter attentie van', isRegex: false, matchWholeWord: true, category: 'afkorting' },
  { id: 'lex-11', pattern: 'FBI', replacement: 'F B I', isRegex: false, matchWholeWord: true, category: 'acroniem' },
  { id: 'lex-12', pattern: 'CIA', replacement: 'C I A', isRegex: false, matchWholeWord: true, category: 'acroniem' },
  { id: 'lex-13', pattern: 'AIVD', replacement: 'A I V D', isRegex: false, matchWholeWord: true, category: 'acroniem' },
  { id: 'lex-14', pattern: 'HTML', replacement: 'H T M L', isRegex: false, matchWholeWord: true, category: 'acroniem' },
  { id: 'lex-15', pattern: 'CSS', replacement: 'C S S', isRegex: false, matchWholeWord: true, category: 'acroniem' },
  { id: 'lex-16', pattern: 'API', replacement: 'A P I', isRegex: false, matchWholeWord: true, category: 'acroniem' },
  { id: 'lex-17', pattern: 'PDF', replacement: 'P D F', isRegex: false, matchWholeWord: true, category: 'acroniem' },
];

export function dutchNumberToWords(n: number): string {
  if (n === 0) return 'nul';
  const smalls: Record<number, string> = {
    1: 'een', 2: 'twee', 3: 'drie', 4: 'vier', 5: 'vijf',
    6: 'zes', 7: 'zeven', 8: 'acht', 9: 'negen', 10: 'tien',
    11: 'elf', 12: 'twaalf', 13: 'dertien', 14: 'veertien', 15: 'vijftien',
    16: 'zestien', 17: 'zeventien', 18: 'achttien', 19: 'negentien',
    20: 'twintig', 30: 'dertig', 40: 'veertig', 50: 'vijftig',
    60: 'zestig', 70: 'zeventig', 80: 'tachtig', 90: 'negentig',
    100: 'honderd', 1000: 'duizend'
  };

  if (smalls[n]) return smalls[n];

  if (n < 100) {
    const ones = n % 10;
    const tens = Math.floor(n / 10) * 10;
    return `${smalls[ones]}en${smalls[tens]}`;
  }

  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    const prefix = hundreds === 1 ? 'honderd' : `${smalls[hundreds]}honderd`;
    if (remainder === 0) return prefix;
    return `${prefix} ${dutchNumberToWords(remainder)}`;
  }

  if (n < 10000) {
    const thousands = Math.floor(n / 1000);
    const remainder = n % 1000;
    const prefix = thousands === 1 ? 'duizend' : `${smalls[thousands]}duizend`;
    if (remainder === 0) return prefix;
    return `${prefix} ${dutchNumberToWords(remainder)}`;
  }

  return n.toString();
}

export function normalizeText(
  text: string,
  lexicon: LexiconEntry[] = DEFAULT_LEXICON,
  options: {
    expandAbbreviations?: boolean;
    expandCurrency?: boolean;
    expandDates?: boolean;
    expandTimes?: boolean;
    distinguishYears?: boolean;
    expandAcronyms?: boolean;
  } = {}
): string {
  const {
    expandAbbreviations = true,
    expandCurrency = true,
    expandDates = true,
    expandTimes = true,
    distinguishYears = true,
    expandAcronyms = true,
  } = options;

  let result = text;

  // 1. Lexicon replacements
  if (expandAbbreviations || expandAcronyms) {
    for (const entry of lexicon) {
      if (entry.category === 'acroniem' && !expandAcronyms) continue;
      if (entry.category === 'afkorting' && !expandAbbreviations) continue;

      if (entry.isRegex) {
        try {
          const re = new RegExp(entry.pattern, 'g');
          result = result.replace(re, entry.replacement);
        } catch {
          // invalid regex ignored
        }
      } else if (entry.matchWholeWord) {
        const escaped = entry.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`\\b${escaped}\\b`, 'gi');
        result = result.replace(re, entry.replacement);
      } else {
        result = result.replaceAll(entry.pattern, entry.replacement);
      }
    }
  }

  // 2. Currency: €50,00 -> "vijftig euro", €12,50 -> "twaalf euro en vijftig cent", $50 -> "vijftig dollar"
  if (expandCurrency) {
    result = result.replace(/€\s*(\d+)(?:[.,](\d{2}))?/g, (_, wholeStr, centsStr) => {
      const whole = parseInt(wholeStr, 10);
      const wholeWords = dutchNumberToWords(whole);
      if (!centsStr || centsStr === '00') {
        return `${wholeWords} euro`;
      }
      const cents = parseInt(centsStr, 10);
      const centsWords = dutchNumberToWords(cents);
      return `${wholeWords} euro en ${centsWords} cent`;
    });

    result = result.replace(/\$\s*(\d+)(?:[.,](\d{2}))?/g, (_, wholeStr, centsStr) => {
      const whole = parseInt(wholeStr, 10);
      const wholeWords = dutchNumberToWords(whole);
      if (!centsStr || centsStr === '00') {
        return `${wholeWords} dollar`;
      }
      const cents = parseInt(centsStr, 10);
      const centsWords = dutchNumberToWords(cents);
      return `${wholeWords} dollar en ${centsWords} cent`;
    });
  }

  // 3. Dates: 01-01-2025 or 12/05/1998 -> "eerste januari tweeduizend vijfentwintig"
  if (expandDates) {
    const monthNames: Record<number, string> = {
      1: 'januari', 2: 'februari', 3: 'maart', 4: 'april', 5: 'mei', 6: 'juni',
      7: 'juli', 8: 'augustus', 9: 'september', 10: 'oktober', 11: 'november', 12: 'december'
    };

    result = result.replace(/\b(\d{1,2})[-/.](\d{1,2})[-/.](19\d{2}|20\d{2})\b/g, (_, dayStr, monthStr, yearStr) => {
      const day = parseInt(dayStr, 10);
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10);

      const dayOrdinal = day === 1 ? 'eerste'
        : day === 2 ? 'tweede'
        : day === 3 ? 'derde'
        : day === 8 ? 'achtste'
        : `${dutchNumberToWords(day)}ste`;

      const monthName = monthNames[month] || 'maand';

      let yearWords = '';
      if (year >= 2000) {
        yearWords = `tweeduizend ${dutchNumberToWords(year - 2000)}`;
      } else {
        const century = Math.floor(year / 100);
        const rem = year % 100;
        yearWords = `${dutchNumberToWords(century)} ${dutchNumberToWords(rem)}`;
      }

      return `${dayOrdinal} ${monthName} ${yearWords}`;
    });
  }

  // 4. Times: 14:30 -> "half drie", 14:00 -> "veertien uur", 14:15 -> "kwart over twee", 14:45 -> "kwart voor drie"
  if (expandTimes) {
    result = result.replace(/\b(\d{1,2}):(\d{2})\b/g, (_, hourStr, minStr) => {
      const h = parseInt(hourStr, 10);
      const m = parseInt(minStr, 10);

      if (m === 0) {
        return `${dutchNumberToWords(h)} uur`;
      } else if (m === 30) {
        const nextHour = (h % 12) + 1;
        return `half ${dutchNumberToWords(nextHour)}`;
      } else if (m === 15) {
        const displayH = h > 12 ? h - 12 : h;
        return `kwart over ${dutchNumberToWords(displayH)}`;
      } else if (m === 45) {
        const nextH = ((h > 12 ? h - 12 : h) % 12) + 1;
        return `kwart voor ${dutchNumberToWords(nextH)}`;
      } else {
        return `${dutchNumberToWords(h)} uur ${dutchNumberToWords(m)}`;
      }
    });
  }

  // 5. Year context detection: "In 1984 ..." vs counts
  if (distinguishYears) {
    result = result.replace(/\b(in|jaar|sinds|rond|tussen)\s+(19\d{2})\b/gi, (_, prep, yearStr) => {
      const year = parseInt(yearStr, 10);
      const century = Math.floor(year / 100);
      const rem = year % 100;
      return `${prep} ${dutchNumberToWords(century)} ${dutchNumberToWords(rem)}`;
    });
  }

  return result;
}
