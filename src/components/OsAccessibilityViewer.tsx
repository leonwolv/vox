import React, { useState } from 'react';
import { Monitor, ChevronRight, ChevronDown, CheckCircle, Crosshair, Cpu, Layers } from 'lucide-react';
import { OsAccessibilityNode } from '../types/tts';

export const OsAccessibilityViewer: React.FC = () => {
  const [selectedOs, setSelectedOs] = useState<'windows' | 'macos' | 'linux'>('windows');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('elem-doc-view');

  const windowsTree: OsAccessibilityNode = {
    id: 'root-win-desktop',
    role: 'Pane (Desktop)',
    name: 'Windows Desktop Workspace',
    states: ['Focusable', 'Visible'],
    bounds: { x: 0, y: 0, width: 1920, height: 1080 },
    children: [
      {
        id: 'win-app-word',
        role: 'Window',
        name: 'Document1 - Microsoft Word',
        states: ['Focused', 'Active', 'Maximized'],
        bounds: { x: 100, y: 40, width: 1720, height: 1000 },
        children: [
          {
            id: 'elem-doc-view',
            role: 'Document (IUIAutomationTextPattern)',
            name: 'Project_Specificaties_2026.docx',
            value: 'Huidige alinea over tekst-naar-spraak specificaties...',
            states: ['Focused', 'Focusable', 'SupportsTextPattern'],
            bounds: { x: 240, y: 160, width: 1200, height: 800 },
            children: [
              {
                id: 'elem-para-1',
                role: 'Paragraph (TextRange)',
                name: 'Alinea 1: Snelheidsregeling en WPM bereik',
                states: ['Selected', 'Visible'],
                bounds: { x: 260, y: 180, width: 1160, height: 90 },
              },
              {
                id: 'elem-para-2',
                role: 'Paragraph (TextRange)',
                name: 'Alinea 2: Contextuele detectie van €50,00 en datums',
                states: ['Visible'],
                bounds: { x: 260, y: 280, width: 1160, height: 90 },
              },
            ],
          },
        ],
      },
    ],
  };

  const macosTree: OsAccessibilityNode = {
    id: 'root-mac-desktop',
    role: 'AXSystemWideElement',
    name: 'macOS WindowServer Root',
    states: ['Visible'],
    bounds: { x: 0, y: 0, width: 1728, height: 1117 },
    children: [
      {
        id: 'mac-app-safari',
        role: 'AXApplication',
        name: 'Safari Web Browser',
        states: ['AXFocused', 'AXMain'],
        bounds: { x: 80, y: 50, width: 1560, height: 980 },
        children: [
          {
            id: 'elem-doc-view',
            role: 'AXWebArea (kAXRoleAttribute)',
            name: 'Toegankelijkheid & TTS Specificaties',
            value: 'Geselecteerde tekstbuffer via kAXSelectedTextAttribute',
            states: ['AXFocused', 'AXEnabled'],
            bounds: { x: 120, y: 140, width: 1400, height: 820 },
            children: [
              {
                id: 'elem-mac-heading',
                role: 'AXHeading',
                name: 'Woord-voor-woord visuele markering',
                states: ['AXVisible'],
                bounds: { x: 140, y: 160, width: 800, height: 40 },
              },
              {
                id: 'elem-mac-para',
                role: 'AXGroup / AXStaticText',
                name: 'Tekstblok met dyslexie-vriendelijke contrastkleuren',
                states: ['AXVisible'],
                bounds: { x: 140, y: 210, width: 1200, height: 120 },
              },
            ],
          },
        ],
      },
    ],
  };

  const linuxTree: OsAccessibilityNode = {
    id: 'root-linux-desktop',
    role: 'org.a11y.atspi.Accessible (Root)',
    name: 'GNOME Wayland / X11 Session',
    states: ['visible', 'active'],
    bounds: { x: 0, y: 0, width: 1920, height: 1080 },
    children: [
      {
        id: 'linux-app-writer',
        role: 'ROLE_APPLICATION',
        name: 'LibreOffice Writer',
        states: ['active', 'focused'],
        bounds: { x: 100, y: 60, width: 1600, height: 960 },
        children: [
          {
            id: 'elem-doc-view',
            role: 'ROLE_DOCUMENT_TEXT (org.a11y.atspi.Text)',
            name: 'ToegankelijkheidsDocument.odt',
            value: 'Tekstbuffer met caret-positie tracking via D-Bus',
            states: ['focused', 'editable', 'selectable'],
            bounds: { x: 220, y: 180, width: 1240, height: 760 },
            children: [
              {
                id: 'elem-linux-para-1',
                role: 'ROLE_PARAGRAPH',
                name: 'Tekst alinea met AT-SPI2 getSelection() ondersteuning',
                states: ['visible'],
                bounds: { x: 240, y: 200, width: 1200, height: 80 },
              },
            ],
          },
        ],
      },
    ],
  };

  const currentTree = selectedOs === 'windows' ? windowsTree : selectedOs === 'macos' ? macosTree : linuxTree;

  const renderNode = (node: OsAccessibilityNode, depth: number = 0) => {
    const isSelected = selectedNodeId === node.id;
    return (
      <div key={node.id} className="space-y-1">
        <button
          onClick={() => setSelectedNodeId(node.id)}
          className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
            isSelected
              ? 'bg-indigo-950/60 border border-indigo-500/60 text-white'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
          style={{ paddingLeft: `${Math.max(8, depth * 18)}px` }}
        >
          <div className="flex items-center gap-1.5 truncate">
            {node.children && node.children.length > 0 ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0 opacity-40" />
            )}
            <span className="font-semibold text-slate-200">{node.role}</span>
            <span className="text-slate-400 truncate">"{node.name}"</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 text-[10px] font-mono">
            {node.states.includes('Focused') || node.states.includes('AXFocused') || node.states.includes('focused') ? (
              <span className="text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/30">
                FOCUSED
              </span>
            ) : null}
          </div>
        </button>

        {node.children && node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* OS Selector Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-white text-base">
              Native OS Accessibility Subsystem Architectuur
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Directe integratie met ingebouwde OS API's voor Windows, macOS en Linux
          </span>
        </div>

        {/* OS Platform Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedOs('windows');
              setSelectedNodeId('elem-doc-view');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              selectedOs === 'windows'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>Windows (UIAutomationCore / IUIAutomation)</span>
          </button>

          <button
            onClick={() => {
              setSelectedOs('macos');
              setSelectedNodeId('elem-doc-view');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              selectedOs === 'macos'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>macOS (ApplicationServices / AXUIElement)</span>
          </button>

          <button
            onClick={() => {
              setSelectedOs('linux');
              setSelectedNodeId('elem-doc-view');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              selectedOs === 'linux'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>Linux (AT-SPI2 / org.a11y.Bus via D-Bus)</span>
          </button>
        </div>
      </div>

      {/* Architecture Spec Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 font-semibold text-blue-400">
            <Cpu className="w-4 h-4" />
            <span>Windows UI Automation</span>
          </div>
          <ul className="space-y-1.5 text-slate-400 leading-relaxed">
            <li>• Crate: <code className="text-slate-200">windows::Win32::UI::Accessibility</code></li>
            <li>• Interfaces: <code className="text-slate-200">IUIAutomation</code>, <code className="text-slate-200">IUIAutomationTextPattern</code></li>
            <li>• Events: FocusChanged & TextSelectionChanged events</li>
            <li>• TTS: SAPI 5 (<code className="text-slate-200">ISpVoice</code>) + Windows Media Speech</li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 font-semibold text-purple-400">
            <Layers className="w-4 h-4" />
            <span>macOS Accessibility (AX)</span>
          </div>
          <ul className="space-y-1.5 text-slate-400 leading-relaxed">
            <li>• Crate: <code className="text-slate-200">cocoa</code>, <code className="text-slate-200">objc</code>, <code className="text-slate-200">core-foundation</code></li>
            <li>• Functies: <code className="text-slate-200">AXUIElementCopyAttributeValue</code></li>
            <li>• Attributen: <code className="text-slate-200">kAXFocusedUIElementAttribute</code></li>
            <li>• TTS: <code className="text-slate-200">AVSpeechSynthesizer</code> & <code className="text-slate-200">NSSpeechSynthesizer</code></li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-400">
            <Crosshair className="w-4 h-4" />
            <span>Linux AT-SPI2 D-Bus</span>
          </div>
          <ul className="space-y-1.5 text-slate-400 leading-relaxed">
            <li>• Crate: <code className="text-slate-200">zbus</code> / <code className="text-slate-200">atspi</code></li>
            <li>• D-Bus Interface: <code className="text-slate-200">org.a11y.atspi.Accessible</code></li>
            <li>• Text & Caret: <code className="text-slate-200">org.a11y.atspi.Text.GetSelection</code></li>
            <li>• TTS: Speech Dispatcher (<code className="text-slate-200">speech-dispatcher-sys</code>)</li>
          </ul>
        </div>
      </div>

      {/* Live Tree Inspector and Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hierarchy Tree */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-semibold text-slate-300">
              Live Accessibility Elementen-Hiërarchie ({selectedOs.toUpperCase()})
            </span>
            <span className="text-emerald-400 text-[11px] flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>Verbonden met OS Event Bus</span>
            </span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 max-h-80 overflow-y-auto">
            {renderNode(currentTree)}
          </div>
        </div>

        {/* Node Properties & Screen Coordinates */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-semibold text-slate-300">
              Element Eigenschappen & Schermcoördinaten
            </span>
            <span className="font-mono text-indigo-400">{selectedNodeId}</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Bounding Box X / Y:</span>
              <span className="text-white">240px, 160px</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bounding Box W / H:</span>
              <span className="text-white">1200px, 800px</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Caret Offset:</span>
              <span className="text-emerald-400">14 (Woord 3 in alinea 1)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Focus Toestand:</span>
              <span className="text-emerald-400">TRUE (Gefocust door gebruiker)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tekstpatroon:</span>
              <span className="text-indigo-400">IUIAutomationTextPattern V2</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-slate-300 leading-relaxed text-[11px]">
            <span className="font-semibold text-indigo-400">Visuele Highlight Synchronisatie: </span>
            Zodra de TTS-engine een woord uitspreekt, stuurt de Rust accessibility daemon een <code className="text-indigo-300">highlight_rect()</code> commando naar het besturingssysteem om op de exacte pixelcoördinaten van het actieve woord een transparant kader te tekenen.
          </div>
        </div>
      </div>
    </div>
  );
};
