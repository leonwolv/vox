use std::collections::HashMap;
use std::time::{Duration, Instant};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueuedDocument {
    pub id: String,
    pub title: String,
    pub source_type: String, // "word", "browser", "email", "pdf", "custom"
    pub content: String,
    pub current_char_offset: usize,
    pub total_chars: usize,
    pub completed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReadingBookmark {
    pub id: String,
    pub document_id: String,
    pub title: String,
    pub note: Option<String>,
    pub char_offset: usize,
    pub sentence_index: usize,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueSettings {
    pub loop_current_doc: bool,
    pub auto_advance: bool,
    pub sleep_timer_minutes: Option<u32>,
}

pub struct DocumentQueue {
    pub items: Vec<QueuedDocument>,
    pub current_index: usize,
    pub bookmarks: Vec<ReadingBookmark>,
    pub last_positions: HashMap<String, usize>,
    pub settings: QueueSettings,
    pub timer_start: Option<Instant>,
}

impl DocumentQueue {
    pub fn new() -> Self {
        Self {
            items: Vec::new(),
            current_index: 0,
            bookmarks: Vec::new(),
            last_positions: HashMap::new(),
            settings: QueueSettings {
                loop_current_doc: false,
                auto_advance: true,
                sleep_timer_minutes: None,
            },
            timer_start: None,
        }
    }

    pub fn add_document(&mut self, doc: QueuedDocument) {
        self.items.push(doc);
    }

    pub fn current_document(&self) -> Option<&QueuedDocument> {
        self.items.get(self.current_index)
    }

    pub fn current_document_mut(&mut self) -> Option<&mut QueuedDocument> {
        self.items.get_mut(self.current_index)
    }

    pub fn save_bookmark(&mut self, doc_id: &str, title: &str, offset: usize, sentence_idx: usize) {
        let bm = ReadingBookmark {
            id: format!("bm-{}", self.bookmarks.len() + 1),
            document_id: doc_id.to_string(),
            title: title.to_string(),
            note: None,
            char_offset: offset,
            sentence_index: sentence_idx,
            created_at: chrono::Utc::now().to_rfc3339(),
        };
        self.bookmarks.push(bm);
        self.last_positions.insert(doc_id.to_string(), offset);
    }

    pub fn next_document(&mut self) -> Option<&QueuedDocument> {
        if self.items.is_empty() {
            return None;
        }

        if self.settings.loop_current_doc {
            if let Some(doc) = self.current_document_mut() {
                doc.current_char_offset = 0;
            }
            return self.current_document();
        }

        if self.current_index + 1 < self.items.len() {
            self.current_index += 1;
            self.current_document()
        } else {
            None
        }
    }

    pub fn is_sleep_timer_elapsed(&self) -> bool {
        if let (Some(start), Some(mins)) = (self.timer_start, self.settings.sleep_timer_minutes) {
            start.elapsed() >= Duration::from_secs((mins * 60) as u64)
        } else {
            false
        }
    }
}
