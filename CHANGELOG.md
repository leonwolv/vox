# Changelog

All notable changes to the **VoxA11y Desktop** project are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

## [v0.1.0] - 2026-11-05

### ✨ Features
- **a11y**: integrate native Microsoft UI Automation for Windows 10/11
- **tts**: add AVFoundation speech synthesizer binding for macOS Sonoma/Sequoia
- **linux**: implement AT-SPI2 D-Bus accessibility and Speech Dispatcher integration
- **stt**: built-in Whisper speech-to-text offline voice dictation
- **ui**: always-on-top transparent floating control widget with global hotkeys
- **tray**: native cross-platform system tray icon and background resident daemon

### 🐛 Bug Fixes
- **windows**: install missing @tauri-apps/cli-win32-x64-msvc native binary wrapper
- **build**: add src-tauri/build.rs to resolve Cargo OUT_DIR environment variable
- **macos**: dynamically link ApplicationServices.framework instead of embedding bundle file
- **ci**: remove unquoted square brackets in GitHub Actions workflow step names

### 📝 Documentation
- **readme**: comprehensive English open-source documentation with WCAG 2.2 AAA guidelines

### 🔧 Build & CI/CD
- **pipeline**: automated multi-platform GitHub Release workflow with SHA256 checksums
