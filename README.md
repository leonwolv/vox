<div align="center">

# VoxA11y Desktop

**High-Performance Native Accessibility & Text-to-Speech Engine**  
*Built with Rust 2021, Tauri 2.0, and React 19*

[![Release](https://img.shields.io/github/v/release/leonwolv/vox?include_prereleases&style=for-the-badge&color=6366f1)](https://github.com/leonwolv/vox/releases)
[![Build Status](https://img.shields.io/github/actions/workflow/status/leonwolv/vox/build-all-platforms.yml?branch=main&style=for-the-badge&label=Build%20Status)](https://github.com/leonwolv/vox/actions)
[![Stars](https://img.shields.io/github/stars/leonwolv/vox?style=for-the-badge&color=eab308)](https://github.com/leonwolv/vox)
[![Platforms](https://img.shields.io/badge/Platforms-Windows%20%7C%20macOS%20%7C%20Linux-emerald?style=for-the-badge)](https://github.com/leonwolv/vox/releases)
[![Tauri](https://img.shields.io/badge/Tauri-v2.0-24c8db?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-2021%20Edition-dea584?style=for-the-badge&logo=rust&logoColor=white)](https://rust-lang.org)
[![WCAG](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AAA-blueviolet?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)

<p align="center">
  <a href="#-quick-download--releases">Downloads</a> •
  <a href="#-core-features">Features</a> •
  <a href="#-keyboard-shortcuts">Shortcuts</a> •
  <a href="#-building-from-source">Building from Source</a> •
  <a href="#-automated-cicd-pipeline">CI/CD Pipeline</a> •
  <a href="#-troubleshooting">Troubleshooting</a>
</p>

</div>

---

## 🌟 Overview

**VoxA11y Desktop** is an ultra-fast, cross-platform accessibility desktop application and speech synthesis engine. Designed specifically for low-vision users, dyslexic readers, educators, and enterprise accessibility workflows, VoxA11y integrates directly into the host operating system to read selected text across **any** active desktop window (Microsoft Word, Google Chrome, Adobe Acrobat Reader, terminal emulators, and native applications).

Unlike browser-only extensions, VoxA11y runs as a persistent native background daemon equipped with:
- **Zero Cloud Latency**: 100% local text-to-speech processing with hardware-accelerated speech synthesizers.
- **Always-on-Top Floating Widget**: Compact, distraction-free control panel that floats over your active work.
- **Offline Whisper Speech-to-Text**: Privacy-first voice dictation without data leaving your workstation.
- **Deep OS Integration**: Native tray icon, global keyboard shortcuts, and OS accessibility tree inspection via Microsoft UI Automation (Windows), ApplicationServices / AXUIElement (macOS), and AT-SPI2 D-Bus (Linux).

---

## 📦 Quick Download & Releases

Pre-compiled, cryptographically verified installers for Windows, macOS, and Linux are automatically built and published on the [**GitHub Releases Page**](https://github.com/leonwolv/vox/releases).

| Platform | Format | Architecture | Notes |
| :--- | :--- | :--- | :--- |
| **Windows** | `.msi` (WiX) | `x64` | Enterprise MSI with Start Menu shortcut & SAPI 5 registration |
| **Windows** | `.exe` (NSIS) | `x64` | Lightweight standalone setup executable |
| **macOS** | `.dmg` | Universal (`arm64` + `x86_64`) | Single binary for Apple Silicon (M1/M2/M3/M4) & Intel Macs |
| **macOS** | `.app` | Universal (`arm64` + `x86_64`) | Portable application bundle with Accessibility entitlements |
| **Linux** | `.deb` | `x86_64` | Debian, Ubuntu, and Linux Mint package |
| **Linux** | `.AppImage` | `x86_64` | Universal standalone portable Linux executable (no install required) |

*Every release includes a `SHA256SUMS.txt` file allowing system administrators to verify package integrity.*

---

## ⚡ Core Features

- **Global Screen Reader Hotkey**: Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Space</kbd> (or <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>Space</kbd> on macOS) to instantly read highlighted text from any application.
- **Native System Tray Integration**: Minimizes cleanly to the Windows taskbar tray, macOS menu bar, or Linux indicator panel with one-click quick controls.
- **Multi-Engine Speech Support**:
  - **Windows**: Microsoft SAPI 5, OneCore Speech, and UI Automation TextPattern.
  - **macOS**: AVFoundation `AVSpeechSynthesizer` and VoiceOver integration.
  - **Linux**: Speech Dispatcher (`speechd`) and AT-SPI2 accessibility bus.
- **Dynamic Speech Controls**: Real-time adjustment of speech rate (50–400 WPM), pitch, volume, and voice selection.
- **Offline Voice Dictation**: Built-in Whisper STT integration for accurate voice-to-text dictation without cloud dependence.
- **WCAG 2.2 AAA & DigiToegankelijk Compliant**: High-contrast dark theme, accessible typography, screen-reader optimized focus rings, and strict ARIA landmark roles.

---

## ⌨️ Keyboard Shortcuts

| Shortcut (Windows / Linux) | Shortcut (macOS) | Action |
| :--- | :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Space</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>Space</kbd> | **Play / Pause** reading currently selected text |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>O</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>O</kbd> | **Toggle Floating Widget** (Show / Hide overlay) |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> | **Stop** reading immediately |
| <kbd>Ctrl</kbd> + <kbd>+</kbd> / <kbd>-</kbd> | <kbd>Cmd</kbd> + <kbd>+</kbd> / <kbd>-</kbd> | Increase / Decrease speech rate |
| <kbd>Esc</kbd> | <kbd>Esc</kbd> | Dismiss floating speech bubble |

---

## 💻 System Requirements

- **Windows**: Windows 10 (1903+) or Windows 11 (64-bit). Microsoft Edge WebView2 (pre-installed on Windows 10/11).
- **macOS**: macOS Big Sur (11.0) or newer (macOS Sonoma, Sequoia fully supported). Apple Silicon and Intel.
- **Linux**: Ubuntu 20.04+, Debian 11+, Fedora 36+, or Arch Linux with WebKitGTK 4.1.

---

## 🛠️ Building from Source

### Prerequisites
1. **Node.js**: `v20` or `v22` LTS installed ([nodejs.org](https://nodejs.org)).
2. **Rust**: Latest stable Rust compiler ([rustup.rs](https://rustup.rs)).

```bash
# Clone the repository
git clone https://github.com/leonwolv/vox.git
cd vox
```

### Windows Build

```powershell
# 1. Install dependencies and Windows native bindings
npm install --legacy-peer-deps --include=optional
npm install --legacy-peer-deps --no-save @tauri-apps/cli-win32-x64-msvc @rolldown/binding-win32-x64-msvc lightningcss-win32-x64-msvc @tailwindcss/oxide-win32-x64-msvc

# 2. Build Web Frontend
npm run build

# 3. Build native MSI and EXE installers
npx @tauri-apps/cli build
```
*(Or simply double-click `build-windows.bat` in File Explorer).*

The compiled installers will be located in:
- `src-tauri/target/release/bundle/msi/*.msi`
- `src-tauri/target/release/bundle/nsis/*.exe`

### macOS Build

```bash
# 1. Add Universal compilation targets
rustup target add aarch64-apple-darwin x86_64-apple-darwin

# 2. Install dependencies & build frontend
npm install --legacy-peer-deps
npm run build

# 3. Build Universal DMG and APP bundle
npx @tauri-apps/cli build --target universal-apple-darwin
```

The compiled disk image will be located in:
- `src-tauri/target/universal-apple-darwin/release/bundle/dmg/*.dmg`

### Linux Build (Debian / Ubuntu)

```bash
# 1. Install required system and accessibility headers
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl wget file \
  libxdo-dev libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libspeechd-dev libatspi2.0-dev

# 2. Install dependencies & build frontend
npm install --legacy-peer-deps
npm run build

# 3. Build .deb and .AppImage packages
npx @tauri-apps/cli build
```

The compiled packages will be located in:
- `src-tauri/target/release/bundle/deb/*.deb`
- `src-tauri/target/release/bundle/appimage/*.AppImage`

---

## 🚀 Automated CI/CD Pipeline

The repository includes enterprise-grade GitHub Actions workflows located in `.github/workflows/`:

- **Official Release Pipeline (`.github/workflows/release.yml`)**:
  - **Trigger**: Creating a Git version tag (e.g. `v0.1.0`, `v1.0.0`).
  - **Operation**: Compiles Windows (`.msi`, `.exe`), macOS Universal (`.dmg`, `.app`), and Linux (`.deb`, `.AppImage`) across 3 parallel runner matrix jobs.
  - **Publishing**: Downloads all compiled binaries, computes cryptographic `SHA256SUMS.txt`, creates an official GitHub Release with release notes, and attaches all assets.

```bash
# How to release a new version:
git tag v0.1.0
git push origin v0.1.0
# The GitHub Actions release pipeline handles the rest automatically!
```

- **Individual Platform Workflows**:
  - `build-all-platforms.yml`: Daily matrix build testing all 3 operating systems.
  - `build-windows-msi.yml`: Dedicated Windows MSI/EXE workflow.
  - `build-macos.yml`: Dedicated macOS Universal DMG/APP workflow.
  - `build-linux.yml`: Dedicated Linux DEB/AppImage workflow.

---

## 🔍 Troubleshooting

### 1. `Cannot find module '@tauri-apps/cli-win32-x64-msvc'` or `@rolldown/binding-...` (Windows)
- **Cause**: Known npm Windows issue ([npm #4828](https://github.com/npm/cli/issues/4828)) where optional binary dependencies are skipped.
- **Solution**: Install native bindings explicitly via:
  ```powershell
  npm install --legacy-peer-deps --no-save @tauri-apps/cli-win32-x64-msvc @rolldown/binding-win32-x64-msvc lightningcss-win32-x64-msvc @tailwindcss/oxide-win32-x64-msvc && npm run tauri build
  ```

### 2. `OUT_DIR env var is not set, do you have a build script?` (All Platforms)
- **Cause**: Missing `src-tauri/build.rs`. Tauri 2 requires Cargo to run `tauri_build::build()` during compilation.
- **Solution**: Ensure `src-tauri/build.rs` exists with:
  ```rust
  fn main() {
      tauri_build::build();
  }
  ```

### 3. `IO error for operation on ApplicationServices.framework` (macOS)
- **Cause**: Listing system frameworks under `bundle.macOS.frameworks` in `tauri.conf.json`. Tauri treats that array as local files to copy into `Contents/Frameworks/`.
- **Solution**: System frameworks must be linked in `src-tauri/build.rs` via `println!("cargo:rustc-link-lib=framework=ApplicationServices");` instead of being specified in `tauri.conf.json`.

---

## 📄 License & Accessibility Compliance

- **License**: Released under the [MIT License](LICENSE).
- **Accessibility Standards**: Developed according to [W3C WCAG 2.2 Level AAA](https://www.w3.org/WAI/standards-guidelines/wcag/) and Dutch accessibility regulations (*DigiToegankelijk* / EN 301 549).
- **Privacy Guarantee**: VoxA11y Desktop operates 100% offline. No audio, synthesized text, or telemetry data is transmitted to external servers.

---

<div align="center">
  <sub>Built with ❤️ for accessible computing everywhere.</sub>
</div>
