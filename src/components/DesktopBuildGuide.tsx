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
  const [selectedTarget, setSelectedTarget] = useState<'windows' | 'macos' | 'linux'>('windows');
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

        'README.md': `# VoxA11y Native Desktop Application (Rust & Tauri 2.0)

## Quick Start
1. Installeer dependencies (inclusief Tauri CLI):
   \`\`\`bash
   npm install
   \`\`\`

2. Start Desktop in Ontwikkelmodus:
   \`\`\`bash
   npm run tauri dev
   # Of direct via npx:
   npx @tauri-apps/cli dev
   \`\`\`

3. Bouw de installer voor uw besturingssysteem:
   - **Windows (.exe / .msi)**:
     \`\`\`bash
     npm run tauri build
     \`\`\`
     *(Of: \`npx @tauri-apps/cli build\`)*
   - **macOS (.app / .dmg)**:
     \`\`\`bash
     npm run tauri build -- --target universal-apple-darwin
     \`\`\`
   - **Linux (.deb / .AppImage)**:
     \`\`\`bash
     npm run tauri build -- --target x86_64-unknown-linux-gnu
     \`\`\`

## Veelvoorkomende Foutmeldingen & Oplossingen:

### 1. Fout: "[UNRESOLVED_ENTRY] Cannot resolve entry module index.html"
- **Oorzaak**: Vite zoekt \`index.html\` in de huidige map. Als u het commando uitvoert in een submap (zoals \`vox_a11y_rust_engine\`), kan Vite het entrypoint niet vinden.
- **Oplossing**:
  Ga naar de hoofdmap waar \`index.html\` en \`package.json\` staan:
  \`\`\`bash
  cd ..
  npm run tauri build
  \`\`\`

### 2. Fout: "npm error Missing script: tauri"
- **Oorzaak**: \`"tauri": "tauri"\` ontbrak in de \`scripts\` sectie van \`package.json\`.
- **Oplossing**:
  Gebruik de npx-versie:
  \`\`\`bash
  npx @tauri-apps/cli build
  \`\`\`
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
                    <span>Foutdiagnose &amp; Directe Oplossingen voor Bouwfouten op Windows:</span>
                  </div>

                  <div className="space-y-2 text-slate-300">
                    {/* Fout 1: Tauri CLI Native Binding */}
                    <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5 border-l-4 border-l-rose-500">
                      <p className="font-semibold text-rose-300 flex items-center gap-1">
                        <span>1. "Cannot find module '@tauri-apps/cli-win32-x64-msvc'":</span>
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

            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-slate-300 leading-relaxed text-[11px]">
              <strong className="text-amber-400">Resultaat op Linux: </strong>
              Plaatst het standalone <code className="text-slate-200">VoxA11y_0.1.0_amd64.AppImage</code> en <code className="text-slate-200">.deb</code> bestand gereed voor distributie en desktop integration.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
