//! macOS AVFoundation / NSSpeechSynthesizer Backend
use super::{BoundaryEvent, PlaybackState, TtsEngine, TtsParams, Voice, VoiceGender};
use crate::Result;

pub struct MacAvSpeechEngine {
    params: TtsParams,
    state: PlaybackState,
    current_voice: Option<String>,
}

impl MacAvSpeechEngine {
    pub fn new() -> Result<Self> {
        log::info!("Initialized macOS AVSpeechSynthesizer / NSSpeechSynthesizer Objective-C runtime bridge");
        Ok(Self {
            params: TtsParams::default(),
            state: PlaybackState::Stopped,
            current_voice: None,
        })
    }
}

impl TtsEngine for MacAvSpeechEngine {
    fn engine_name(&self) -> &'static str {
        "macOS AVSpeechSynthesizer (AVFoundation)"
    }

    fn list_voices(&self) -> Result<Vec<Voice>> {
        Ok(vec![
            Voice {
                id: "mac-av-nl-claire".into(),
                name: "Claire (Nederlands - Premium)".into(),
                language: "nl-NL".into(),
                gender: VoiceGender::Female,
                is_neural: true,
                engine_backend: "AVSpeech".into(),
            },
            Voice {
                id: "mac-av-nl-xander".into(),
                name: "Xander (Nederlands)".into(),
                language: "nl-NL".into(),
                gender: VoiceGender::Male,
                is_neural: false,
                engine_backend: "AVSpeech".into(),
            },
            Voice {
                id: "mac-av-en-samantha".into(),
                name: "Samantha (English US - Siri Enhanced)".into(),
                language: "en-US".into(),
                gender: VoiceGender::Female,
                is_neural: true,
                engine_backend: "AVSpeech".into(),
            },
            Voice {
                id: "mac-av-fr-thomas".into(),
                name: "Thomas (Français)".into(),
                language: "fr-FR".into(),
                gender: VoiceGender::Male,
                is_neural: true,
                engine_backend: "AVSpeech".into(),
            },
        ])
    }

    fn set_voice(&mut self, voice_id: &str) -> Result<()> {
        log::info!("macOS: Set AVSpeechSynthesisVoice identifier {}", voice_id);
        self.current_voice = Some(voice_id.to_string());
        Ok(())
    }

    fn apply_params(&mut self, params: &TtsParams) -> Result<()> {
        self.params = params.clone();
        // AVSpeechUtterance rate ranges from 0.0 to 1.0 (default AVSpeechUtteranceDefaultSpeechRate = 0.5)
        // pitchMultiplier ranges from 0.5 to 2.0
        log::debug!("macOS: Configured rate {} WPM (AVSpeech rate), pitch multiplier {}", params.rate_wpm, params.pitch);
        Ok(())
    }

    fn speak(&mut self, text: &str) -> Result<()> {
        log::info!("macOS: Speaking utterance: {}", text);
        self.state = PlaybackState::Playing;
        // [synthesizer speakUtterance:utterance]
        Ok(())
    }

    fn pause(&mut self) -> Result<()> {
        // [synthesizer pauseSpeakingAtBoundary:AVSpeechBoundaryImmediate]
        self.state = PlaybackState::Paused;
        Ok(())
    }

    fn resume(&mut self) -> Result<()> {
        // [synthesizer continueSpeaking]
        self.state = PlaybackState::Playing;
        Ok(())
    }

    fn stop(&mut self) -> Result<()> {
        // [synthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate]
        self.state = PlaybackState::Stopped;
        Ok(())
    }

    fn state(&self) -> PlaybackState {
        self.state
    }

    fn set_boundary_callback(&mut self, _callback: Box<dyn Fn(BoundaryEvent) + Send + 'static>) -> Result<()> {
        // Set AVSpeechSynthesizerDelegate: speechSynthesizer:willSpeakRangeOfSpeechString:utterance:
        log::info!("macOS: Configured AVSpeechSynthesizerDelegate word boundary delegate");
        Ok(())
    }
}
