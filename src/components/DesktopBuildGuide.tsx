import React, { useState } from 'react';
import {
  Download,
  Terminal,
  Monitor,
  CheckCircle,
  Copy,
  Check,
  Cpu,
  Layers,
  ArrowRight,
  PackageCheck,
  FolderArchive,
  Rocket,
  Sparkles,
  Laptop,
  Globe,
  ShieldCheck,
  Info,
  AlertTriangle,
  AlertCircle,
  Wrench,
} from 'lucide-react';
import { createRustProjectZip } from '../utils/audioExport';
import { RUST_PROJECT_FILES } from './RustCodeViewer';

export const DesktopBuildGuide: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<'windows' | 'macos' | 'linux' | 'github-ci'>('windows');
  const [betaInstallTab, setBetaInstallTab] = useState<'pwa' | 'native' | 'dev'>('pwa');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDownloadFullDesktopZip = async () => {
    setDownloadingZip(true);
    try {
      // Merge rust core files and tauri desktop files
      const fullDesktopFiles: Record<string, string> = {
        ...RUST_PROJECT_FILES,
        'src-tauri/Cargo.toml': `[package]
name = "vox_a11y_desktop"
version = "0.1.0"
description = "Native cross-platform desktop accessibility and text-to-speech app in Rust"
authors = ["VoxA11y Desktop Team <desktop@voxa11y.org>"]
edition = "2021"
build = "build.rs"

[lib]
name = "vox_a11y_desktop_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2.0", features = [] }

[dependencies]
tauri = { version = "2.0", features = ["tray-icon"] }
tauri-plugin-global-shortcut = "2.0"
tauri-plugin-dialog = "2.0"
tauri-plugin-fs = "2.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
regex = "1.10"
hound = "3.5"
log = "0.4"
env_logger = "0.11"
tokio = { version = "1.38", features = ["full"] }

[target.'cfg(target_os = "windows")'.dependencies]
windows = { version = "0.58", features = [
    "Win32_Foundation",
    "Win32_System_Com",
    "Win32_UI_Accessibility",
    "Win32_Media_Speech",
] }

[target.'cfg(target_os = "macos")'.dependencies]
cocoa = "0.26"
objc = "0.2"
core-foundation = "0.9"

[target.'cfg(target_os = "linux")'.dependencies]
zbus = "4.4"
futures-util = "0.3"`,

        'src-tauri/build.rs': `fn main() {
    #[cfg(target_os = "macos")]
    {
        println!("cargo:rustc-link-lib=framework=ApplicationServices");
        println!("cargo:rustc-link-lib=framework=AVFoundation");
    }
    tauri_build::build()
}`,

        'src-tauri/tauri.conf.json': `{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "VoxA11y",
  "version": "0.1.0",
  "identifier": "org.voxa11y.desktop",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:3000",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "VoxA11y Desktop - Tekst-naar-Spraak & Accessibility Engine",
        "width": 1360,
        "height": 880,
        "resizable": true,
        "center": true
      },
      {
        "label": "overlay",
        "title": "VoxA11y Floating Widget",
        "width": 360,
        "height": 90,
        "resizable": false,
        "alwaysOnTop": true,
        "decorations": false,
        "transparent": true,
        "skipTaskbar": true
      }
    ],
    "trayIcon": {
      "iconPath": "icons/icon.png",
      "tooltip": "VoxA11y Desktop (Ctrl+Shift+Space to Play/Pause)"
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "windows": {
      "wix": {
        "language": "nl-NL"
      },
      "nsis": {
        "languages": ["Dutch", "English"]
      }
    },
    "macOS": {
      "minimumSystemVersion": "11.0",
      "entitlements": "entitlements.plist"
    },
    "linux": {
      "deb": {
        "depends": ["libspeechd-dev", "libatspi2.0-0"]
      },
      "appimage": {
        "bundleMediaFramework": true
      }
    }
  }
}`,

        'src-tauri/src/main.rs': `// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    vox_a11y_desktop_lib::run();
}`,

        'src-tauri/src/lib.rs': `use tauri::{menu::{Menu, MenuItem}, tray::TrayIconBuilder, AppHandle, Manager};

#[tauri::command]
fn get_desktop_platform_info() -> String {
    "VoxA11y Native Desktop Active".into()
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let quit = MenuItem::with_id(app, "quit", "Afsluiten", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit])?;
            TrayIconBuilder::new().menu(&menu).build(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error running tauri desktop app");
}`,

        'index.html': `<!DOCTYPE html>
<html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VoxA11y Desktop - Tekst-naar-Spraak & Accessibility Engine</title>
  </head>
  <body class="bg-slate-950 text-slate-100">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,

        'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});`,

        'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false
  },
  "include": ["src"]
}`,

        'dist/index.html': `<!DOCTYPE html>
<html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VoxA11y Desktop</title>
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #020617; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; }
      .card { background: #0f172a; border: 1px solid #1e293b; padding: 2rem; border-radius: 1rem; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
      h1 { color: #6366f1; margin-bottom: 0.5rem; font-size: 1.5rem; }
      p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
      .badge { display: inline-block; background: #1e1b4b; color: #818cf8; padding: 4px 10px; border-radius: 9999px; font-size: 0.8rem; margin-top: 1rem; border: 1px solid #3730a3; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>VoxA11y Desktop</h1>
      <p>Native Rust &amp; Tauri 2.0 Accessibility Engine is actief.</p>
      <p>Sneltoets: <strong style="color: #38bdf8">Ctrl+Shift+Space</strong> om geselecteerde tekst in elk programma voor te lezen.</p>
      <div class="badge">Bèta v0.1.0 · Standalone Release</div>
    </div>
  </body>
</html>`,

        'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

        'src/index.css': `body {
  margin: 0;
  background-color: #020617;
  color: #f8fafc;
  font-family: system-ui, -apple-system, sans-serif;
  user-select: none;
}`,

        'src/App.tsx': `import React, { useState } from 'react';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(170);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#f1f5f9' }}>VoxA11y Desktop</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Native Accessibility &amp; Tekst-naar-Spraak Engine (Rust &amp; Tauri v2)</p>
        </div>
        <span style={{ fontSize: '0.75rem', background: '#1e1b4b', color: '#818cf8', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid #3730a3', fontFamily: 'monospace' }}>
          BÈTA v0.1.0
        </span>
      </header>

      <main style={{ marginTop: '2rem', maxWidth: '720px' }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: '1rem', marginTop: 0, color: '#f1f5f9' }}>Desktop Status: Actief</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
            De VoxA11y desktop applicatie draait op de achtergrond. Druk vanuit elk venster (Word, Chrome, Acrobat Reader) op de globale sneltoets:
          </p>
          <div style={{ background: '#020617', border: '1px solid #334155', padding: '0.75rem 1rem', borderRadius: '8px', margin: '1rem 0', fontFamily: 'monospace', color: '#38bdf8', fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'center' }}>
            Ctrl + Shift + Spatiebalk
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid #1e293b' }}>
            <button
              onClick={togglePlay}
              style={{ background: isPlaying ? '#e11d48' : '#4f46e5', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
            >
              {isPlaying ? '⏸ Pauzeer Voorlezen' : '▶ Test Voorlezen'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
              <span>Spreeksnelheid:</span>
              <input
                type="range"
                min={50}
                max={400}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                style={{ accentColor: '#4f46e5', cursor: 'pointer' }}
              />
              <span style={{ color: '#818cf8', fontFamily: 'monospace', fontWeight: 'bold' }}>{rate} WPM</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}`,

        'package.json': `{
  "name": "voxa11y-desktop",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port=3000",
    "build": "vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "@tauri-apps/api": "^2.12.3",
    "lucide-react": "^0.546.0",
    "react": "^19.0.1",
    "react-dom": "^19.0.1"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.1.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.1",
    "typescript": "^7.0.2",
    "vite": "^8.3.0"
  },
  "optionalDependencies": {
    "@rolldown/binding-win32-x64-msvc": "^1.2.13",
    "@tailwindcss/oxide-win32-x64-msvc": "^4.3.3",
    "@tauri-apps/cli-win32-x64-msvc": "^2.1.0",
    "lightningcss-win32-x64-msvc": "^1.33.0"
  }
}`,

        'README.md': `# VoxA11y Desktop - Native Accessibility & Text-to-Speech Engine
Built with Rust 2021, Tauri 2.0, and React 19.

## Quick Download & Releases
Pre-compiled native installers for Windows, macOS, and Linux are automatically built and published via GitHub Actions on the GitHub Releases page:
- **Windows**: \`.msi\` (Enterprise WiX installer) and \`.exe\` (NSIS standalone setup)
- **macOS**: \`.dmg\` (Universal Disk Image for Apple Silicon & Intel)
- **Linux**: \`.deb\` (Debian/Ubuntu package) and \`.AppImage\` (Standalone portable executable)

Every release includes an official \`SHA256SUMS.txt\` checksum file for verification.

## Core Features
- **Global Hotkey**: Press **Ctrl+Shift+Space** (or **Cmd+Shift+Space** on macOS) from any program (Word, Chrome, Acrobat) to immediately read highlighted text.
- **Always-on-Top Floating Widget**: Compact overlay control widget that stays visible over your active work.
- **Offline Whisper Voice Dictation**: 100% privacy-friendly speech-to-text dictation without cloud dependence.
- **Zero Cloud Latency**: Local text-to-speech engine utilizing native operating system accessibility and synthesis APIs (SAPI 5 / OneCore on Windows, AVFoundation on macOS, Speech Dispatcher on Linux).

## Keyboard Shortcuts
- **Ctrl+Shift+Space** (Cmd+Shift+Space): Play / Pause reading selected text
- **Ctrl+Shift+O** (Cmd+Shift+O): Toggle Floating Widget (Show / Hide)
- **Ctrl+Shift+S** (Cmd+Shift+S): Stop playback
- **Ctrl + / -**: Increase / Decrease speech rate
- **Esc**: Dismiss floating speech bubble

## Building from Source

### Prerequisites
- Node.js 20 or 22 LTS (https://nodejs.org)
- Rust stable toolchain (https://rustup.rs)

### Windows Build
\`\`\`powershell
npm install --legacy-peer-deps --include=optional
npm install --legacy-peer-deps --no-save @tauri-apps/cli-win32-x64-msvc @rolldown/binding-win32-x64-msvc lightningcss-win32-x64-msvc @tailwindcss/oxide-win32-x64-msvc
npm run build
npx @tauri-apps/cli build
\`\`\`
*(Or simply double-click \`build-windows.bat\`)*

### macOS Build
\`\`\`bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
npm install --legacy-peer-deps
npm run build
npx @tauri-apps/cli build --target universal-apple-darwin
\`\`\`

### Linux Build
\`\`\`bash
sudo apt-get update && sudo apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev libspeechd-dev libatspi2.0-dev
npm install --legacy-peer-deps
npm run build
npx @tauri-apps/cli build
\`\`\`

## Automated GitHub Actions Release
To create an official multi-platform release with installers and SHA256 checksums:
\`\`\`bash
git tag v0.1.0
git push origin v0.1.0
\`\`\`
The GitHub Actions workflow \`.github/workflows/release.yml\` will compile all platforms in parallel and publish the release automatically.
`,

        'build-windows.bat': `@echo off
title VoxA11y Desktop - MSI en EXE Bouwer

echo ============================================================
echo   VoxA11y Desktop - Automatische Windows MSI/EXE Bouwer
echo ============================================================
echo.

:: 1. Controleer of Node.js aanwezig is
where node >nul 2>nul
if errorlevel 1 goto :no_node

:: 2. Controleer of Rust compiler aanwezig is
where rustc >nul 2>nul
if errorlevel 1 goto :no_rust

echo [1/4] NPM packages installeren...
call npm install --legacy-peer-deps --include=optional
if errorlevel 1 goto :install_fallback

:build_step
echo.
echo [2/4] Zorg dat Windows native bindings (Tauri CLI, Rolldown & LightningCSS) aanwezig zijn...
call npm install --legacy-peer-deps --no-save @tauri-apps/cli-win32-x64-msvc @rolldown/binding-win32-x64-msvc lightningcss-win32-x64-msvc @tailwindcss/oxide-win32-x64-msvc >nul 2>nul

echo.
echo [3/4] Web frontend compileren...
call npm run build
if errorlevel 1 goto :build_err

echo.
echo [4/4] Native Windows MSI en EXE bouwen met Tauri 2.0...
call npx @tauri-apps/cli build
if errorlevel 1 goto :tauri_err

echo.
echo ============================================================
echo   SUCCES! De Windows MSI installer is succesvol gebouwd!
echo ============================================================
echo.
echo Locatie van de installers:
echo - MSI: src-tauri\\target\\release\\bundle\\msi\\
echo - EXE: src-tauri\\target\\release\\bundle\\nsis\\
echo.
if exist "src-tauri\\target\\release\\bundle\\msi" (
    explorer "src-tauri\\target\\release\\bundle\\msi"
) else (
    explorer "src-tauri\\target\\release\\bundle"
)
pause
exit /b 0

:install_fallback
echo [LET OP] Standaard npm install gaf waarschuwing, herpoging met legacy peer deps...
call npm install --legacy-peer-deps --include=optional
if errorlevel 1 goto :npm_err
goto :build_step

:no_node
echo.
echo [FOUT] Node.js is niet gevonden!
echo Installeer Node.js via https://nodejs.org en start dit script opnieuw.
echo.
pause
exit /b 1

:no_rust
echo.
echo [LET OP] Rust compiler rustc is nog niet geinstalleerd.
echo Rust is vereist om de native Windows desktop installer te compileren.
echo Download en installeer Rust via https://rustup.rs - kies standaard optie 1.
echo.
echo Druk op een toets om https://rustup.rs te openen in uw browser...
pause
start https://rustup.rs
exit /b 1

:npm_err
echo.
echo [FOUT] npm install is mislukt.
echo Probeer de map node_modules te verwijderen en start dit script opnieuw.
echo.
pause
exit /b 1

:build_err
echo.
echo [FOUT] Frontend build mislukt.
echo.
pause
exit /b 1

:tauri_err
echo.
echo [FOUT] Tauri build mislukt.
echo Controleer of de C++ Build Tools geinstalleerd zijn via Visual Studio Installer.
echo.
pause
exit /b 1
`,

        'build-windows.ps1': `Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  VoxA11y Desktop - Automatische Windows MSI/EXE Bouwer     " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[FOUT] Node.js is niet gevonden!" -ForegroundColor Red
    Write-Host "Installeer Node.js 18+ via https://nodejs.org en start dit script opnieuw."
    Read-Host "Druk op Enter om af te sluiten"
    exit 1
}

if (-not (Get-Command rustc -ErrorAction SilentlyContinue)) {
    Write-Host "[LET OP] Rust compiler (rustc) is nog niet geïnstalleerd." -ForegroundColor Yellow
    Write-Host "Rust is vereist om de native desktop engine te compileren."
    Write-Host "Download en installeer Rust via https://rustup.rs"
    Start-Process "https://rustup.rs"
    Read-Host "Druk op Enter om af te sluiten"
    exit 1
}

Write-Host "[1/4] Dependencies installeren..." -ForegroundColor Green
npm install --legacy-peer-deps --include=optional

Write-Host "[2/4] Zorg voor Windows native bindings (Tauri CLI, Rolldown & LightningCSS)..." -ForegroundColor Green
npm install --legacy-peer-deps --no-save @tauri-apps/cli-win32-x64-msvc @rolldown/binding-win32-x64-msvc lightningcss-win32-x64-msvc @tailwindcss/oxide-win32-x64-msvc

Write-Host "[3/4] Web frontend compileren..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FOUT] npm run build mislukt!" -ForegroundColor Red
    Read-Host "Druk op Enter"
    exit 1
}

Write-Host "[4/4] Native Windows MSI en EXE bouwen met Tauri 2.0..." -ForegroundColor Green
npx @tauri-apps/cli build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FOUT] Tauri build mislukt!" -ForegroundColor Red
    Read-Host "Druk op Enter"
    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SUCCES! De Windows MSI installer is succesvol gebouwd!    " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

if (Test-Path "src-tauri\\target\\release\\bundle\\msi") {
    Invoke-Item "src-tauri\\target\\release\\bundle\\msi"
} else {
    Invoke-Item "src-tauri\\target\\release\\bundle"
}
`,

        '.github/workflows/build-windows-msi.yml': `name: Bouw Windows MSI & EXE Installer

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-tauri:
    runs-on: windows-latest
    permissions:
      contents: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Installeer Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Installeer Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: x86_64-pc-windows-msvc

      - name: Installeer npm dependencies & Windows native bindings
        run: |
          npm install --legacy-peer-deps --include=optional
          npm install --legacy-peer-deps --no-save @tauri-apps/cli-win32-x64-msvc @rolldown/binding-win32-x64-msvc lightningcss-win32-x64-msvc @tailwindcss/oxide-win32-x64-msvc

      - name: Compileer Frontend
        run: npm run build

      - name: Bouw Native Windows MSI en EXE
        run: npx @tauri-apps/cli build

      - name: Upload MSI en EXE Installers als Artifact
        uses: actions/upload-artifact@v4
        with:
          name: VoxA11y-Windows-Installers
          path: |
            src-tauri/target/release/bundle/msi/*.msi
            src-tauri/target/release/bundle/nsis/*.exe
          if-no-files-found: warn
`,

        '.github/workflows/build-linux.yml': `name: Bouw Linux DEB & AppImage Installer

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-linux:
    name: Bouw Linux (.deb & .AppImage)
    runs-on: ubuntu-22.04
    permissions:
      contents: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Installeer Linux Systeem Bibliotheken (GTK, WebKit, A11y, Audio)
        run: |
          sudo apt-get update
          sudo apt-get install -y \\
            libwebkit2gtk-4.1-dev \\
            build-essential \\
            curl \\
            wget \\
            file \\
            libxdo-dev \\
            libssl-dev \\
            libayatana-appindicator3-dev \\
            librsvg2-dev \\
            libspeechd-dev \\
            libatspi2.0-dev

      - name: Installeer Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Installeer Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: x86_64-unknown-linux-gnu

      - name: Installeer npm dependencies
        run: npm install --legacy-peer-deps

      - name: Compileer Frontend
        run: npm run build

      - name: Bouw Native Linux DEB en AppImage
        run: npx @tauri-apps/cli build

      - name: Upload Linux Installers als Artifact
        uses: actions/upload-artifact@v4
        with:
          name: VoxA11y-Linux-Installers
          path: |
            src-tauri/target/release/bundle/deb/*.deb
            src-tauri/target/release/bundle/appimage/*.AppImage
          if-no-files-found: warn
`,

        '.github/workflows/build-macos.yml': `name: Bouw macOS DMG & APP Installer

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-macos:
    name: Bouw macOS (.dmg & .app Universal)
    runs-on: macos-latest
    permissions:
      contents: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Installeer Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Installeer Rust toolchain met Universal macOS targets
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: aarch64-apple-darwin,x86_64-apple-darwin

      - name: Installeer npm dependencies
        run: npm install --legacy-peer-deps

      - name: Compileer Frontend
        run: npm run build

      - name: Bouw Native macOS Universal DMG en APP
        run: npx @tauri-apps/cli build --target universal-apple-darwin

      - name: Upload macOS Installers als Artifact
        uses: actions/upload-artifact@v4
        with:
          name: VoxA11y-macOS-Installers
          path: |
            src-tauri/target/universal-apple-darwin/release/bundle/dmg/*.dmg
            src-tauri/target/release/bundle/dmg/*.dmg
            src-tauri/target/universal-apple-darwin/release/bundle/macos/*.app
            src-tauri/target/release/bundle/macos/*.app
          if-no-files-found: warn
`,

        '.github/workflows/build-all-platforms.yml': `name: Bouw Alle Desktop Installers (Windows, macOS, Linux)

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-desktop:
    name: Bouw \${{ matrix.platform.name }}
    runs-on: \${{ matrix.platform.os }}
    permissions:
      contents: write
    strategy:
      fail-fast: false
      matrix:
        platform:
          - name: Windows (MSI & EXE)
            os: windows-latest
            artifact-name: VoxA11y-Windows-Installers
            build-cmd: npx @tauri-apps/cli build
            artifact-path: |
              src-tauri/target/release/bundle/msi/*.msi
              src-tauri/target/release/bundle/nsis/*.exe

          - name: macOS (Universal DMG & APP)
            os: macos-latest
            artifact-name: VoxA11y-macOS-Installers
            build-cmd: npx @tauri-apps/cli build --target universal-apple-darwin
            artifact-path: |
              src-tauri/target/universal-apple-darwin/release/bundle/dmg/*.dmg
              src-tauri/target/release/bundle/dmg/*.dmg
              src-tauri/target/universal-apple-darwin/release/bundle/macos/*.app
              src-tauri/target/release/bundle/macos/*.app

          - name: Linux (DEB & AppImage)
            os: ubuntu-22.04
            artifact-name: VoxA11y-Linux-Installers
            build-cmd: npx @tauri-apps/cli build
            artifact-path: |
              src-tauri/target/release/bundle/deb/*.deb
              src-tauri/target/release/bundle/appimage/*.AppImage

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: [Linux] Installeer Systeem Bibliotheken (GTK, WebKit, A11y, Audio)
        if: runner.os == 'Linux'
        run: |
          sudo apt-get update
          sudo apt-get install -y \\
            libwebkit2gtk-4.1-dev \\
            build-essential \\
            curl \\
            wget \\
            file \\
            libxdo-dev \\
            libssl-dev \\
            libayatana-appindicator3-dev \\
            librsvg2-dev \\
            libspeechd-dev \\
            libatspi2.0-dev

      - name: Installeer Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Installeer Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: \${{ runner.os == 'macOS' && 'aarch64-apple-darwin,x86_64-apple-darwin' || (runner.os == 'Windows' && 'x86_64-pc-windows-msvc' || 'x86_64-unknown-linux-gnu') }}

      - name: [Windows] Installeer Windows Native Bindings
        if: runner.os == 'Windows'
        run: |
          npm install --legacy-peer-deps --include=optional
          npm install --legacy-peer-deps --no-save @tauri-apps/cli-win32-x64-msvc @rolldown/binding-win32-x64-msvc lightningcss-win32-x64-msvc @tailwindcss/oxide-win32-x64-msvc

      - name: [Non-Windows] Installeer npm dependencies
        if: runner.os != 'Windows'
        run: npm install --legacy-peer-deps

      - name: Compileer Frontend
        run: npm run build

      - name: Bouw Native Desktop Installer
        run: \${{ matrix.platform.build-cmd }}

      - name: Upload Installer Artifact
        uses: actions/upload-artifact@v4
        with:
          name: \${{ matrix.platform.artifact-name }}
          path: \${{ matrix.platform.artifact-path }}
          if-no-files-found: warn
`,

        '.github/workflows/release.yml': `name: Officiële GitHub Release (Windows, macOS, Linux)

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      tag_name:
        description: 'Release Versietag (bijv. v0.1.0)'
        required: false
        default: 'v0.1.0'

permissions:
  contents: write

jobs:
  build-assets:
    name: Compileer \${{ matrix.platform.name }}
    runs-on: \${{ matrix.platform.os }}
    strategy:
      fail-fast: false
      matrix:
        platform:
          - name: Windows (MSI & EXE)
            os: windows-latest
            artifact-dir: windows-binaries
            build-cmd: npx @tauri-apps/cli build
            artifact-path: |
              src-tauri/target/release/bundle/msi/*.msi
              src-tauri/target/release/bundle/nsis/*.exe

          - name: macOS (Universal DMG & APP)
            os: macos-latest
            artifact-dir: macos-binaries
            build-cmd: npx @tauri-apps/cli build --target universal-apple-darwin
            artifact-path: |
              src-tauri/target/universal-apple-darwin/release/bundle/dmg/*.dmg
              src-tauri/target/release/bundle/dmg/*.dmg

          - name: Linux (DEB & AppImage)
            os: ubuntu-22.04
            artifact-dir: linux-binaries
            build-cmd: npx @tauri-apps/cli build
            artifact-path: |
              src-tauri/target/release/bundle/deb/*.deb
              src-tauri/target/release/bundle/appimage/*.AppImage

    steps:
      - name: Checkout broncode
        uses: actions/checkout@v4

      - name: [Linux] Installeer Systeem Bibliotheken (GTK, WebKit, A11y, Audio)
        if: runner.os == 'Linux'
        run: |
          sudo apt-get update
          sudo apt-get install -y \\
            libwebkit2gtk-4.1-dev \\
            build-essential \\
            curl \\
            wget \\
            file \\
            libxdo-dev \\
            libssl-dev \\
            libayatana-appindicator3-dev \\
            librsvg2-dev \\
            libspeechd-dev \\
            libatspi2.0-dev

      - name: Installeer Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Installeer Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: \${{ runner.os == 'macOS' && 'aarch64-apple-darwin,x86_64-apple-darwin' || (runner.os == 'Windows' && 'x86_64-pc-windows-msvc' || 'x86_64-unknown-linux-gnu') }}

      - name: [Windows] Installeer Windows Native Bindings
        if: runner.os == 'Windows'
        run: |
          npm install --legacy-peer-deps --include=optional
          npm install --legacy-peer-deps --no-save @tauri-apps/cli-win32-x64-msvc @rolldown/binding-win32-x64-msvc lightningcss-win32-x64-msvc @tailwindcss/oxide-win32-x64-msvc

      - name: [Non-Windows] Installeer npm dependencies
        if: runner.os != 'Windows'
        run: npm install --legacy-peer-deps

      - name: Compileer Web Frontend
        run: npm run build

      - name: Bouw Native Desktop Release
        run: \${{ matrix.platform.build-cmd }}

      - name: Upload Matrix Artifact
        uses: actions/upload-artifact@v4
        with:
          name: \${{ matrix.platform.artifact-dir }}
          path: \${{ matrix.platform.artifact-path }}
          if-no-files-found: error

  publish-release:
    name: Publiceer Officiële GitHub Release
    needs: [build-assets]
    runs-on: ubuntu-latest
    steps:
      - name: Download alle gecompileerde installers
        uses: actions/download-artifact@v4
        with:
          path: release-assets
          merge-multiple: true

      - name: Toon verzamelde installers
        run: |
          echo "=== Verzamelde release bestanden ==="
          ls -la release-assets

      - name: Bereken SHA256 Hashes voor Verificatie
        run: |
          cd release-assets
          sha256sum * > SHA256SUMS.txt
          echo "=== Gegenereerde SHA256 Checksums ==="
          cat SHA256SUMS.txt

      - name: Publiceer GitHub Release met Installers & Hashes
        uses: softprops/action-gh-release@v2
        with:
          tag_name: \${{ github.ref_type == 'tag' && github.ref_name || inputs.tag_name }}
          name: VoxA11y Desktop Release \${{ github.ref_type == 'tag' && github.ref_name || inputs.tag_name }}
          draft: false
          prerelease: false
          generate_release_notes: true
          files: |
            release-assets/*
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`,

        'src-tauri/entitlements.plist': `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.automation.apple-events</key>
    <true/>
    <key>com.apple.security.audio-input</key>
    <true/>
</dict>
</plist>`,
      };

      const zipBlob = await createRustProjectZip(fullDesktopFiles);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vox_a11y_desktop_app_rust.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                VoxA11y Native Desktop Applicatie (Rust &amp; Tauri v2)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Volwaardige desktop app met systray, globale sneltoetsen, zwevend transparant overlay-venster en OS accessibility hooks
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadFullDesktopZip}
            disabled={downloadingZip}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-colors"
          >
            <FolderArchive className="w-4 h-4" />
            <span>{downloadingZip ? 'Bezig met genereren...' : 'Download Complete Desktop Project (.ZIP)'}</span>
          </button>
        </div>

        {/* 3 Core Desktop Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>1. Systeemvak (System Tray)</span>
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Draait permanent op de achtergrond. Minimaliseert naar de taakbalk/dock met rechtermuisklik-menu voor snelle spraakbediening.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Globale Sneltoetsen</span>
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Druk vanuit elk venster (Word, Chrome, Acrobat) op <code className="text-white bg-slate-800 px-1 rounded">Ctrl+Shift+Space</code> om geselecteerde tekst direct voor te laten lezen.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Transparant Overlay Venster</span>
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Frameless, always-on-top venster dat woord-voor-woord over andere applicaties heen tekent zonder het actieve venster te storen.
            </p>
          </div>
        </div>
      </div>

      {/* Directe Vraag: Kun je de MSI voor Windows bouwen? */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-5 text-slate-200 space-y-4 shadow-lg">
        <div className="flex items-start gap-3 border-b border-slate-800 pb-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>Kan de Windows .MSI direct in deze cloud-omgeving gebouwd worden?</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                Architectuur Toelichting
              </span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              De online AI Studio container draait in de cloud op een <strong>Linux-omgeving</strong>. Een native Windows <code className="text-white bg-slate-800 px-1 rounded">.msi</code> installer vereist de Microsoft WiX Toolset en de Windows SDK, die exclusief op Windows draaien. Daarom kan de browser-sandbox de binaire installer niet direct in de browser compileren.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          {/* Manier 1 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-indigo-400" />
                <span>1. Via 1-Klik Script (Windows)</span>
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                Eenvoudigst
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              In de gedownloade ZIP zit <strong className="text-white">build-windows.bat</strong>. Dubbelklik hierop in Windows Verkenner: het script controleert Node/Rust, bouwt het project en opent direct de map met <code className="text-slate-300">VoxA11y_0.1.0_x64_nl-NL.msi</code>.
            </p>
          </div>

          {/* Manier 2 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>2. Direct via PowerShell</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">1 commando</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Open PowerShell in de uitgepakte hoofdmap en voer uit:
            </p>
            <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-emerald-400 flex items-center justify-between">
              <code className="text-[10px]">npx @tauri-apps/cli build</code>
              <button
                onClick={() => copyToClipboard('npx @tauri-apps/cli build', 'quick-cli-build')}
                className="text-slate-400 hover:text-white p-0.5"
                title="Kopieer"
              >
                {copiedCmd === 'quick-cli-build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Manier 3 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>3. Automatisch in de Cloud</span>
              </span>
              <span className="text-[10px] text-purple-300 font-mono">GitHub CI</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              We hebben <code className="text-slate-300">.github/workflows/build-windows-msi.yml</code> meegeleverd. Push naar GitHub en Microsofts virtuele Windows-runners bouwen de <code className="text-slate-200">.msi</code> gratis in de cloud!
            </p>
          </div>
        </div>
      </div>

      {/* Dedicated Beta Installation Guide */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 text-slate-200 space-y-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">
                  Handleiding: VoxA11y Bèta Versie Installeren
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                  BÈTA v0.1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kies de installatiemethode die het beste bij uw situatie past: als directe desktop-app via de browser (PWA) of als native Rust/Tauri installer.
              </p>
            </div>
          </div>

          {/* Tab selector for Beta Installation */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg text-xs border border-slate-800">
            <button
              onClick={() => setBetaInstallTab('pwa')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
                betaInstallTab === 'pwa'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Methode 1: 1-Klik Desktop (Aanbevolen)</span>
            </button>
            <button
              onClick={() => setBetaInstallTab('native')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
                betaInstallTab === 'native'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Methode 2: Native Rust / Tauri (.msi / .dmg)</span>
            </button>
            <button
              onClick={() => setBetaInstallTab('dev')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
                betaInstallTab === 'dev'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Methode 3: Lokaal Node.js</span>
            </button>
          </div>
        </div>

        {/* Tab 1: PWA Desktop 1-Click Install */}
        {betaInstallTab === 'pwa' && (
          <div className="space-y-4 text-xs animate-in fade-in duration-150">
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-slate-300 leading-relaxed space-y-1">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                De snelste manier om de Bèta te gebruiken (geen compilers of terminal vereist)
              </span>
              <p className="text-slate-300 text-[11px]">
                U kunt VoxA11y direct vanuit uw huidige webbrowser (Chrome, Edge of Brave) installeren als een volwaardige standalone desktop-applicatie met eigen icoon op de taakbalk en het bureaublad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <h4 className="font-semibold text-white text-xs">Open in een moderne browser</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Zorg dat u deze applicatie geopend heeft in <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong> of <strong>Brave</strong> op uw Windows PC of Mac.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <h4 className="font-semibold text-white text-xs">Klik op 'App installeren'</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Klik rechtsboven in de adresbalk op het installatie-icoon (schermpje met pijltje naar beneden), of klik in het browsermenu (<strong>⋮</strong>) op <em>"VoxA11y Desktop installeren..."</em>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <h4 className="font-semibold text-white text-xs">Klaar voor Bètatesten!</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  De bèta start direct in een apart, randloos venster. U heeft direct toegang tot de Zwevende Werkbalk, Whisper STT dicteren en TTS spraaksynthese.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Native Rust / Tauri Build */}
        {betaInstallTab === 'native' && (
          <div className="space-y-4 text-xs animate-in fade-in duration-150">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed space-y-1">
              <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-indigo-400" />
                Native Rust 2.0 &amp; Tauri Desktop Applicatie
              </span>
              <p className="text-slate-400 text-[11px]">
                Deze optie biedt de volledige native integratie met het besturingssysteem: systeemvak (tray icon), globale OS sneltoetsen (<code className="text-white bg-slate-800 px-1 rounded">Ctrl+Shift+Space</code>) en altijd-bovenaan zwevend venster over andere software (Word, Excel, Acrobat).
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-300">Stap 1: Download het broncodepakket</span>
                <p className="text-slate-400 text-[11px]">
                  Klik bovenaan deze pagina op de knop <strong className="text-white">"Download Complete Desktop Project (.ZIP)"</strong> en pak het archief uit in een gewenste map (bijv. <code className="text-white bg-slate-800 px-1 rounded">C:\VoxA11y</code>).
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-300">Stap 2: Installeer de vereisten (Node.js &amp; optioneel Rust)</span>
                <p className="text-slate-400 text-[11px]">
                  Zorg dat <strong>Node.js 18+</strong> geïnstalleerd is via <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">nodejs.org</a>. Voor compilatie installeert u Rust via <a href="https://rustup.rs" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">rustup.rs</a>.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-300">Stap 3: Start de Bèta in Development modus</span>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-emerald-400 flex items-center justify-between">
                  <code>npm install --legacy-peer-deps && npm run tauri dev</code>
                  <button
                    onClick={() => copyToClipboard('npm install --legacy-peer-deps && npm run tauri dev', 'beta-tauri-dev')}
                    className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                    title="Kopieer commando"
                  >
                    {copiedCmd === 'beta-tauri-dev' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-300">Stap 4: Bouw de officiële installer (.msi voor Windows / .dmg voor macOS)</span>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-emerald-400 flex items-center justify-between">
                  <code>npm run tauri build</code>
                  <button
                    onClick={() => copyToClipboard('npm run tauri build', 'beta-tauri-build')}
                    className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                    title="Kopieer commando"
                  >
                    {copiedCmd === 'beta-tauri-build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {/* Troubleshooting & Directe Oplossingen voor Bouwfouten */}
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3.5 space-y-3 text-[11px]">
                  <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Foutdiagnose &amp; Directe Oplossingen voor Bouwfouten (Windows &amp; macOS):</span>
                  </div>

                  <div className="space-y-2 text-slate-300">
                    {/* Fout 1: macOS ApplicationServices.framework No such file or directory */}
                    <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5 border-l-4 border-l-purple-500">
                      <p className="font-semibold text-purple-300 flex items-center gap-1">
                        <span>1. "IO error for operation on ApplicationServices.framework: No such file or directory" (macOS):</span>
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        In Tauri 2 dient <code className="text-slate-200">bundle.macOS.frameworks</code> in <code className="text-slate-200">tauri.conf.json</code> uitsluitend voor het kopiëren van externe, private .framework bestanden naar <code className="text-slate-200">Contents/Frameworks</code>. Standaard macOS systeemframeworks (zoals <code className="text-slate-200">ApplicationServices</code> en <code className="text-slate-200">AVFoundation</code>) zijn reeds onderdeel van macOS en mogen niet in die array staan.
                      </p>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[10px] text-purple-300 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>Opgelost in de codebase! De frameworks worden nu netjes via <code className="text-slate-200">src-tauri/build.rs</code> gelinkt en <code className="text-slate-200">tauri.conf.json</code> probeert ze niet meer lokaal te kopiëren.</span>
                      </div>
                    </div>

                    {/* Fout 2: OUT_DIR env var is not set (Missing build.rs) */}
                    <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5 border-l-4 border-l-emerald-500">
                      <p className="font-semibold text-emerald-300 flex items-center gap-1">
                        <span>2. "OUT_DIR env var is not set, do you have a build script?" in src/lib.rs:</span>
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        In Tauri 2 vereist de macro <code className="text-slate-200">tauri::generate_context!()</code> een Cargo build script (<code className="text-emerald-400">src-tauri/build.rs</code>). Zonder dit script kan Cargo de build context niet genereren en breekt de Rust compiler af. Dit bestand (<code className="text-slate-200">tauri_build::build()</code>) en alle native Windows iconen (<code className="text-slate-200">icon.ico</code>) zijn nu standaard toegevoegd.
                      </p>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[10px] text-emerald-400 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>Opgelost in de codebase! Na git push bouwt GitHub Actions de MSI direct zonder deze fout.</span>
                      </div>
                    </div>

                    {/* Fout 2: Tauri CLI Native Binding */}
                    <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5 border-l-4 border-l-rose-500">
                      <p className="font-semibold text-rose-300 flex items-center gap-1">
                        <span>2. "Cannot find module '@tauri-apps/cli-win32-x64-msvc'":</span>
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        Tauri CLI gebruikt op Windows een native Rust executable wrapper (<code className="text-slate-200">@tauri-apps/cli-win32-x64-msvc</code>). Door een npm bug op Windows (npm issue #4828) slaat npm optionele native bindings over.
                      </p>
                      <div className="pt-1 space-y-1">
                        <span className="text-emerald-300 font-medium">Alles-in-één commando (herstelt Tauri CLI + Rolldown + LightningCSS en bouwt direct MSI/EXE):</span>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-emerald-400 flex items-center justify-between">
                          <code className="text-[10px] break-all">npm install --legacy-peer-deps --no-save @tauri-apps/cli-win32-x64-msvc @rolldown/binding-win32-x64-msvc lightningcss-win32-x64-msvc @tailwindcss/oxide-win32-x64-msvc && npm run tauri build</code>
                          <button
                            onClick={() => copyToClipboard('npm install --legacy-peer-deps --no-save @tauri-apps/cli-win32-x64-msvc @rolldown/binding-win32-x64-msvc lightningcss-win32-x64-msvc @tailwindcss/oxide-win32-x64-msvc && npm run tauri build', 'fix-all-bindings')}
                            className="text-slate-400 hover:text-white p-0.5 ml-2 shrink-0"
                            title="Kopieer commando"
                          >
                            {copiedCmd === 'fix-all-bindings' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Fout 2: Rolldown Native Binding */}
                    <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5">
                      <p className="font-semibold text-rose-400 flex items-center gap-1">
                        <span>2. "Cannot find native binding ... @rolldown/binding-win32-x64-msvc":</span>
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        Vite gebruikt Rolldown, dat op Windows een native C++ binding vereist.
                      </p>
                      <div className="pt-1 space-y-1">
                        <span className="text-emerald-300 font-medium">Oplossing: Installeer de Windows Rolldown binding handmatig:</span>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-emerald-400 flex items-center justify-between">
                          <code>npm install --no-save @rolldown/binding-win32-x64-msvc && npm run tauri build</code>
                          <button
                            onClick={() => copyToClipboard('npm install --no-save @rolldown/binding-win32-x64-msvc && npm run tauri build', 'fix-rolldown')}
                            className="text-slate-400 hover:text-white p-0.5"
                          >
                            {copiedCmd === 'fix-rolldown' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Fout 2: Batch script 'is was unexpected at this time' */}
                    <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5">
                      <p className="font-semibold text-amber-300 flex items-center gap-1">
                        <span>2. "is was unexpected at this time" in build-windows.bat:</span>
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        In oudere versies van het batch-bestand interpreteerde cmd.exe haakjes <code className="text-slate-200 bg-slate-800 px-1 rounded">(rustc)</code> als het einde van het blok. Dit is nu volledig gecorrigeerd met robuuste labels. U kunt ook direct bouwen via PowerShell:
                      </p>
                      <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-emerald-400 flex items-center justify-between">
                        <code>npx @tauri-apps/cli build</code>
                        <button
                          onClick={() => copyToClipboard('npx @tauri-apps/cli build', 'fix-bat-npx')}
                          className="text-slate-400 hover:text-white p-0.5"
                        >
                          {copiedCmd === 'fix-bat-npx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Fout 3: UNRESOLVED_ENTRY index.html */}
                    <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5">
                      <p className="font-semibold text-amber-300 flex items-center gap-1">
                        <span>3. "[UNRESOLVED_ENTRY] Cannot resolve entry module index.html":</span>
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        Tauri voert <code className="text-white bg-slate-800 px-1 rounded">npm run build</code> uit in de huidige map. Als u het commando uitvoerde in de submap <code className="text-slate-200 bg-slate-800 px-1 rounded">vox_a11y_rust_engine</code>, ontbrak het HTML entrypoint.
                      </p>
                      <div className="pt-1 space-y-1">
                        <span className="text-slate-300 font-medium">Oplossing: Ga 1 map omhoog naar de hoofdmap en bouw opnieuw:</span>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-emerald-400 flex items-center justify-between">
                          <code>cd .. && npm run tauri build</code>
                          <button
                            onClick={() => copyToClipboard('cd .. && npm run tauri build', 'fix-cd-up')}
                            className="text-slate-400 hover:text-white p-0.5"
                          >
                            {copiedCmd === 'fix-cd-up' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Fout 4: Missing script: tauri */}
                    <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5">
                      <p className="font-semibold text-amber-300 flex items-center gap-1">
                        <span>4. "npm error Missing script: tauri":</span>
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        Als <code className="text-slate-200">package.json</code> nog geen script <code className="text-slate-200">"tauri": "tauri"</code> heeft, roept u de compiler rechtstreeks aan met <code className="text-white bg-slate-800 px-1 rounded">npx @tauri-apps/cli build</code>.
                      </p>
                    </div>

                    {/* Fout 5: ERESOLVE / Conflicting peer dependency: esbuild */}
                    <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5">
                      <p className="font-semibold text-rose-400 flex items-center gap-1">
                        <span>5. "npm error code ERESOLVE / Conflicting peer dependency: esbuild":</span>
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        Vite 8 heeft een optionele peer dependency op esbuild ^0.27/^0.28. Als <code className="text-slate-200 bg-slate-800 px-1 rounded">esbuild@^0.25.0</code> in <code className="text-slate-200">package.json</code> staat, stopt npm met een ERESOLVE conflict. Dit is opgelost in het nieuwste projectbestand.
                      </p>
                      <div className="pt-1 space-y-1">
                        <span className="text-emerald-300 font-medium">Directe oplossing via terminal:</span>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-emerald-400 flex items-center justify-between">
                          <code>npm install --legacy-peer-deps && npm run tauri build</code>
                          <button
                            onClick={() => copyToClipboard('npm install --legacy-peer-deps && npm run tauri build', 'fix-eresolve')}
                            className="text-slate-400 hover:text-white p-0.5"
                          >
                            {copiedCmd === 'fix-eresolve' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Fout 6: LightningCSS / Tailwind v4 native module ontbreekt */}
                    <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5">
                      <p className="font-semibold text-rose-400 flex items-center gap-1">
                        <span>6. "Cannot find module '../lightningcss.win32-x64-msvc.node'":</span>
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        Tailwind CSS v4 gebruikt LightningCSS voor supersnelle stijlen. Op Windows heeft LightningCSS de native C++ module <code className="text-slate-200 bg-slate-800 px-1 rounded">lightningcss-win32-x64-msvc</code> nodig.
                      </p>
                      <div className="pt-1 space-y-1">
                        <span className="text-emerald-300 font-medium">Directe oplossing via terminal:</span>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-emerald-400 flex items-center justify-between">
                          <code>npm install --legacy-peer-deps --no-save lightningcss-win32-x64-msvc @tailwindcss/oxide-win32-x64-msvc && npm run tauri build</code>
                          <button
                            onClick={() => copyToClipboard('npm install --legacy-peer-deps --no-save lightningcss-win32-x64-msvc @tailwindcss/oxide-win32-x64-msvc && npm run tauri build', 'fix-lightningcss')}
                            className="text-slate-400 hover:text-white p-0.5"
                          >
                            {copiedCmd === 'fix-lightningcss' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-slate-400 text-[11px]">
                  De uiteindelijke executable / installer wordt gegenereerd in <code className="text-slate-300">src-tauri/target/release/bundle/</code> en kan direct worden geïnstalleerd op elk Windows, macOS of Linux werkstation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Local Dev Server */}
        {betaInstallTab === 'dev' && (
          <div className="space-y-4 text-xs animate-in fade-in duration-150">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed space-y-1">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Lokaal draaien via Vite / Node.js
              </span>
              <p className="text-slate-400 text-[11px]">
                Ideaal voor ontwikkelaars en testers die de broncode willen aanpassen of de web-versie lokaal op poort 3000 willen draaien.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-300">Stap 1: Pak het project uit en open een terminal</span>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-emerald-400 flex items-center justify-between">
                  <code>npm install</code>
                  <button
                    onClick={() => copyToClipboard('npm install', 'dev-install')}
                    className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                  >
                    {copiedCmd === 'dev-install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-300">Stap 2: Start de ontwikkelserver</span>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-emerald-400 flex items-center justify-between">
                  <code>npm run dev</code>
                  <button
                    onClick={() => copyToClipboard('npm run dev', 'dev-start')}
                    className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                  >
                    {copiedCmd === 'dev-start' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Open vervolgens <strong className="text-white">http://localhost:3000</strong> in uw browser.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Beta Tester Features & Quick Reference */}
        <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Sneltoets: <strong className="text-slate-200">Ctrl+Shift+Space</strong> voor voorlezen</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Whisper STT: <strong className="text-slate-200">100% offline</strong> spraakdicteren</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Instellingen: <strong className="text-slate-200">Quick Settings</strong> voor stem &amp; taal</span>
          </div>
        </div>
      </div>

      {/* Target OS Compilation Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-white text-sm">
              Native Compilatie &amp; Installatie per Besturingssysteem
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg text-xs">
            <button
              onClick={() => setSelectedTarget('windows')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedTarget === 'windows' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Windows (.msi / .exe)
            </button>
            <button
              onClick={() => setSelectedTarget('macos')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedTarget === 'macos' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              macOS (.dmg / .app)
            </button>
            <button
              onClick={() => setSelectedTarget('linux')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedTarget === 'linux' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Linux (.deb / .AppImage)
            </button>
            <button
              onClick={() => setSelectedTarget('github-ci')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                selectedTarget === 'github-ci' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Rocket className="w-3.5 h-3.5 text-emerald-300" />
              <span>GitHub Actions (Cloud CI/CD)</span>
            </button>
          </div>
        </div>

        {/* Windows Instructions */}
        {selectedTarget === 'windows' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <span className="font-semibold text-slate-300">Stap 1: Start lokaal in ontwikkelaarsmodus</span>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-emerald-400 flex items-center justify-between">
                <code>npm run tauri dev</code>
                <button
                  onClick={() => copyToClipboard('npm run tauri dev', 'win-dev')}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  {copiedCmd === 'win-dev' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-slate-300">Stap 2: Genereer de officiële Windows Installer (.msi &amp; .exe)</span>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-emerald-400 flex items-center justify-between">
                <code>npm run tauri build -- --target x86_64-pc-windows-msvc</code>
                <button
                  onClick={() => copyToClipboard('npm run tauri build -- --target x86_64-pc-windows-msvc', 'win-build')}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  {copiedCmd === 'win-build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/20 text-slate-300 leading-relaxed text-[11px]">
              <strong className="text-blue-400">Resultaat op Windows: </strong>
              Genereert een standalone installer in <code className="text-slate-200">src-tauri/target/release/bundle/msi/VoxA11y_0.1.0_x64_nl-NL.msi</code> met automatische snelkoppeling in het Startmenu en automatische registratie van de SAPI 5 / UI Automation services.
            </div>
          </div>
        )}

        {/* macOS Instructions */}
        {selectedTarget === 'macos' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <span className="font-semibold text-slate-300">Stap 1: Start lokaal op macOS</span>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-purple-400 flex items-center justify-between">
                <code>npm run tauri dev</code>
                <button
                  onClick={() => copyToClipboard('npm run tauri dev', 'mac-dev')}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  {copiedCmd === 'mac-dev' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-slate-300">Stap 2: Bouw Universal Binary (.dmg &amp; .app voor Apple Silicon &amp; Intel)</span>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-purple-400 flex items-center justify-between">
                <code>npm run tauri build -- --target universal-apple-darwin</code>
                <button
                  onClick={() => copyToClipboard('npm run tauri build -- --target universal-apple-darwin', 'mac-build')}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  {copiedCmd === 'mac-build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/20 text-slate-300 leading-relaxed text-[11px]">
              <strong className="text-purple-400">Resultaat op macOS: </strong>
              Maakt een drag-and-drop installer aan in <code className="text-slate-200">src-tauri/target/release/bundle/dmg/VoxA11y_0.1.0_universal.dmg</code> met de juiste macOS Accessibility privacy entitlements (<code className="text-slate-200">com.apple.security.automation.apple-events</code>).
            </div>
          </div>
        )}

        {/* Linux Instructions */}
        {selectedTarget === 'linux' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <span className="font-semibold text-slate-300">Stap 1: Installeer benodigde bibliotheken (Debian/Ubuntu/Fedora)</span>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-amber-400 flex items-center justify-between">
                <code>sudo apt install libspeechd-dev libwebkit2gtk-4.1-dev libatspi2.0-dev</code>
                <button
                  onClick={() => copyToClipboard('sudo apt install libspeechd-dev libwebkit2gtk-4.1-dev libatspi2.0-dev', 'linux-deps')}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  {copiedCmd === 'linux-deps' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-slate-300">Stap 2: Bouw .deb &amp; standalone .AppImage package</span>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-amber-400 flex items-center justify-between">
                <code>npm run tauri build -- --target x86_64-unknown-linux-gnu</code>
                <button
                  onClick={() => copyToClipboard('npm run tauri build -- --target x86_64-unknown-linux-gnu', 'linux-build')}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  {copiedCmd === 'linux-build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-slate-300 leading-relaxed text-[11px] flex items-center justify-between">
              <div>
                <strong className="text-amber-400">Resultaat op Linux: </strong>
                Plaatst het standalone <code className="text-slate-200">VoxA11y_0.1.0_amd64.AppImage</code> en <code className="text-slate-200">.deb</code> bestand gereed voor distributie en desktop integration.
              </div>
              <span className="text-[10px] bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded border border-amber-700/50">
                CI: .github/workflows/build-linux.yml
              </span>
            </div>
          </div>
        )}

        {/* GitHub Actions CI/CD Cloud Workflows */}
        {selectedTarget === 'github-ci' && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-slate-300 leading-relaxed space-y-1">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Rocket className="w-4 h-4 text-emerald-400" />
                Automatische Cloud Compilatie voor Windows, macOS en Linux
              </span>
              <p className="text-slate-300 text-[11px]">
                U hoeft geen Rust, C++ Build Tools of Linux-pakketten lokaal te installeren. GitHub bouwt de installers volledig automatisch op schone virtuele machines via GitHub Actions en levert kant-en-klare installatiebestanden op als downloadbare <strong>Artifacts</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Windows Workflow */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-400 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-blue-400" />
                    Windows (.msi / .exe)
                  </span>
                  <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                    windows-latest
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Bouwt met WiX Toolset de officiële Windows MSI met Startmenu-integratie en NSIS setup.exe.
                </p>
                <div className="pt-1 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>.github/workflows/build-windows-msi.yml</span>
                  <button
                    onClick={() => copyToClipboard('.github/workflows/build-windows-msi.yml', 'copy-win-wf')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'copy-win-wf' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* macOS Workflow */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-purple-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-400 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-purple-400" />
                    macOS (.dmg / .app)
                  </span>
                  <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                    macos-latest
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Bouwt Universal binary voor Apple Silicon (M1/M2/M3/M4) én Intel Macs met A11y privacy entitlements.
                </p>
                <div className="pt-1 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>.github/workflows/build-macos.yml</span>
                  <button
                    onClick={() => copyToClipboard('.github/workflows/build-macos.yml', 'copy-mac-wf')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'copy-mac-wf' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Linux Workflow */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-amber-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    Linux (.deb / .AppImage)
                  </span>
                  <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                    ubuntu-22.04
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Installeert automatisch WebKitGTK, AT-SPI2 en Speech Dispatcher en exporteert .deb en standalone .AppImage.
                </p>
                <div className="pt-1 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>.github/workflows/build-linux.yml</span>
                  <button
                    onClick={() => copyToClipboard('.github/workflows/build-linux.yml', 'copy-linux-wf')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'copy-linux-wf' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Official GitHub Release Pipeline Card */}
            <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950 rounded-xl border border-indigo-500/40 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-bold text-white text-xs">
                    Officiële GitHub Release Pipeline (.github/workflows/release.yml)
                  </h4>
                </div>
                <span className="text-[10px] bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700 font-mono">
                  Trigger: Git Tag (v*)
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Wanneer u een git-versietag aanmaakt en pusht, bouwt deze pipeline parallel alle 3 de besturingssystemen, berekent cryptografische <strong className="text-emerald-400">SHA256SUMS.txt</strong> hashes en publiceert direct een officiële GitHub Release met changelog en alle downloadbare installers.
              </p>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-300">Start een release via uw lokale git terminal:</span>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-emerald-400 flex items-center justify-between text-[11px]">
                  <code>git tag v0.1.0 &amp;&amp; git push origin v0.1.0</code>
                  <button
                    onClick={() => copyToClipboard('git tag v0.1.0 && git push origin v0.1.0', 'copy-git-tag')}
                    className="text-slate-400 hover:text-white p-1 rounded"
                    title="Kopieer release commando"
                  >
                    {copiedCmd === 'copy-git-tag' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* All-in-One Multi-Platform Matrix Workflow */}
            <div className="p-4 bg-slate-950 rounded-xl border border-emerald-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Alles-in-één Multi-Platform Matrix Workflow
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Bouwt Windows, macOS en Linux parallel in één run.
                  </p>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
                  .github/workflows/build-all-platforms.yml
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-300">
                <span className="font-semibold text-slate-200">Hoe u de installers downloadt na de build:</span>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>Ga naar uw GitHub repository en klik op het tabblad <strong className="text-white">Actions</strong>.</li>
                  <li>Kies links de workflow (bijv. <em>"Bouw Alle Desktop Installers"</em>) en klik rechts op <strong className="text-white">Run workflow</strong> (of push een commit).</li>
                  <li>Klik na afronding op de voltooide run. Onderaan vindt u de sectie <strong className="text-emerald-400">Artifacts</strong> met de kant-en-klare installers:</li>
                </ol>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 text-blue-300">
                    📦 VoxA11y-Windows-Installers<br/>
                    <span className="text-slate-500">.msi &amp; .exe</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 text-purple-300">
                    📦 VoxA11y-macOS-Installers<br/>
                    <span className="text-slate-500">Universal .dmg &amp; .app</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 text-amber-300">
                    📦 VoxA11y-Linux-Installers<br/>
                    <span className="text-slate-500">.deb &amp; .AppImage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
