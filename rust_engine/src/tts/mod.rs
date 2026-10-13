use serde::{Deserialize, Serialize};
use crate::Result;

pub mod sapi5;
pub mod avspeech;
pub mod speechd;
pub mod engine;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum VoiceGender {
    Male,
    Female,
    Child,
    Neutral,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Voice {
    pub id: String,
    pub name: String,
    pub language: String, // e.g. "nl-NL", "en-US", "fr-FR", "de-DE"
    pub gender: VoiceGender,
    pub is_neural: bool,
    pub engine_backend: String, // "SAPI5", "AVSpeech", "SpeechDispatcher"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TtsParams {
    /// Speech rate in Words Per Minute (50 to 500, default 175)
    pub rate_wpm: u32,
    /// Pitch adjustment (-10 to +10, default 0)
    pub pitch: i32,
    /// Output volume percentage (0 to 100, default 100)
    pub volume: u32,
    /// Pause durations in milliseconds
    pub pause_comma_ms: u32,
    pub pause_period_ms: u32,
    pub pause_exclamation_question_ms: u32,
    pub pause_paragraph_ms: u32,
    /// Simulated breathing pause insertion
    pub breathing_simulation: bool,
    /// Audio ducking for background sound
    pub ducking_enabled: bool,
}

impl Default for TtsParams {
    fn default() -> Self {
        Self {
            rate_wpm: 175,
            pitch: 0,
            volume: 100,
            pause_comma_ms: 250,
            pause_period_ms: 450,
            pause_exclamation_question_ms: 600,
            pause_paragraph_ms: 900,
            breathing_simulation: true,
            ducking_enabled: true,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PlaybackState {
    Stopped,
    Playing,
    Paused,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoundaryEvent {
    pub word: String,
    pub char_index: usize,
    pub char_length: usize,
    pub sentence_index: usize,
    pub timestamp_ms: u64,
}

pub trait TtsEngine: Send + Sync {
    fn engine_name(&self) -> &'static str;
    fn list_voices(&self) -> Result<Vec<Voice>>;
    fn set_voice(&mut self, voice_id: &str) -> Result<()>;
    fn apply_params(&mut self, params: &TtsParams) -> Result<()>;
    fn speak(&mut self, text: &str) -> Result<()>;
    fn pause(&mut self) -> Result<()>;
    fn resume(&mut self) -> Result<()>;
    fn stop(&mut self) -> Result<()>;
    fn state(&self) -> PlaybackState;
    fn set_boundary_callback(&mut self, callback: Box<dyn Fn(BoundaryEvent) + Send + 'static>) -> Result<()>;
}
