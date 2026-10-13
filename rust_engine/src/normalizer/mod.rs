use std::collections::HashMap;
use regex::Regex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LexiconEntry {
    pub pattern: String,
    pub replacement: String,
    pub is_regex: bool,
    pub match_whole_word: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PronunciationLexicon {
    pub entries: Vec<LexiconEntry>,
}

impl Default for PronunciationLexicon {
    fn default() -> Self {
        Self {
            entries: vec![
                LexiconEntry {
                    pattern: "bijv.".into(),
                    replacement: "bijvoorbeeld".into(),
                    is_regex: false,
                    match_whole_word: true,
                },
                LexiconEntry {
                    pattern: "etc.".into(),
                    replacement: "et cetera".into(),
                    is_regex: false,
                    match_whole_word: true,
                },
                LexiconEntry {
                    pattern: "ca.".into(),
                    replacement: "circa".into(),
                    is_regex: false,
                    match_whole_word: true,
                },
                LexiconEntry {
                    pattern: "vs.".into(),
                    replacement: "versus".into(),
                    is_regex: false,
                    match_whole_word: true,
                },
                LexiconEntry {
                    pattern: "z.s.m.".into(),
                    replacement: "zo spoedig mogelijk".into(),
                    is_regex: false,
                    match_whole_word: true,
                },
                LexiconEntry {
                    pattern: "m.b.t.".into(),
                    replacement: "met betrekking tot".into(),
                    is_regex: false,
                    match_whole_word: true,
                },
                LexiconEntry {
                    pattern: "i.v.m.".into(),
                    replacement: "in verband met".into(),
                    is_regex: false,
                    match_whole_word: true,
                },
            ],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NormalizerConfig {
    pub expand_abbreviations: bool,
    pub expand_currency: bool,
    pub expand_dates: bool,
    pub expand_times: bool,
    pub distinguish_years: bool,
    pub spell_out_acronyms: bool,
    pub language: String, // "nl", "en", etc.
}

impl Default for NormalizerConfig {
    fn default() -> Self {
        Self {
            expand_abbreviations: true,
            expand_currency: true,
            expand_dates: true,
            expand_times: true,
            distinguish_years: true,
            spell_out_acronyms: true,
            language: "nl".into(),
        }
    }
}

pub struct TextNormalizer {
    config: NormalizerConfig,
    lexicon: PronunciationLexicon,
    currency_regex: Regex,
    date_regex: Regex,
    time_regex: Regex,
    year_regex: Regex,
    spelled_acronyms: Vec<&'static str>,
}

impl TextNormalizer {
    pub fn new(config: NormalizerConfig, lexicon: PronunciationLexicon) -> Self {
        Self {
            config,
            lexicon,
            currency_regex: Regex::new(r"€\s*(\d+)(?:[.,](\d{2}))?").unwrap(),
            date_regex: Regex::new(r"\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2}|19\d{2})\b").unwrap(),
            time_regex: Regex::new(r"\b(\d{1,2}):(\d{2})\b").unwrap(),
            year_regex: Regex::new(r"\b(19\d{2}|20\d{2})\b").unwrap(),
            spelled_acronyms: vec!["FBI", "CIA", "AIVD", "HTML", "CSS", "API", "USB", "PDF", "URL", "JSON"],
        }
    }

    pub fn normalize(&self, input: &str) -> String {
        let mut text = input.to_string();

        // 1. User Lexicon & Common Abbreviations
        if self.config.expand_abbreviations {
            for entry in &self.lexicon.entries {
                if entry.is_regex {
                    if let Ok(re) = Regex::new(&entry.pattern) {
                        text = re.replace_all(&text, &entry.replacement).to_string();
                    }
                } else if entry.match_whole_word {
                    let pattern = format!(r"\b{}\b", regex::escape(&entry.pattern));
                    if let Ok(re) = Regex::new(&pattern) {
                        text = re.replace_all(&text, &entry.replacement).to_string();
                    }
                } else {
                    text = text.replace(&entry.pattern, &entry.replacement);
                }
            }
        }

        // 2. Currency expansion: €50,00 -> "vijftig euro", €12,50 -> "twaalf euro en vijftig cent"
        if self.config.expand_currency {
            text = self.currency_regex.replace_all(&text, |caps: &regex::Captures| {
                let whole = caps.get(1).map_or("", |m| m.as_str());
                let cents = caps.get(2).map_or("", |m| m.as_str());
                let whole_num: u64 = whole.parse().unwrap_or(0);
                let whole_words = dutch_number_to_words(whole_num);

                if cents.is_empty() || cents == "00" {
                    format!("{} euro", whole_words)
                } else {
                    let cents_num: u64 = cents.parse().unwrap_or(0);
                    let cents_words = dutch_number_to_words(cents_num);
                    format!("{} euro en {} cent", whole_words, cents_words)
                }
            }).to_string();
        }

        // 3. Date expansion: 01-01-2025 -> "eerste januari tweeduizend vijfentwintig"
        if self.config.expand_dates {
            text = self.date_regex.replace_all(&text, |caps: &regex::Captures| {
                let day: u32 = caps[1].parse().unwrap_or(1);
                let month: u32 = caps[2].parse().unwrap_or(1);
                let year: u32 = caps[3].parse().unwrap_or(2025);

                let day_ordinal = match day {
                    1 => "eerste",
                    2 => "tweede",
                    3 => "derde",
                    8 => "achtste",
                    d => &format!("{}ste", dutch_number_to_words(d as u64)),
                };

                let month_name = match month {
                    1 => "januari",
                    2 => "februari",
                    3 => "maart",
                    4 => "april",
                    5 => "mei",
                    6 => "juni",
                    7 => "juli",
                    8 => "augustus",
                    9 => "september",
                    10 => "oktober",
                    11 => "november",
                    12 => "december",
                    _ => "maand",
                };

                let year_words = if year >= 2000 {
                    format!("tweeduizend {}", dutch_number_to_words((year - 2000) as u64))
                } else {
                    let century = year / 100;
                    let remainder = year % 100;
                    format!("{} {}", dutch_number_to_words(century as u64), dutch_number_to_words(remainder as u64))
                };

                format!("{} {} {}", day_ordinal, month_name, year_words)
            }).to_string();
        }

        // 4. Time expansion: 14:30 -> "half drie" / "veertien uur dertig"
        if self.config.expand_times {
            text = self.time_regex.replace_all(&text, |caps: &regex::Captures| {
                let hour: u32 = caps[1].parse().unwrap_or(0);
                let minute: u32 = caps[2].parse().unwrap_or(0);

                if minute == 0 {
                    format!("{} uur", dutch_number_to_words(hour as u64))
                } else if minute == 30 {
                    let next_hour = (hour % 12) + 1;
                    format!("half {}", dutch_number_to_words(next_hour as u64))
                } else if minute == 15 {
                    format!("kwart over {}", dutch_number_to_words(hour as u64))
                } else if minute == 45 {
                    let next_hour = (hour % 12) + 1;
                    format!("kwart voor {}", dutch_number_to_words(next_hour as u64))
                } else {
                    format!("{} uur {}", dutch_number_to_words(hour as u64), dutch_number_to_words(minute as u64))
                }
            }).to_string();
        }

        // 5. Acronym spelling: "FBI" -> "F-B-I"
        if self.config.spell_out_acronyms {
            for acronym in &self.spelled_acronyms {
                let spelled: Vec<String> = acronym.chars().map(|c| c.to_string()).collect();
                let replacement = spelled.join(" ");
                let re = Regex::new(&format!(r"\b{}\b", acronym)).unwrap();
                text = re.replace_all(&text, &replacement).to_string();
            }
        }

        text
    }
}

pub fn dutch_number_to_words(n: u64) -> String {
    match n {
        0 => "nul".into(),
        1 => "een".into(),
        2 => "twee".into(),
        3 => "drie".into(),
        4 => "vier".into(),
        5 => "vijf".into(),
        6 => "zes".into(),
        7 => "zeven".into(),
        8 => "acht".into(),
        9 => "negen".into(),
        10 => "tien".into(),
        11 => "elf".into(),
        12 => "twaalf".into(),
        13 => "dertien".into(),
        14 => "veertien".into(),
        15 => "vijftien".into(),
        16 => "zestien".into(),
        17 => "zeventien".into(),
        18 => "achttien".into(),
        19 => "negentien".into(),
        20 => "twintig".into(),
        30 => "dertig".into(),
        40 => "veertig".into(),
        50 => "vijftig".into(),
        60 => "zestig".into(),
        70 => "zeventig".into(),
        80 => "tachtig".into(),
        90 => "negentig".into(),
        100 => "honderd".into(),
        1000 => "duizend".into(),
        _ if n < 100 => {
            let ones = n % 10;
            let tens = (n / 10) * 10;
            format!("{}en{}", dutch_number_to_words(ones), dutch_number_to_words(tens))
        }
        _ if n < 1000 => {
            let hundreds = n / 100;
            let remainder = n % 100;
            let prefix = if hundreds == 1 { "honderd".into() } else { format!("{}honderd", dutch_number_to_words(hundreds)) };
            if remainder == 0 { prefix } else { format!("{} {}", prefix, dutch_number_to_words(remainder)) }
        }
        _ => format!("{}", n),
    }
}
