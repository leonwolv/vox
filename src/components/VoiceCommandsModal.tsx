import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Check, Volume2, Sparkles } from 'lucide-react';

interface VoiceCommandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (cmd: 'play' | 'stop' | 'slower' | 'faster' | 'next') => void;
}

export const VoiceCommandsModal: React.FC<VoiceCommandsModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognizedCommand, setRecognizedCommand] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    let recognition: any = null;
    try {
      recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'nl-NL';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript.toLowerCase().trim();
        setTranscript(text);

        if (text.includes('lees voor') || text.includes('start') || text.includes('afspelen')) {
          setRecognizedCommand('Lees voor (Play)');
          onExecuteCommand('play');
        } else if (text.includes('stop') || text.includes('pauze') || text.includes('stil')) {
          setRecognizedCommand('Stop');
          onExecuteCommand('stop');
        } else if (text.includes('langzamer') || text.includes('trager')) {
          setRecognizedCommand('Langzamer (-20 WPM)');
          onExecuteCommand('slower');
        } else if (text.includes('sneller') || text.includes('vlugger')) {
          setRecognizedCommand('Sneller (+20 WPM)');
          onExecuteCommand('faster');
        } else if (text.includes('volgende') || text.includes('verder')) {
          setRecognizedCommand('Volgende zin');
          onExecuteCommand('next');
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('SpeechRecognition not available', e);
    }

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch {}
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md text-slate-200 overflow-hidden shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Mic className={`w-5 h-5 ${isListening ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
            <h2 className="font-semibold text-white text-base">Spraakgestuurde Bediening (Hands-Free)</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status display */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
          <div className="flex items-center justify-center">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-lg shadow-rose-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Mic className="w-6 h-6" />
            </div>
          </div>

          <div className="text-xs">
            {isListening ? (
              <span className="text-rose-400 font-medium">Microfoon actief — spreek een commando uit...</span>
            ) : (
              <span className="text-slate-400">Microfoon inactief of niet ondersteund in deze browser</span>
            )}
          </div>

          {transcript && (
            <div className="text-xs text-slate-300 font-mono italic">
              "{transcript}"
            </div>
          )}

          {recognizedCommand && (
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Herkend: {recognizedCommand}</span>
            </div>
          )}
        </div>

        {/* Supported voice commands list */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">Ondersteunde Spraakcommando's:</span>
            <span className="text-[10px] text-indigo-400 font-mono">KLIK OM TE TESTEN</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-400">
            <button
              onClick={() => {
                setRecognizedCommand('Lees voor (Play)');
                onExecuteCommand('play');
              }}
              className="p-2 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
            >
              <strong className="text-white block">"Lees voor"</strong>
              <span>Start het voorlezen</span>
            </button>
            <button
              onClick={() => {
                setRecognizedCommand('Stop');
                onExecuteCommand('stop');
              }}
              className="p-2 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
            >
              <strong className="text-white block">"Stop"</strong>
              <span>Onderbreekt de spraak</span>
            </button>
            <button
              onClick={() => {
                setRecognizedCommand('Langzamer (-20 WPM)');
                onExecuteCommand('slower');
              }}
              className="p-2 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
            >
              <strong className="text-white block">"Langzamer"</strong>
              <span>Verlaagt WPM tempo</span>
            </button>
            <button
              onClick={() => {
                setRecognizedCommand('Sneller (+20 WPM)');
                onExecuteCommand('faster');
              }}
              className="p-2 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
            >
              <strong className="text-white block">"Sneller"</strong>
              <span>Verhoogt WPM tempo</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
