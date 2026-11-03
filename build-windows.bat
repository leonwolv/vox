@echo off
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
echo - MSI: src-tauri\target\release\bundle\msi\
echo - EXE: src-tauri\target\release\bundle\nsis\
echo.
if exist "src-tauri\target\release\bundle\msi" (
    explorer "src-tauri\target\release\bundle\msi"
) else (
    explorer "src-tauri\target\release\bundle"
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
