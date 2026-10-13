//! VoxA11y Core - Cross-Platform Accessibility & Text-to-Speech Engine
//!
//! Features:
//! - Native OS Accessibility hooks (Windows UI Automation, macOS AXUIElement, Linux AT-SPI2)
//! - Multi-engine TTS with automatic fallbacks (SAPI 5, AVFoundation/NSSpeechSynthesizer, Speech Dispatcher)
//! - Dutch & Multilingual context-aware text normalization (numbers, dates, currency, abbreviations)
//! - Word-by-word and sentence tracking with punctuation pause synthesis
//! - Audio export (WAV 16/24-bit PCM, SRT/LRC sync subtitles)

pub mod accessibility;
pub mod tts;
pub mod stt;
pub mod normalizer;
pub mod audio;
pub mod queue;
pub mod adapters;

pub use accessibility::{AccessibilityProvider, AccessibleElement, TextSelection};
pub use tts::{TtsEngine, Voice, TtsParams, PlaybackState, BoundaryEvent};
pub use stt::{LocalWhisperEngine, SttConfig, WhisperModelSize, VoiceCommandIntent};
pub use normalizer::{TextNormalizer, NormalizerConfig, PronunciationLexicon};
pub use audio::{AudioExporter, PcmFormat, SrtLrcExporter};
pub use queue::{DocumentQueue, ReadingBookmark};

#[derive(Debug, thiserror::Error)]
pub enum VoxError {
    #[error("TTS Engine failure: {0}")]
    EngineError(String),
    #[error("Accessibility API failure: {0}")]
    AccessibilityError(String),
    #[error("Audio encoding failure: {0}")]
    AudioError(String),
    #[error("Text normalization error: {0}")]
    NormalizationError(String),
    #[error("I/O Error: {0}")]
    Io(#[from] std::io::Error),
}

pub type Result<T> = std::result::Result<T, VoxError>;
