# Automated CHANGELOG.md Generator & Release Workflow Integration Plan

This plan establishes an automated changelog generation system integrated directly into `.github/workflows/release.yml`. When a release tag (such as `v0.1.0`) is pushed, the workflow parses the git commit history since the previous tag (or the repository inception if it is the first release), categorizes commits according to the Conventional Commits specification (Features, Bug Fixes, Performance & Improvements, Maintenance), prepends the new formatted section to `CHANGELOG.md` while preserving previous release history, and publishes the notes to the GitHub Release.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed through interactive clarification and are locked into the technical design:

- **Confirmed: Categorization Format**: Conventional Commits specification. Commits prefixed with `feat:` or `feat(...)` map to **✨ Features**, `fix:` or `fix(...)` map to **🐛 Bug Fixes**, `perf:` or `improve:` map to **⚡ Performance & Improvements**, and `refactor:`, `chore:`, or `docs:` map to **🛠️ Maintenance & Documentation**. Commits without conventional prefixes fall into an **Other Changes** section with commit hashes and author attribution.
- **Confirmed: Execution Environment**: Integrated directly into the GitHub Actions release workflow (`.github/workflows/release.yml`), ensuring zero local tool dependencies and automatic execution whenever a release tag is pushed.
- **Confirmed: Changelog Preservation**: The workflow prepends the newly generated release block at the top of `CHANGELOG.md` directly beneath the header title, preserving all historical releases beneath it. The release section is also saved to `RELEASE_NOTES.md` and fed into `softprops/action-gh-release` as the official release description.

---

### 1. Overview & Core Concept

- **What It Delivers**:
  1. `scripts/generate-changelog.mjs`: A self-contained, dependency-free Node.js ES-module script that inspects `git log`, groups commits by Conventional Commits types, generates markdown formatted with commit links and author tags, and prepends the new section to `CHANGELOG.md`.
  2. `.github/workflows/release.yml` Enhancement: A dedicated workflow step in the `publish-release` job that checks out full git history (`fetch-depth: 0`), runs the changelog generator for the current tag, commits the updated `CHANGELOG.md` back to the repository, and attaches the notes to the GitHub Release.
  3. Base `CHANGELOG.md`: An initial, pristine `CHANGELOG.md` file pre-seeded for the upcoming `v0.1.0` release showcasing the native accessibility engine, SAPI 5 / AVFoundation / AT-SPI2 integrations, and offline Whisper STT.
  4. In-App Synchronization: Adding `scripts/generate-changelog.mjs` and `CHANGELOG.md` to `fullDesktopFiles` in `src/components/DesktopBuildGuide.tsx` so users downloading the ZIP receive the exact tooling.
- **Target Audience**: Users, developers, and packagers who need a clear, structured summary of what changed between releases.
- **Key Value**: 100% automated release documentation with zero manual copy-pasting or missed commit entries.

---

### 2. User Experience & Changelog Architecture

#### Commit Parsing & Changelog Pipeline Flow
```
Git Release Tag Pushed (e.g. v0.1.0)
                 │
                 ▼
GitHub Actions: Checkout with fetch-depth: 0
                 │
                 ▼
Identify Previous Git Tag (or root commit for initial v0.1.0)
                 │
                 ▼
Execute: node scripts/generate-changelog.mjs [tag]
┌────────────────────────────────────────────────────────┐
│ Parse `git log --pretty=format:"%H|%s|%an|%ae|%ad"`    │
│ Categorize by Conventional Commits prefix:             │
│   • feat:     -> ✨ Features                           │
│   • fix:      -> 🐛 Bug Fixes                          │
│   • perf:     -> ⚡ Performance & Improvements          │
│   • refactor: -> ♻️ Code Refactoring                  │
│   • docs:     -> 📝 Documentation                      │
│   • chore/ci: -> 🔧 Build & CI/CD                      │
└────────────────────────┬───────────────────────────────┘
                         │
     ┌───────────────────┴───────────────────┐
     ▼                                       ▼
Update CHANGELOG.md                     Create RELEASE_NOTES.md
(Prepend v0.1.0 block,                  (Contains current tag notes,
preserve existing history)              passed to GitHub Release body)
     │                                       │
     ▼                                       ▼
Commit & Push updated CHANGELOG.md      Publish GitHub Release with
back to repository main branch          installers & checksums
```

#### Formatted Output Example for `CHANGELOG.md`
```markdown
# Changelog

All notable changes to the **VoxA11y Desktop** project are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

## [v0.1.0] - 2026-11-05

### ✨ Features
- **a11y**: integrate native Microsoft UI Automation for Windows 10/11 ([`3a8f1b2`](https://github.com/vox/vox/commit/3a8f1b2)) - @LeonWolvekamp
- **tts**: add AVFoundation speech synthesizer binding for macOS Sonoma/Sequoia ([`7c4e901`](https://github.com/vox/vox/commit/7c4e901))
- **ui**: implement always-on-top transparent floating control widget ([`d812a4b`](https://github.com/vox/vox/commit/d812a4b))

### 🐛 Bug Fixes
- **macos**: resolve ApplicationServices.framework bundle copy failure ([`5ec6afd`](https://github.com/vox/vox/commit/5ec6afd))
- **windows**: install missing `@tauri-apps/cli-win32-x64-msvc` native bindings ([`12b84cf`](https://github.com/vox/vox/commit/12b84cf))
- **ci**: quote square bracket step names in GitHub Actions YAML ([`9d4821a`](https://github.com/vox/vox/commit/9d4821a))

### ⚡ Performance & Improvements
- **build**: enable Rolldown multi-threaded bundling for Vite client environment ([`4b81c2d`](https://github.com/vox/vox/commit/4b81c2d))
```

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Zero-Dependency Node.js Script (`scripts/generate-changelog.mjs`)**
  - *Chosen Approach*: Write the parser in native Node.js (available on every GitHub Actions runner and development machine) using child process calls to `git log`.
  - *Why*: Eliminates brittle third-party CLI dependencies (like `standard-version` or heavy Ruby gems) that can fail or suffer from npm peer dependency conflicts.
  - *Alternative Considered*: External GitHub Action (e.g., `conventional-changelog-action`). Rejected because third-party actions frequently break due to runner Node version migrations and lack customized multi-platform grouping.

- **Decision 2: Intelligent Range Fallback (Initial vs. Incremental Releases)**
  - *Chosen Approach*: If a previous tag exists (e.g. `v0.0.9`), parse `v0.0.9..v0.1.0`. If no previous tag exists (as with the upcoming first release `v0.1.0`), parse all commits up to `HEAD`.
  - *Why*: First releases in new repositories fail on `git describe --tags --abbrev=0` if no prior tag exists. This graceful fallback ensures the first release generates a complete changelog.

- **Decision 3: Non-Destructive In-Place Prepending**
  - *Chosen Approach*: Read the existing `CHANGELOG.md`, find the top-level title header, and insert the new `## [vX.Y.Z]` section directly beneath the header, preserving all earlier release history. If `CHANGELOG.md` does not exist, initialize it with standard header metadata.

---

### 4. Technical Architecture & File Plan

1. **`scripts/generate-changelog.mjs`**:
   - Parses CLI arguments (`process.argv[2]` for tag name, defaults to `v0.1.0`).
   - Retrieves repository commit history via `git log`.
   - Groups commits into Conventional Commits categories: Features, Bug Fixes, Improvements, Maintenance, Other.
   - Generates markdown and prepends it to `CHANGELOG.md`.
   - Also writes `RELEASE_NOTES.md` for GitHub Release consumption.

2. **`.github/workflows/release.yml`**:
   - In `publish-release` job:
     - Check out with `fetch-depth: 0` so git history and tags are present.
     - Run `node scripts/generate-changelog.mjs ${{ github.ref_name }}`.
     - Pass `body_path: RELEASE_NOTES.md` to `softprops/action-gh-release@v2`.
     - Commit and push the updated `CHANGELOG.md` back to the default branch using `stefanzweifel/git-auto-commit-action@v5` (or native git config).

3. **`CHANGELOG.md`**:
   - Seeded in the project root with the comprehensive `v0.1.0` release notes.

4. **`src/components/DesktopBuildGuide.tsx`**:
   - Add `scripts/generate-changelog.mjs` and `CHANGELOG.md` to the exported ZIP.
