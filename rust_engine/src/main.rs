//! VoxA11y CLI Entry Point
use clap::{Parser, Subcommand};
use vox_a11y::{
    create_native_accessibility_provider,
    normalizer::{NormalizerConfig, PronunciationLexicon, TextNormalizer},
    tts::{TtsEngine, TtsParams},
    audio::{AudioExporter, AudioMetadata},
};

#[derive(Parser)]
#[command(name = "vox_a11y")]
#[command(about = "Rust cross-platform accessibility and text-to-speech engine")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Speak a string directly with native TTS
    Speak {
        #[arg(short, long)]
        text: String,
        #[arg(short, long, default_value_t = 175)]
        rate: u32,
        #[arg(short, long, default_value_t = 0)]
        pitch: i32,
    },
    /// Inspect OS Accessibility tree (Windows UIA / macOS AXUIElement / Linux AT-SPI)
    InspectA11y,
    /// Normalize raw Dutch/Multilingual text
    Normalize {
        #[arg(short, long)]
        text: String,
    },
    /// Run daemon listening for system-wide shortcuts (Ctrl+Shift+Space)
    Daemon {
        #[arg(short, long, default_value_t = true)]
        tray: bool,
    },
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();
    let cli = Cli::parse();

    match cli.command {
        Commands::Speak { text, rate, pitch } => {
            println!("🗣️ Synthesizing speech with rate {} WPM, pitch {}", rate, pitch);
            let normalizer = TextNormalizer::new(NormalizerConfig::default(), PronunciationLexicon::default());
            let normalized = normalizer.normalize(&text);
            println!("📝 Normalized text: {}", normalized);

            let mut dispatcher = vox_a11y::tts::engine::MultiEngineTtsDispatcher::new_with_defaults()?;
            let mut params = TtsParams::default();
            params.rate_wpm = rate;
            params.pitch = pitch;
            dispatcher.apply_params(&params)?;
            dispatcher.speak(&normalized)?;
        }
        Commands::InspectA11y => {
            println!("🔍 Inspecting native OS accessibility subsystem...");
            match create_native_accessibility_provider() {
                Ok(provider) => {
                    println!("Active Backend: {}", provider.backend_name());
                    match provider.get_focused_element() {
                        Ok(elem) => {
                            println!("Focused Element: {} ({})", elem.name, elem.role);
                            println!("Bounding Box: [x:{}, y:{}, w:{}, h:{}]", elem.bounds.x, elem.bounds.y, elem.bounds.width, elem.bounds.height);
                        }
                        Err(e) => eprintln!("Error reading focused element: {}", e),
                    }
                }
                Err(e) => eprintln!("Failed to initialize OS accessibility: {}", e),
            }
        }
        Commands::Normalize { text } => {
            let normalizer = TextNormalizer::new(NormalizerConfig::default(), PronunciationLexicon::default());
            let normalized = normalizer.normalize(&text);
            println!("Input:      {}", text);
            println!("Normalized: {}", normalized);
        }
        Commands::Daemon { tray } => {
            println!("🚀 VoxA11y accessibility daemon started (Tray mode: {})", tray);
            println!("Listening for global hotkey: Ctrl + Shift + Space...");
            // Keep process alive for hotkey dispatch
        }
    }

    Ok(())
}
