@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   VoxA11y Desktop - Automatische Windows MSI/EXE Bouwer
echo ============================================================
echo.

REM 1. Controleer of Node.js aanwezig is
where node >nul 2>nul
if errorlevel 1 (
    echo [FOUT] Node.js is niet gevonden!
    echo Installeer Node.js 18+ via https://nodejs.org en start dit script opnieuw.
    pause
    exit /b 1
)

REM 2. Controleer of Rust compiler aanwezig is
where rustc >nul 2>nul
if errorlevel 1 (
    echo [LET OP] Rust compiler (rustc) is nog niet geinstalleerd.
    echo Rust is vereist om de native desktop engine te compileren.
    echo Download en installeer Rust via https://rustup.rs (kies standaard optie 1).
    echo.
    echo Druk op een toets om https://rustup.rs te openen in uw browser...
    pause
    start https://rustup.rs
    exit /b 1
)

echo [1/3] Dependencies installeren...
call npm install
if errorlevel 1 (
    echo [FOUT] npm install is mislukt!
    pause
    exit /b 1
)

echo.
echo [2/3] Web frontend compileren...
call npm run build
if errorlevel 1 (
    echo [FOUT] Frontend build mislukt!
    pause
    exit /b 1
)

echo.
echo [3/3] Native Windows MSI en EXE bouwen met Tauri 2.0...
call npx @tauri-apps/cli build
if errorlevel 1 (
    echo [FOUT] Tauri build mislukt. Controleer de foutmelding hierboven.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   SUCCES! De Windows MSI installer is succesvol gebouwd!
echo ============================================================
echo Locatie van de installer:
echo src-tauri\target\release\bundle\msi\
echo.
if exist "src-tauri\target\release\bundle\msi" (
    explorer "src-tauri\target\release\bundle\msi"
) else (
    explorer "src-tauri\target\release\bundle"
)
pause
