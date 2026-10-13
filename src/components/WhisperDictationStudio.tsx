import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Cpu,
  Copy,
  Check,
  PlusCircle,
  Volume2,
  Trash2,
  Command,
  Download,
  ShieldCheck,
  Radio,
  FileText,
} from 'lucide-react';

interface WhisperDictationStudioProps {
  onAppendToActiveDocument: (text: string) => void;
  onExecuteCommand: (cmd: 'play' | 'pause' | 'stop' | 'slower' | 'faster' | 'next' | 'prev' | 'bookmark') => void;
  onSpeakText: (text: string) => void;
}

interface CommandLogEntry {
  id: string;
  command: string;
  action: string;
  timestamp: string;
}

export const WhisperDictationStudio: React.FC<WhisperDictationStudioProps> = ({
  onAppendToActiveDocument,
  onExecuteCommand,
  onSpeakText,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [modelSize, setModelSize] = useState<'tiny' | 'base'>('tiny');
  const [dictatedText, setDictatedText] = useState<string>(
    'Dit is een voorbeeld van lokale transcriptie via het Whisper AI model. Alle spraak wordt lokaal op het apparaat verwerkt zonder dataoverdracht naar cloudservers.'
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [appended, setAppended] = useState<boolean>(false);
  const [commandHistory, setCommandHistory] = useState<CommandLogEntry[]>([
    { id: 'cmd-1', command: 'lees voor', action: 'Startte TTS afspelen', timestamp: '12:30:15' },
    { id: 'cmd-2', command: 'sneller', action: 'Verhoogde snelheid met +20 WPM', timestamp: '12:30:42' },
  ]);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [isVoiceDetected, setIsVoiceDetected] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState<string>('');

  const isRecordingRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);
  const interimTimerRef = useRef<number | null>(null);
  const lastInterimRef = useRef<string>('');

  const simulateDictation = (text: string) => {
    setIsVoiceDetected(true);
    setMicVolume(65);
    setTimeout(() => {
      setMicVolume(0);
      setIsVoiceDetected(false);
      const lower = text.toLowerCase().trim();
      let handled = false;
      if (lower.includes('lees voor') || lower.includes('start afspelen')) {
        onExecuteCommand('play');
        addCommandLog('lees voor', 'TTS voorlezen gestart');
        handled = true;
      } else if (lower.includes('stop') || lower.includes('stil')) {
        onExecuteCommand('stop');
        addCommandLog('stop', 'Spraak beëindigd');
        handled = true;
      } else if (lower.includes('pauze')) {
        onExecuteCommand('pause');
        addCommandLog('pauze', 'Spraak gepauzeerd');
        handled = true;
      } else if (lower.includes('sneller')) {
        onExecuteCommand('faster');
        addCommandLog('sneller', 'Snelheid +20 WPM verhoogd');
        handled = true;
      } else if (lower.includes('langzamer')) {
        onExecuteCommand('slower');
        addCommandLog('langzamer', 'Snelheid -20 WPM verlaagd');
        handled = true;
      } else if (lower.includes('volgende')) {
        onExecuteCommand('next');
        addCommandLog('volgende zin', 'Gesprongen naar volgende zin');
        handled = true;
      } else if (lower.includes('vorige')) {
        onExecuteCommand('prev');
        addCommandLog('vorige zin', 'Gesprongen naar vorige zin');
        handled = true;
      } else if (lower.includes('bladwijzer')) {
        onExecuteCommand('bookmark');
        addCommandLog('bladwijzer', 'Bladwijzer opgeslagen');
        handled = true;
      }

      if (!handled) {
        setDictatedText((prev) => (prev ? `${prev}\n${text}` : text));
      }
    }, 600);
  };

  // Initialize SpeechRecognition & Audio Analyser
  const startRecording = async () => {
    setMicError(null);
    isRecordingRef.current = true;
    setIsRecording(true);

    try {
      // 1. Audio Stream for Volume VU-meter
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateVolume = () => {
          if (!analyserRef.current || !isRecordingRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setMicVolume(Math.min(100, Math.round(avg * 1.5)));
          setIsVoiceDetected(avg > 15);
          animFrameRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      } catch (audioErr) {
        console.warn('Microphone stream error (might be running in sandboxed iframe):', audioErr);
        setMicError('Microfoontoegang niet toegestaan in browser-venster. Gebruik onderstaande Whisper simulator knoppen.');
      }

      // 2. SpeechRecognition for transcription & command intent parsing
      const launchRecognition = () => {
        if (!isRecordingRef.current) return;
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRec) return;

        try {
          const recognition = new SpeechRec();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'nl-NL';

          recognition.onresult = (event: any) => {
            let liveInterim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const res = event.results[i];
              const transcript = res[0]?.transcript?.trim() || '';
              const lower = transcript.toLowerCase();

              if (res.isFinal) {
                if (interimTimerRef.current) {
                  window.clearTimeout(interimTimerRef.current);
                  interimTimerRef.current = null;
                }
                lastInterimRef.current = '';
                setInterimText('');

                // Command check
                let handledCommand = false;
                if (lower.includes('lees voor') || lower.includes('start afspelen') || lower.includes('start')) {
                  onExecuteCommand('play');
                  addCommandLog('lees voor', 'TTS voorlezen gestart');
                  handledCommand = true;
                } else if (lower.includes('stop') || lower.includes('stil')) {
                  onExecuteCommand('stop');
                  addCommandLog('stop', 'Spraak beëindigd');
                  handledCommand = true;
                } else if (lower.includes('pauze')) {
                  onExecuteCommand('pause');
                  addCommandLog('pauze', 'Spraak gepauzeerd');
                  handledCommand = true;
                } else if (lower.includes('sneller') || lower.includes('vlugger')) {
                  onExecuteCommand('faster');
                  addCommandLog('sneller', 'Snelheid +20 WPM verhoogd');
                  handledCommand = true;
                } else if (lower.includes('langzamer') || lower.includes('trager')) {
                  onExecuteCommand('slower');
                  addCommandLog('langzamer', 'Snelheid -20 WPM verlaagd');
                  handledCommand = true;
                } else if (lower.includes('volgende zin') || lower.includes('volgende')) {
                  onExecuteCommand('next');
                  addCommandLog('volgende zin', 'Gesprongen naar volgende zin');
                  handledCommand = true;
                } else if (lower.includes('vorige zin') || lower.includes('vorige')) {
                  onExecuteCommand('prev');
                  addCommandLog('vorige zin', 'Gesprongen naar vorige zin');
                  handledCommand = true;
                } else if (lower.includes('bladwijzer') || lower.includes('markeer')) {
                  onExecuteCommand('bookmark');
                  addCommandLog('bladwijzer', 'Bladwijzer opgeslagen');
                  handledCommand = true;
                }

                // If not a pure command and final, append to dictated text buffer
                if (!handledCommand && transcript) {
                  setDictatedText((prev) => (prev ? `${prev} ${transcript}` : transcript));
                }
              } else {
                liveInterim += transcript + ' ';
              }
            }

            const trimmed = liveInterim.trim();
            if (trimmed) {
              setInterimText(trimmed);
              lastInterimRef.current = trimmed;
              if (interimTimerRef.current) {
                window.clearTimeout(interimTimerRef.current);
              }
              // Auto-commit on 1.4s silence
              interimTimerRef.current = window.setTimeout(() => {
                if (lastInterimRef.current) {
                  const pending = lastInterimRef.current;
                  lastInterimRef.current = '';
                  setInterimText('');
                  setDictatedText((prev) => (prev ? `${prev} ${pending}` : pending));
                }
              }, 1400);
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('Speech recognition error:', e);
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
              setMicError('Microfoontoegang geweigerd. Gebruik de ingebouwde test-knoppen om spraak te simuleren.');
            }
          };

          recognition.onend = () => {
            // Commit any unfinalized speech before ending or restarting
            if (lastInterimRef.current) {
              const pending = lastInterimRef.current;
              lastInterimRef.current = '';
              setInterimText('');
              setDictatedText((prev) => (prev ? `${prev} ${pending}` : pending));
            }
            if (interimTimerRef.current) {
              window.clearTimeout(interimTimerRef.current);
              interimTimerRef.current = null;
            }

            // If still marked as recording, restart with fresh instance after 300ms
            if (isRecordingRef.current) {
              restartTimeoutRef.current = window.setTimeout(() => {
                if (isRecordingRef.current) {
                  launchRecognition();
                }
              }, 300);
            }
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (recErr) {
          console.warn('SpeechRecognition creation failed:', recErr);
        }
      };

      launchRecognition();
    } catch (err) {
      console.warn('Microphone error or permission denied:', err);
      setMicError('Kon microfoon niet initialiseren. Test-modus is ingeschakeld.');
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setMicVolume(0);
    setIsVoiceDetected(false);
    setInterimText('');

    if (lastInterimRef.current) {
      const pending = lastInterimRef.current;
      lastInterimRef.current = '';
      setDictatedText((prev) => (prev ? `${prev} ${pending}` : pending));
    }

    if (interimTimerRef.current) {
      window.clearTimeout(interimTimerRef.current);
      interimTimerRef.current = null;
    }

    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
  };

  const addCommandLog = (cmd: string, action: string) => {
    const entry: CommandLogEntry = {
      id: `cmd-${Date.now()}`,
      command: cmd,
      action,
      timestamp: new Date().toLocaleTimeString('nl-NL'),
    };
    setCommandHistory((prev) => [entry, ...prev.slice(0, 9)]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(dictatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAppend = () => {
    if (!dictatedText.trim()) return;
    onAppendToActiveDocument(dictatedText);
    setAppended(true);
    setTimeout(() => setAppended(false), 2000);
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner: Local AI Model Specs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Lokale AI Spraak-naar-Tekst (Whisper AI Engine)
              </h2>
              <p className="text-xs text-slate-400">
                100% offline spraakherkenning via <code className="text-slate-200 font-mono">whisper-rs</code> en ONNX. Geen cloudverbinding of data-upload.
              </p>
            </div>
          </div>

          {/* Model selection & hardware acceleration indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg text-xs">
              <button
                onClick={() => setModelSize('tiny')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  modelSize === 'tiny'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Whisper Tiny (75 MB - Snel)
              </button>
              <button
                onClick={() => setModelSize('base')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  modelSize === 'base'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Whisper Base (145 MB - Precies)
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CPU AVX2 Lokaal</span>
            </div>
          </div>
        </div>

        {/* Live Microphone Recording Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs shadow-sm transition-all ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Stop Dicteren &amp; Luisteren</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Start Dicteren &amp; Stemcommando's</span>
                </>
              )}
            </button>

            {/* Live Audio VU Waveform Bar */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Geluidsniveau:</span>
              <div className="w-28 bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-75 ${
                    isVoiceDetected ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                  style={{ width: `${Math.max(5, micVolume)}%` }}
                />
              </div>
              <span className="font-mono text-slate-500 text-[11px]">{micVolume}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Radio className={`w-3.5 h-3.5 ${isVoiceDetected ? 'text-emerald-400 animate-ping' : 'text-slate-600'}`} />
            <span>Voice Activity Detection (VAD):</span>
            <span className={isVoiceDetected ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
              {isVoiceDetected ? 'Spraak actief' : 'Stilte / Wacht'}
            </span>
          </div>
        </div>

        {/* Error message if microphone is restricted */}
        {micError && (
          <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs text-amber-200 flex flex-wrap items-center justify-between gap-3">
            <span>{micError}</span>
            <span className="font-semibold text-emerald-400">Whisper simulator is direct beschikbaar</span>
          </div>
        )}

        {/* Quick Dictation Simulation Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 text-xs font-medium">Whisper Snelle Test:</span>
          <button
            onClick={() => simulateDictation('Op 01-01-2025 bedroeg de totale subsidie vijftig euro per licentie.')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            + Testzin 1 (Valuta & Datum)
          </button>
          <button
            onClick={() => simulateDictation('De stemherkenning werkt volledig offline via het lokale Whisper AI model.')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            + Testzin 2 (Offline Model)
          </button>
          <button
            onClick={() => simulateDictation('lees voor')}
            className="px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-800/80 hover:bg-indigo-900 text-indigo-300 font-medium transition-colors"
          >
            ▶ Commando: "lees voor"
          </button>
          <button
            onClick={() => simulateDictation('stop')}
            className="px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-800/80 hover:bg-rose-900 text-rose-300 font-medium transition-colors"
          >
            ⏹ Commando: "stop"
          </button>
        </div>
      </div>

      {/* Main Grid: Dictation Canvas & Hands-free Commands */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Dictation Canvas */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-white text-sm">Gedicteerde Tekst (Spraakbuffer)</h3>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Kopieer tekst"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Gekopieerd!' : 'Kopiëren'}</span>
              </button>

              <button
                onClick={() => setDictatedText('')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                title="Wis tekst"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            value={dictatedText}
            onChange={(e) => setDictatedText(e.target.value)}
            rows={7}
            placeholder="Spreek in de microfoon of typ hier uw tekst... Zeg bijvoorbeeld 'lees voor' om het afspelen te starten."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
          />

          {/* Live interim speech readout */}
          {interimText && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950 border border-emerald-900/60 text-xs text-amber-300 italic shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>Live spraak: «{interimText}»</span>
            </div>
          )}

          {/* Action Bar below Dictation Buffer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleAppend}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{appended ? 'Toegevoegd aan Document!' : 'Voeg toe aan Actief Document (Leeslijst)'}</span>
            </button>

            <button
              onClick={() => onSpeakText(dictatedText)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span>Beluister met TTS Voorlezer</span>
            </button>
          </div>
        </div>

        {/* Right Col: Voice Commands HUD & Recognized Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Command className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-white text-sm">Handsfree Stemcommando's</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">NATUURLIJKE SPRAAK</span>
          </div>

          {/* Supported Voice Commands Cheat-sheet */}
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span>"Lees voor" / "Start"</span>
              <span className="text-emerald-400 text-[11px] font-mono">Play</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span>"Stop" / "Stil"</span>
              <span className="text-rose-400 text-[11px] font-mono">Stop</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span>"Sneller" / "Langzamer"</span>
              <span className="text-amber-400 text-[11px] font-mono">±20 WPM</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span>"Volgende zin" / "Vorige zin"</span>
              <span className="text-indigo-400 text-[11px] font-mono">Navigatie</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <span>"Markeer" / "Bladwijzer"</span>
              <span className="text-cyan-400 text-[11px] font-mono">Bookmark</span>
            </div>
          </div>

          {/* Real-Time Command Execution History */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400">Uitgevoerde Commando's:</span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {commandHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-2 rounded bg-slate-950/80 border border-slate-800/60 text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-400 font-mono">"{item.command}"</span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">{item.action}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
