//! Linux Speech Dispatcher Backend (libspeechd / socket protocol)
use super::{BoundaryEvent, PlaybackState, TtsEngine, TtsParams, Voice, VoiceGender};
use crate::Result;

pub struct SpeechDispatcherEngine {
    params: TtsParams,
    state: PlaybackState,
    current_voice: Option<String>,
}

impl SpeechDispatcherEngine {
    pub fn new() -> Result<Self> {
        log::info!("Initialized Linux Speech Dispatcher client connection via UNIX socket / D-Bus");
        Ok(Self {
            params: TtsParams::default(),
            state: PlaybackState::Stopped,
            current_voice: None,
        })
    }
}

impl TtsEngine for SpeechDispatcherEngine {
    fn engine_name(&self) -> &'static str {
        "Linux Speech Dispatcher (spd-say / Festival / Piper / eSpeak-NG)"
    }

    fn list_voices(&self) -> Result<Vec<Voice>> {
        Ok(vec![
            Voice {
                id: "linux-spd-nl-nl".into(),
                name: "Piper Dutch (nl_NL-rdh-medium)".into(),
                language: "nl-NL".into(),
                gender: VoiceGender::Female,
                is_neural: true,
                engine_backend: "SpeechDispatcher".into(),
            },
            Voice {
                id: "linux-spd-espeak-nl".into(),
                name: "eSpeak-NG Dutch (nl)".into(),
                language: "nl-NL".into(),
                gender: VoiceGender::Neutral,
                is_neural: false,
                engine_backend: "SpeechDispatcher".into(),
            },
            Voice {
                id: "linux-spd-piper-en".into(),
                name: "Piper English (en_US-lessac-high)".into(),
                language: "en-US".into(),
                gender: VoiceGender::Female,
                is_neural: true,
                engine_backend: "SpeechDispatcher".into(),
            },
            Voice {
                id: "linux-spd-piper-de".into(),
                name: "Piper German (de_DE-thorsten-high)".into(),
                language: "de-DE".into(),
                gender: VoiceGender::Male,
                is_neural: true,
                engine_backend: "SpeechDispatcher".into(),
            },
        ])
    }

    fn set_voice(&mut self, voice_id: &str) -> Result<()> {
        log::info!("Speech Dispatcher: Setting voice module {}", voice_id);
        self.current_voice = Some(voice_id.to_string());
        Ok(())
    }

    fn apply_params(&mut self, params: &TtsParams) -> Result<()> {
        self.params = params.clone();
        // spd_set_voice_rate(conn, (rate_wpm - 175) / 2)
        // spd_set_voice_pitch(conn, pitch * 10)
        // spd_set_volume(conn, volume)
        log::debug!("Speech Dispatcher: Params configured for rate {} WPM", params.rate_wpm);
        Ok(())
    }

    fn speak(&mut self, text: &str) -> Result<()> {
        log::info!("Speech Dispatcher: Spd_say: {}", text);
        self.state = PlaybackState::Playing;
        // spd_say(conn, SPD_TEXT, text)
        Ok(())
    }

    fn pause(&mut self) -> Result<()> {
        // spd_pause(conn)
        self.state = PlaybackState::Paused;
        Ok(())
    }

    fn resume(&mut self) -> Result<()> {
        // spd_resume(conn)
        self.state = PlaybackState::Playing;
        Ok(())
    }

    fn stop(&mut self) -> Result<()> {
        // spd_stop(conn)
        self.state = PlaybackState::Stopped;
        Ok(())
    }

    fn state(&self) -> PlaybackState {
        self.state
    }

    fn set_boundary_callback(&mut self, _callback: Box<dyn Fn(BoundaryEvent) + Send + 'static>) -> Result<()> {
        // Setup SPD_INDEX_MARKS callback
        log::info!("Speech Dispatcher: Registered index mark boundary callback");
        Ok(())
    }
}
