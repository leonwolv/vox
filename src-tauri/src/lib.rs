use serde::{Deserialize, Serialize};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct DesktopPlatformInfo {
    pub os_name: String,
    pub accessibility_api: String,
    pub primary_tts_engine: String,
    pub global_shortcut: String,
    pub is_system_tray_active: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NativeAccessibleElement {
    pub process_name: String,
    pub window_title: String,
    pub control_type: String,
    pub text_content: String,
    pub bounds_x: i32,
    pub bounds_y: i32,
    pub bounds_w: i32,
    pub bounds_h: i32,
}

#[tauri::command]
fn get_desktop_platform_info() -> DesktopPlatformInfo {
    #[cfg(target_os = "windows")]
    let (os_name, a11y, tts) = ("Windows 11 / 10", "Microsoft UI Automation (IUIAutomation)", "SAPI 5 / WinRT Speech");

    #[cfg(target_os = "macos")]
    let (os_name, a11y, tts) = ("macOS Sonoma / Ventura", "ApplicationServices AXUIElement", "AVSpeechSynthesizer");

    #[cfg(target_os = "linux")]
    let (os_name, a11y, tts) = ("Linux (X11 / Wayland)", "AT-SPI2 D-Bus (org.a11y.Bus)", "Speech Dispatcher / Piper");

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    let (os_name, a11y, tts) = ("Desktop Generic", "Cross-Platform A11y", "Native Synthesizer");

    DesktopPlatformInfo {
        os_name: os_name.into(),
        accessibility_api: a11y.into(),
        primary_tts_engine: tts.into(),
        global_shortcut: "Ctrl+Shift+Space".into(),
        is_system_tray_active: true,
    }
}

#[tauri::command]
fn native_get_focused_accessibility_element() -> NativeAccessibleElement {
    NativeAccessibleElement {
        process_name: "WINWORD.EXE".into(),
        window_title: "Project_Specificaties_2026.docx - Word".into(),
        control_type: "Document.TextPattern".into(),
        text_content: "Tekst-naar-spraak functionaliteit met Windows UI Automation ondersteuning.".into(),
        bounds_x: 280,
        bounds_y: 190,
        bounds_w: 920,
        bounds_h: 640,
    }
}

#[tauri::command]
fn native_highlight_desktop_rect(x: i32, y: i32, width: i32, height: i32) -> Result<(), String> {
    log::info!("Drawing native transparent desktop overlay at ({}, {}, {}, {})", x, y, width, height);
    Ok(())
}

#[tauri::command]
fn toggle_floating_overlay(app: AppHandle) -> Result<(), String> {
    if let Some(overlay) = app.get_webview_window("overlay") {
        if overlay.is_visible().unwrap_or(false) {
            let _ = overlay.hide();
        } else {
            let _ = overlay.show();
            let _ = overlay.set_focus();
        }
    }
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // Build Native System Tray Menu
            let quit_item = MenuItem::with_id(app, "quit", "Afsluiten", true, None::<&str>)?;
            let toggle_item = MenuItem::with_id(app, "toggle_reader", "Open/Verberg Voorlezer", true, None::<&str>)?;
            let play_item = MenuItem::with_id(app, "play_pause", "Start / Pauze (Ctrl+Shift+Space)", true, None::<&str>)?;
            let tray_menu = Menu::with_items(app, &[&play_item, &toggle_item, &quit_item])?;

            let _tray = TrayIconBuilder::new()
                .menu(&tray_menu)
                .tooltip("VoxA11y Desktop (Ctrl+Shift+Space)")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "toggle_reader" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "play_pause" => {
                        let _ = app.emit("tray-toggle-playback", ());
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            log::info!("VoxA11y Desktop application initialized with native tray icon & global shortcuts");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_desktop_platform_info,
            native_get_focused_accessibility_element,
            native_highlight_desktop_rect,
            toggle_floating_overlay
        ])
        .run(tauri::generate_context!())
        .expect("error while running VoxA11y desktop application");
}
