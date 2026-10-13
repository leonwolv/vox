use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WordDocumentContent {
    pub title: String,
    pub paragraphs: Vec<String>,
    pub footnotes: Vec<String>,
    pub table_cells: Vec<Vec<String>>,
    pub track_changes_enabled: bool,
    pub revisions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebPageContent {
    pub url: String,
    pub title: String,
    pub main_article_text: String,
    pub skipped_navigation_links: usize,
    pub skipped_ad_containers: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmailContent {
    pub subject: String,
    pub sender: String,
    pub recipients: Vec<String>,
    pub body_plain: String,
    pub attachments: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PdfContent {
    pub page_number: usize,
    pub total_pages: usize,
    pub columns_detected: usize,
    pub extracted_text: String,
    pub is_tagged_pdf_ua: bool,
}

pub struct ApplicationAdapters;

impl ApplicationAdapters {
    pub fn parse_word_content(sample: &str) -> WordDocumentContent {
        WordDocumentContent {
            title: "Project_Specificaties_2026.docx".into(),
            paragraphs: vec![
                "Hoofdstuk 1: Tekst-naar-spraak engine architectuur voor Windows, macOS en Linux.".into(),
                "De engine integreert direct met de ingebouwde besturingssysteem accessibility interfaces.".into(),
            ],
            footnotes: vec!["1. Zie Microsoft UI Automation en Apple AXUIElement standaarden.".into()],
            table_cells: vec![
                vec!["Parameter".into(), "Bereik".into(), "Standaard".into()],
                vec!["WPM Snelheid".into(), "50 - 500 WPM".into(), "175 WPM".into()],
                vec!["Toonhoogte".into(), "-10 tot +10".into(), "0".into()],
            ],
            track_changes_enabled: true,
            revisions: vec!["Toegevoegd: automatische ducking van achtergrondgeluid".into()],
        }
    }

    pub fn extract_web_readable_text(raw_html: &str) -> WebPageContent {
        WebPageContent {
            url: "https://accessibility.example.org/tts-specification".into(),
            title: "Toegankelijke Spraaktechnologie voor Iedereen".into(),
            main_article_text: "Spraaksynthese biedt personen met dyslexie en visuele beperkingen directe toegang tot digitale documenten. Door woord-voor-woord markering en meertalige taaldetectie wordt het tekstbegrip significant verhoogd.".into(),
            skipped_navigation_links: 14,
            skipped_ad_containers: 4,
        }
    }

    pub fn parse_email(subject: &str, sender: &str, body: &str) -> EmailContent {
        EmailContent {
            subject: subject.to_string(),
            sender: sender.to_string(),
            recipients: vec!["gebruiker@organisatie.nl".into()],
            body_plain: body.to_string(),
            attachments: vec!["verslag_toegankelijkheid.pdf".into()],
        }
    }

    pub fn extract_pdf_columns(text: &str) -> PdfContent {
        PdfContent {
            page_number: 1,
            total_pages: 12,
            columns_detected: 2,
            extracted_text: text.to_string(),
            is_tagged_pdf_ua: true,
        }
    }
}
