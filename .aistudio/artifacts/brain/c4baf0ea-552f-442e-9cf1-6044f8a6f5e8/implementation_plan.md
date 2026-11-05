# VoxA11y Desktop - Automated Release Pipeline & Documentation Plan

This plan establishes an automated multi-platform release pipeline via GitHub Actions (`.github/workflows/release.yml`) that builds native installers for Windows, macOS, and Linux upon publishing a git tag (`v*`), generates cryptographic SHA256 checksums, and attaches all assets to an official GitHub Release. It also introduces a comprehensive, professional English `README.md` following open-source industry standards.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed through interactive clarification and are locked into the release architecture:

- **Confirmed: Release Trigger**: Automated execution upon git version tags (e.g. `git tag v0.1.0 && git push origin v0.1.0`), plus manual `workflow_dispatch` support with a customizable version input for testing.
- **Confirmed: Publication Strategy**: Direct release publication with attached installer binaries (Windows `.msi` and `.exe`, macOS Universal `.dmg` and `.app`, Linux `.deb` and `.AppImage`), auto-generated changelog notes, and a cryptographic `SHA256SUMS.txt` checksum file for integrity verification.
- **Confirmed: Documentation Language & Standard**: Primary English in modern open-source repository standard (shields.io badges, architecture overview, cross-platform download matrix, global hotkey guide, local development steps, and CI/CD instructions).

---

### 1. Overview & Core Concept

- **What It Delivers**:
  1. `.github/workflows/release.yml`: A parallel 3-OS matrix job (Windows, macOS, Linux) that triggers on tags matching `v*`, builds optimized release binaries using Tauri 2.0, calculates SHA256 hashes, and uploads all deliverables directly to GitHub Releases.
  2. `README.md`: An English README including project identity, key accessibility features (TTS, Whisper offline STT, floating widget), system requirements, quick installation guide, global shortcuts, architecture diagram, local compilation guide, and troubleshooting references.
  3. `src/components/DesktopBuildGuide.tsx`: Synchronization of the downloadable desktop `.ZIP` and in-app documentation to include the new release workflow and updated documentation.
- **Target Audience**: End users, accessibility advocates, open-source contributors, and software distributors who need pre-built, verified installers and clear technical documentation.
- **Key Value**: Eliminates manual building across different operating systems and delivers verified binaries directly to end users on GitHub.

---

### 2. User Experience & Release Pipeline Architecture

#### Workflow Trigger & Execution Flow
```
Developer creates Git tag (e.g. v0.1.0)
                   │
                   ▼
       Push tag to GitHub: git push origin v0.1.0
                   │
   ┌───────────────┴───────────────┐
   │ GitHub Actions: release.yml   │
   └───────────────┬───────────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
[Windows Matrix] [macOS Matrix]  [Linux Matrix]
• Node 22 + Rust • Node 22 + Rust • Node 22 + Rust
• Native bindings• Universal SDK  • GTK/A11y deps
• Tauri CLI      • Tauri CLI      • Tauri CLI
• Build MSI+EXE  • Build DMG+APP  • Build DEB+AppImage
    │              │              │
    └──────────────┼──────────────┘
                   ▼
        Upload Build Artifacts
                   │
                   ▼
     Job 2: Publish GitHub Release (ubuntu-latest)
     • Download all platform artifacts
     • Compute SHA256 checksums -> SHA256SUMS.txt
     • Create GitHub Release with auto-changelog
     • Attach all 6 installer binaries + SHA256SUMS.txt
```

#### Published Release Deliverables
| Platform | Target Architecture | Generated Installers | Attached Files |
| :--- | :--- | :--- | :--- |
| **Windows** | `x86_64-pc-windows-msvc` | WiX MSI & NSIS Setup | `VoxA11y_0.1.0_x64_nl-NL.msi`, `VoxA11y_0.1.0_x64-setup.exe` |
| **macOS** | Universal (`arm64` + `x86_64`) | Drag-and-Drop Disk Image | `VoxA11y_0.1.0_universal.dmg`, `VoxA11y_0.1.0.app.tar.gz` |
| **Linux** | `x86_64-unknown-linux-gnu` | Debian Package & AppImage | `VoxA11y_0.1.0_amd64.deb`, `VoxA11y_0.1.0_amd64.AppImage` |
| **Integrity** | All Platforms | Cryptographic Signatures | `SHA256SUMS.txt` |

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Matrix Build with Consolidated Release Job**
  - *Chosen Approach*: Run compilation across `windows-latest`, `macos-latest`, and `ubuntu-22.04` in parallel, then feed all artifacts into a single final release job that computes checksums and publishes the GitHub Release.
  - *Why*: Prevents partial or race-condition releases where one platform updates the release before others finish. The consolidated release job ensures that either all binaries are attached together or the release remains uncorrupted.
  - *Alternative Considered*: Publishing directly from each matrix runner. Rejected because it can cause token conflicts and fragmented releases.

- **Decision 2: Comprehensive English README with Dutch A11y Callout**
  - *Chosen Approach*: Structure the main documentation in English for international open-source visibility, with prominent badges, visual architecture diagrams, and a dedicated localized section/badge acknowledging Dutch accessibility guidelines (DigiToegankelijk / WCAG 2.2).
  - *Why*: Balances international developer contributions with the project's roots and primary user base in Dutch accessibility.

- **Decision 3: SHA256 Checksum Generation**
  - *Chosen Approach*: Generate a standard `SHA256SUMS.txt` file using `sha256sum` in the release job.
  - *Why*: Allows users and system administrators in healthcare, government, and education environments to verify package integrity before deployment.

---

### 4. Technical Architecture & File Plan

#### Pipeline Specification (`.github/workflows/release.yml`)
- **Triggers**:
  - `push: tags: ['v*']`
  - `workflow_dispatch: inputs: version_name`
- **Runner Configuration**:
  - `build-assets`: Matrix with `windows-latest`, `macos-latest`, `ubuntu-22.04`.
  - `publish-release`: Runs on `ubuntu-latest`, depends on `needs: [build-assets]`.
  - Uses `softprops/action-gh-release@v2` with `generate_release_notes: true`.

#### Documentation Specification (`README.md`)
- **Sections**:
  1. Header with Title, Tagline, and Status Badges (CI status, License, Tauri 2.0, Rust 2021, WCAG 2.2 AAA).
  2. Core Highlights (High-speed local TTS, Whisper offline STT, floating overlay widget, zero cloud latency).
  3. Pre-built Downloads Matrix (direct links to GitHub Releases).
  4. Global Keyboard Shortcuts table (`Ctrl+Shift+Space`, etc.).
  5. System Requirements (Windows 10/11, macOS 11+, Linux Ubuntu 20.04+).
  6. Development & Building from Source (Prerequisites, Node.js, Rust toolchain, build scripts).
  7. GitHub Actions CI/CD overview (explanation of the automated release pipeline).
  8. Troubleshooting FAQ (quick solutions for native bindings, build.rs, and macOS frameworks).
  9. License & Accessibility Compliance.

#### In-App Guide Synchronization (`src/components/DesktopBuildGuide.tsx`)
- Include `.github/workflows/release.yml` in `fullDesktopFiles` so users downloading the ZIP receive the exact release pipeline.
- Include the new `README.md` in `fullDesktopFiles`.
- Add a release pipeline card in the in-app "GitHub Actions (Cloud CI/CD)" tab.
