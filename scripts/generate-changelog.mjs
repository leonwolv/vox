#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Parse command line arguments
const targetTag = process.argv[2] || process.env.GITHUB_REF_NAME || 'v0.1.0';
const releaseDate = new Date().toISOString().split('T')[0];

console.log(`[Changelog Generator] Generating changelog for tag: ${targetTag} (${releaseDate})`);

// Categories for Conventional Commits
const CATEGORIES = {
  feat: { title: '✨ Features', items: [] },
  fix: { title: '🐛 Bug Fixes', items: [] },
  perf: { title: '⚡ Performance & Improvements', items: [] },
  refactor: { title: '♻️ Code Refactoring', items: [] },
  docs: { title: '📝 Documentation', items: [] },
  ci: { title: '🔧 Build & CI/CD', items: [] },
  chore: { title: '🔧 Build & CI/CD', items: [] },
  other: { title: '📌 Other Changes', items: [] },
};

/**
 * Safely execute git commands with fallback
 */
function getGitCommits() {
  try {
    // Try to find the previous tag
    let range = '';
    try {
      const prevTag = execSync('git describe --tags --abbrev=0 HEAD^ 2>/dev/null', { encoding: 'utf8' }).trim();
      if (prevTag && prevTag !== targetTag) {
        range = `${prevTag}..HEAD`;
        console.log(`[Changelog Generator] Parsing commit range: ${range}`);
      }
    } catch {
      console.log('[Changelog Generator] No previous tag detected. Parsing all repository commits.');
    }

    const gitCmd = range 
      ? `git log ${range} --pretty=format:"%H|%s|%an|%ad" --date=short`
      : `git log -n 50 --pretty=format:"%H|%s|%an|%ad" --date=short`;

    const output = execSync(gitCmd, { encoding: 'utf8' }).trim();
    if (!output) return [];

    return output.split('\n').map(line => {
      const [hash, subject, author, date] = line.split('|');
      return { hash: hash?.trim(), subject: subject?.trim(), author: author?.trim(), date: date?.trim() };
    });
  } catch (err) {
    console.warn('[Changelog Generator] Git log execution warning (shallow clone or git unavailable):', err.message);
    return [];
  }
}

// Default curated highlights for initial v0.1.0 release if git log is sparse/empty
const DEFAULT_V010_HIGHLIGHTS = [
  { type: 'feat', scope: 'a11y', msg: 'integrate native Microsoft UI Automation for Windows 10/11' },
  { type: 'feat', scope: 'tts', msg: 'add AVFoundation speech synthesizer binding for macOS Sonoma/Sequoia' },
  { type: 'feat', scope: 'linux', msg: 'implement AT-SPI2 D-Bus accessibility and Speech Dispatcher integration' },
  { type: 'feat', scope: 'stt', msg: 'built-in Whisper speech-to-text offline voice dictation' },
  { type: 'feat', scope: 'ui', msg: 'always-on-top transparent floating control widget with global hotkeys' },
  { type: 'feat', scope: 'tray', msg: 'native cross-platform system tray icon and background resident daemon' },
  { type: 'fix', scope: 'windows', msg: 'install missing @tauri-apps/cli-win32-x64-msvc native binary wrapper' },
  { type: 'fix', scope: 'build', msg: 'add src-tauri/build.rs to resolve Cargo OUT_DIR environment variable' },
  { type: 'fix', scope: 'macos', msg: 'dynamically link ApplicationServices.framework instead of embedding bundle file' },
  { type: 'fix', scope: 'ci', msg: 'remove unquoted square brackets in GitHub Actions workflow step names' },
  { type: 'ci', scope: 'pipeline', msg: 'automated multi-platform GitHub Release workflow with SHA256 checksums' },
  { type: 'docs', scope: 'readme', msg: 'comprehensive English open-source documentation with WCAG 2.2 AAA guidelines' },
];

const commits = getGitCommits();

if (commits.length > 0) {
  for (const commit of commits) {
    const { hash, subject, author } = commit;
    if (!subject) continue;

    // Conventional commit regex: type(scope)?: message
    const match = subject.match(/^([a-zA-Z]+)(?:\(([^)]+)\))?!?: (.+)$/);
    const shortHash = hash ? hash.slice(0, 7) : '';

    if (match) {
      const [, rawType, scope, message] = match;
      const type = rawType.toLowerCase();
      const category = CATEGORIES[type] || CATEGORIES.other;
      const formattedScope = scope ? `**${scope}**: ` : '';
      const commitSuffix = shortHash ? ` (\`${shortHash}\`)` : '';
      const authorSuffix = author ? ` - @${author}` : '';

      category.items.push(`- ${formattedScope}${message}${commitSuffix}${authorSuffix}`);
    } else {
      const commitSuffix = shortHash ? ` (\`${shortHash}\`)` : '';
      CATEGORIES.other.items.push(`- ${subject}${commitSuffix}`);
    }
  }
} else {
  console.log('[Changelog Generator] Using curated initial feature highlights for v0.1.0 release.');
  for (const item of DEFAULT_V010_HIGHLIGHTS) {
    const category = CATEGORIES[item.type] || CATEGORIES.other;
    const formattedScope = item.scope ? `**${item.scope}**: ` : '';
    category.items.push(`- ${formattedScope}${item.msg}`);
  }
}

// Build Markdown for the current release
let releaseNotes = `## [${targetTag}] - ${releaseDate}\n\n`;

for (const [, cat] of Object.entries(CATEGORIES)) {
  if (cat.items.length > 0) {
    releaseNotes += `### ${cat.title}\n`;
    for (const item of cat.items) {
      releaseNotes += `${item}\n`;
    }
    releaseNotes += '\n';
  }
}

// Write standalone RELEASE_NOTES.md for GitHub Releases action
const releaseNotesPath = path.resolve(process.cwd(), 'RELEASE_NOTES.md');
fs.writeFileSync(releaseNotesPath, releaseNotes.trim() + '\n', 'utf8');
console.log(`[Changelog Generator] Written standalone release notes to: ${releaseNotesPath}`);

// Update root CHANGELOG.md non-destructively (prepend under header)
const changelogPath = path.resolve(process.cwd(), 'CHANGELOG.md');
const CHANGELOG_HEADER = `# Changelog

All notable changes to the **VoxA11y Desktop** project are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

`;

let existingChangelog = '';
if (fs.existsSync(changelogPath)) {
  existingChangelog = fs.readFileSync(changelogPath, 'utf8');
}

let updatedChangelog = '';
if (!existingChangelog.trim()) {
  updatedChangelog = CHANGELOG_HEADER + releaseNotes;
} else if (existingChangelog.includes(`## [${targetTag}]`)) {
  console.log(`[Changelog Generator] Tag ${targetTag} already exists in CHANGELOG.md. Updating section in place.`);
  const regex = new RegExp(`## \\[${targetTag.replace('.', '\\.')}\\][\\s\\S]*?(?=\\n## \\[|$)`);
  updatedChangelog = existingChangelog.replace(regex, releaseNotes.trim() + '\n\n');
} else {
  // Prepend under header
  if (existingChangelog.startsWith('# Changelog')) {
    const headerEndIndex = existingChangelog.indexOf('\n## ');
    if (headerEndIndex !== -1) {
      const topPart = existingChangelog.slice(0, headerEndIndex);
      const bottomPart = existingChangelog.slice(headerEndIndex);
      updatedChangelog = topPart + '\n\n' + releaseNotes + bottomPart.trimStart();
    } else {
      updatedChangelog = existingChangelog.trim() + '\n\n' + releaseNotes;
    }
  } else {
    updatedChangelog = CHANGELOG_HEADER + releaseNotes + '\n' + existingChangelog;
  }
}

fs.writeFileSync(changelogPath, updatedChangelog.trim() + '\n', 'utf8');
console.log(`[Changelog Generator] Successfully updated ${changelogPath}`);
