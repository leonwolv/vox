Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  VoxA11y Desktop - Automatische Windows MSI/EXE Bouwer     " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Controleer Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[FOUT] Node.js is niet gevonden!" -ForegroundColor Red
    Write-Host "Installeer Node.js 18+ via https://nodejs.org en start dit script opnieuw."
    Read-Host "Druk op Enter om af te sluiten"
    exit 1
}

# 2. Controleer Rust
if (-not (Get-Command rustc -ErrorAction SilentlyContinue)) {
    Write-Host "[LET OP] Rust compiler (rustc) is nog niet geinstalleerd." -ForegroundColor Yellow
    Write-Host "Rust is vereist om de native desktop engine te compileren."
    Write-Host "Download en installeer Rust via https://rustup.rs"
    Start-Process "https://rustup.rs"
    Read-Host "Druk op Enter om af te sluiten"
    exit 1
}

# 3. Dependencies
Write-Host "[1/3] Dependencies installeren..." -ForegroundColor Green
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FOUT] npm install mislukt!" -ForegroundColor Red
    Read-Host "Druk op Enter"
    exit 1
}

# 4. Build frontend
Write-Host "[2/3] Web frontend compileren..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FOUT] npm run build mislukt!" -ForegroundColor Red
    Read-Host "Druk op Enter"
    exit 1
}

# 5. Build Tauri MSI & EXE
Write-Host "[3/3] Native Windows MSI en EXE bouwen met Tauri 2.0..." -ForegroundColor Green
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

if (Test-Path "src-tauri\target\release\bundle\msi") {
    Invoke-Item "src-tauri\target\release\bundle\msi"
} else {
    Invoke-Item "src-tauri\target\release\bundle"
}
