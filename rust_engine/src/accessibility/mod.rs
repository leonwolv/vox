use serde::{Deserialize, Serialize};
use crate::Result;

pub mod windows;
pub mod macos;
pub mod linux;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessibleElement {
    pub id: String,
    pub name: String,
    pub role: String, // e.g. "document", "paragraph", "heading", "edit", "window"
    pub value: Option<String>,
    pub focused: bool,
    pub bounds: ElementBounds,
    pub children_count: usize,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct ElementBounds {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextSelection {
    pub full_text: String,
    pub selected_text: Option<String>,
    pub caret_offset: usize,
    pub start_offset: usize,
    pub end_offset: usize,
}

pub trait AccessibilityProvider: Send + Sync {
    /// Name of the OS accessibility backend (Windows UI Automation, macOS AXUIElement, Linux AT-SPI)
    fn backend_name(&self) -> &'static str;

    /// Retrieve currently focused accessible element in the active window
    fn get_focused_element(&self) -> Result<AccessibleElement>;

    /// Extract readable text buffer and active caret/selection from focused control
    fn get_text_selection(&self) -> Result<TextSelection>;

    /// Highlight a specific word/range bounding box on the screen
    fn highlight_rect(&self, bounds: ElementBounds) -> Result<()>;

    /// Watch for focus/caret change events
    fn register_event_listener(&self, callback: Box<dyn Fn(TextSelection) + Send + 'static>) -> Result<()>;
}

/// Factory to instantiate the native accessibility provider for the running operating system
pub fn create_native_accessibility_provider() -> Result<Box<dyn AccessibilityProvider>> {
    #[cfg(target_os = "windows")]
    {
        Ok(Box::new(windows::WindowsUiAutomationProvider::new()?))
    }

    #[cfg(target_os = "macos")]
    {
        Ok(Box::new(macos::MacOsAccessibilityProvider::new()?))
    }

    #[cfg(target_os = "linux")]
    {
        Ok(Box::new(linux::LinuxAtSpiProvider::new()?))
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        Err(crate::VoxError::AccessibilityError(
            "Unsupported platform for native accessibility".into(),
        ))
    }
}
