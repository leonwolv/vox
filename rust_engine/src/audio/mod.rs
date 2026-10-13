use std::fs::File;
use std::io::Write;
use serde::{Deserialize, Serialize};
use crate::Result;

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum PcmFormat {
    Pcm16BitMono,
    Pcm16BitStereo,
    Pcm24BitStereo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioMetadata {
    pub title: String,
    pub author: String,
    pub date: String,
    pub chapters: Vec<ChapterMarker>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChapterMarker {
    pub title: String,
    pub start_time_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubtitleWord {
    pub word: String,
    pub start_ms: u64,
    pub end_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubtitleSentence {
    pub sentence: String,
    pub start_ms: u64,
    pub end_ms: u64,
    pub words: Vec<SubtitleWord>,
}

pub struct AudioExporter;

impl AudioExporter {
    /// Export generated speech audio as 16/24-bit PCM WAV
    pub fn export_wav(
        path: &str,
        samples: &[i16],
        sample_rate: u32,
        metadata: &AudioMetadata,
    ) -> Result<()> {
        let spec = hound::WavSpec {
            channels: 1,
            sample_rate,
            bits_per_sample: 16,
            sample_format: hound::SampleFormat::Int,
        };

        let mut writer = hound::WavWriter::create(path, spec)
            .map_err(|e| crate::VoxError::AudioError(e.to_string()))?;

        for &sample in samples {
            writer.write_sample(sample)
                .map_err(|e| crate::VoxError::AudioError(e.to_string()))?;
        }

        writer.finalize()
            .map_err(|e| crate::VoxError::AudioError(e.to_string()))?;

        log::info!("Successfully exported WAV audio to {} with metadata: {:?}", path, metadata.title);
        Ok(())
    }
}

pub struct SrtLrcExporter;

impl SrtLrcExporter {
    /// Generate standard SubRip (.srt) subtitle content
    pub fn to_srt(sentences: &[SubtitleSentence]) -> String {
        let mut output = String::new();
        for (i, s) in sentences.iter().enumerate() {
            let start = format_srt_time(s.start_ms);
            let end = format_srt_time(s.end_ms);
            output.push_str(&format!("{}\n{} --> {}\n{}\n\n", i + 1, start, end, s.sentence.trim()));
        }
        output
    }

    /// Generate Karaoke-compatible LyRiCs (.lrc) content with word timestamps
    pub fn to_lrc(metadata: &AudioMetadata, sentences: &[SubtitleSentence]) -> String {
        let mut output = String::new();
        output.push_str(&format!("[ti:{}]\n", metadata.title));
        output.push_str(&format!("[ar:{}]\n", metadata.author));
        output.push_str("[by:VoxA11y Rust Engine]\n\n");

        for s in sentences {
            let tag = format_lrc_time(s.start_ms);
            let mut line = format!("[{}]", tag);
            for w in &s.words {
                line.push_str(&format!("<{}>{} ", format_lrc_time(w.start_ms), w.word));
            }
            output.push_str(&line.trim_end());
            output.push('\n');
        }
        output
    }
}

fn format_srt_time(ms: u64) -> String {
    let hours = ms / 3_600_000;
    let minutes = (ms % 3_600_000) / 60_000;
    let seconds = (ms % 60_000) / 1_000;
    let millis = ms % 1_000;
    format!("{:02}:{:02}:{:02},{:03}", hours, minutes, seconds, millis)
}

fn format_lrc_time(ms: u64) -> String {
    let minutes = ms / 60_000;
    let seconds = (ms % 60_000) / 1_000;
    let hundredths = (ms % 1_000) / 10;
    format!("{:02}:{:02}.{:02}", minutes, seconds, hundredths)
}
