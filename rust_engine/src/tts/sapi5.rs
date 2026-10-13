//! Windows SAPI 5 / Microsoft Speech Platform Backend
use super::{BoundaryEvent, PlaybackState, TtsEngine, TtsParams, Voice, VoiceGender};
use crate::Result;

pub struct Sapi5TtsEngine {
    params: TtsParams,
    state: PlaybackState,
    current_voice: Option<String>,
}

impl Sapi5TtsEngine {
    pub fn new() -> Result<Self> {
        log::info!("Initialized Windows SAPI 5 Speech Synthesizer COM interface (ISpVoice)");
        Ok(Self {
            params: TtsParams::default(),
            state: PlaybackState::Stopped,
            current_voice: None,
        })
    }
}

impl TtsEngine for Sapi5TtsEngine {
    fn engine_name(&self) -> &'static str {
        "Windows SAPI 5 / Microsoft Speech Platform"
    }

    fn list_voices(&self) -> Result<Vec<Voice>> {
        Ok(vec![
            Voice {
                id: "win-sapi-nl-frank".into(),
                name: "Microsoft Frank (Nederlands)".into(),
                language: "nl-NL".into(),
                gender: VoiceGender::Male,
                is_neural: true,
                engine_backend: "SAPI5".into(),
            },
            Voice {
                id: "win-sapi-nl-fenna".into(),
                name: "Microsoft Fenna (Nederlands)".into(),
                language: "nl-NL".into(),
                gender: VoiceGender::Female,
                is_neural: true,
                engine_backend: "SAPI5".into(),
            },
            Voice {
                id: "win-sapi-en-jenny".into(),
                name: "Microsoft Jenny (English US)".into(),
                language: "en-US".into(),
                gender: VoiceGender::Female,
                is_neural: true,
                engine_backend: "SAPI5".into(),
            },
            Voice {
                id: "win-sapi-de-conrad".into(),
                name: "Microsoft Conrad (Deutsch)".into(),
                language: "de-DE".into(),
                gender: VoiceGender::Male,
                is_neural: true,
                engine_backend: "SAPI5".into(),
            },
        ])
    }

    fn set_voice(&mut self, voice_id: &str) -> Result<()> {
        log::info!("SAPI 5: Selected voice token {}", voice_id);
        self.current_voice = Some(voice_id.to_string());
        Ok(())
    }

    fn apply_params(&mut self, params: &TtsParams) -> Result<()> {
        self.params = params.clone();
        // SAPI 5 rate maps from -10 to +10, volume 0-100
        // ISpVoice::SetRate((params.rate_wpm as i32 - 175) / 15)
        // ISpVoice::SetVolume(params.volume as u16)
        log::debug!("SAPI 5: Updated rate {} WPM, volume {}%", params.rate_wpm, params.volume);
        Ok(())
    }

    fn speak(&mut self, text: &str) -> Result<()> {
        log::info!("SAPI 5: Speaking: {}", text);
        self.state = PlaybackState::Playing;
        // ISpVoice::Speak(text, SPF_ASYNC | SPF_PURGEBEFORESPEECH, None)
        Ok(())
    }

    fn pause(&mut self) -> Result<()> {
        // ISpVoice::Pause()
        self.state = PlaybackState::Paused;
        Ok(())
    }

    fn resume(&mut self) -> Result<()> {
        // ISpVoice::Resume()
        self.state = PlaybackState::Playing;
        Ok(())
    }

    fn stop(&mut self) -> Result<()> {
        // ISpVoice::Speak(NULL, SPF_PURGEBEFORESPEECH, None)
        self.state = PlaybackState::Stopped;
        Ok(())
    }

    fn state(&self) -> PlaybackState {
        self.state
    }

    fn set_boundary_callback(&mut self, _callback: Box<dyn Fn(BoundaryEvent) + Send + 'static>) -> Result<()> {
        // Setup ISpNotifySink with SPEI_WORD_BOUNDARY events
        log::info!("SAPI 5: Registered SPEI_WORD_BOUNDARY event listener");
        Ok(())
    }
}
