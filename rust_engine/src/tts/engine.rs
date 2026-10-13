//! Multi-Engine Dispatcher with Automatic Fallback
use super::{BoundaryEvent, PlaybackState, TtsEngine, TtsParams, Voice};
use crate::Result;

pub struct MultiEngineTtsDispatcher {
    engines: Vec<Box<dyn TtsEngine>>,
    active_engine_index: usize,
    params: TtsParams,
}

impl MultiEngineTtsDispatcher {
    pub fn new_with_defaults() -> Result<Self> {
        let mut engines: Vec<Box<dyn TtsEngine>> = Vec::new();

        #[cfg(target_os = "windows")]
        {
            if let Ok(sapi) = super::sapi5::Sapi5TtsEngine::new() {
                engines.push(Box::new(sapi));
            }
        }

        #[cfg(target_os = "macos")]
        {
            if let Ok(av) = super::avspeech::MacAvSpeechEngine::new() {
                engines.push(Box::new(av));
            }
        }

        #[cfg(target_os = "linux")]
        {
            if let Ok(spd) = super::speechd::SpeechDispatcherEngine::new() {
                engines.push(Box::new(spd));
            }
        }

        // Always fallback to software synthesizer if empty
        if engines.is_empty() {
            log::warn!("No platform native engine bound, loading fallback speech-dispatcher engine");
            engines.push(Box::new(super::speechd::SpeechDispatcherEngine::new()?));
        }

        Ok(Self {
            engines,
            active_engine_index: 0,
            params: TtsParams::default(),
        })
    }

    /// Add a fallback engine to the priority chain
    pub fn add_engine(&mut self, engine: Box<dyn TtsEngine>) {
        self.engines.push(engine);
    }
}

impl TtsEngine for MultiEngineTtsDispatcher {
    fn engine_name(&self) -> &'static str {
        "VoxA11y Multi-Engine Dispatcher (with Automatic Fallback)"
    }

    fn list_voices(&self) -> Result<Vec<Voice>> {
        let mut all_voices = Vec::new();
        for engine in &self.engines {
            if let Ok(voices) = engine.list_voices() {
                all_voices.extend(voices);
            }
        }
        Ok(all_voices)
    }

    fn set_voice(&mut self, voice_id: &str) -> Result<()> {
        // Try each engine in priority order
        for (idx, engine) in self.engines.iter_mut().enumerate() {
            if engine.set_voice(voice_id).is_ok() {
                self.active_engine_index = idx;
                return Ok(());
            }
        }
        log::warn!("Voice {} not found in primary engines, keeping active engine fallback", voice_id);
        Ok(())
    }

    fn apply_params(&mut self, params: &TtsParams) -> Result<()> {
        self.params = params.clone();
        if let Some(engine) = self.engines.get_mut(self.active_engine_index) {
            engine.apply_params(params)?;
        }
        Ok(())
    }

    fn speak(&mut self, text: &str) -> Result<()> {
        // Primary engine execution with automatic fallback
        if let Some(engine) = self.engines.get_mut(self.active_engine_index) {
            match engine.speak(text) {
                Ok(_) => return Ok(()),
                Err(err) => {
                    log::warn!("Primary engine failed: {}. Falling back to secondary engine...", err);
                }
            }
        }

        // Try remaining fallback engines
        for (idx, engine) in self.engines.iter_mut().enumerate() {
            if idx != self.active_engine_index {
                if let Ok(_) = engine.speak(text) {
                    log::info!("Switched speech synthesis to fallback engine {}", engine.engine_name());
                    self.active_engine_index = idx;
                    return Ok(());
                }
            }
        }

        Err(crate::VoxError::EngineError("All TTS engines failed to synthesize text".into()))
    }

    fn pause(&mut self) -> Result<()> {
        if let Some(engine) = self.engines.get_mut(self.active_engine_index) {
            engine.pause()?;
        }
        Ok(())
    }

    fn resume(&mut self) -> Result<()> {
        if let Some(engine) = self.engines.get_mut(self.active_engine_index) {
            engine.resume()?;
        }
        Ok(())
    }

    fn stop(&mut self) -> Result<()> {
        for engine in &mut self.engines {
            let _ = engine.stop();
        }
        Ok(())
    }

    fn state(&self) -> PlaybackState {
        self.engines
            .get(self.active_engine_index)
            .map(|e| e.state())
            .unwrap_or(PlaybackState::Stopped)
    }

    fn set_boundary_callback(&mut self, callback: Box<dyn Fn(BoundaryEvent) + Send + 'static>) -> Result<()> {
        if let Some(engine) = self.engines.get_mut(self.active_engine_index) {
            engine.set_boundary_callback(callback)?;
        }
        Ok(())
    }
}
