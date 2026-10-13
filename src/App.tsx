import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { DesktopWindowFrame } from './components/DesktopWindowFrame';
import { DesktopBuildGuide } from './components/DesktopBuildGuide';
import { DesktopGuiShowcase } from './components/DesktopGuiShowcase';
import { ReaderWorkspace } from './components/ReaderWorkspace';
import { PlaybackControls } from './components/PlaybackControls';
import { VisualSettingsPanel } from './components/VisualSettingsPanel';
import { VoiceSelector } from './components/VoiceSelector';
import { FloatingToolbar } from './components/FloatingToolbar';
import { NormalizerLab } from './components/NormalizerLab';
import { DocumentAdaptersViewer } from './components/DocumentAdaptersViewer';
import { OsAccessibilityViewer } from './components/OsAccessibilityViewer';
import { AudioExportModal } from './components/AudioExportModal';
import { RustCodeViewer } from './components/RustCodeViewer';
import { WhisperDictationStudio } from './components/WhisperDictationStudio';
import { VoiceCommandsModal } from './components/VoiceCommandsModal';
import {
  DocumentItem,
  LexiconEntry,
  PlaybackSettings,
  ReadingBookmark,
  VisualSettings,
  VoiceItem,
} from './types/tts';
import { CURATED_VOICES, SpeechCoordinator } from './utils/speechEngine';
import { DEFAULT_LEXICON, normalizeText } from './utils/normalizer';
import { SAMPLE_DOCUMENTS } from './utils/sampleDocuments';
import { toSpeechRecLang } from './utils/languageHelper';
import { Bookmark, ListPlus, SlidersHorizontal, Layers, CheckCircle, Monitor } from 'lucide-react';

export default function App() {
  // Navigation - includes local AI speech to text (Whisper)
  const [activeTab, setActiveTab] = useState<'reader' | 'gui' | 'stt' | 'desktop' | 'normalizer' | 'adapters' | 'a11y' | 'rust'>('gui');
  const [osStyle, setOsStyle] = useState<'windows' | 'macos' | 'linux'>('windows');
  const [isWindowMaximized, setIsWindowMaximized] = useState<boolean>(true);

  // Documents and Queue
  const [documents, setDocuments] = useState<DocumentItem[]>(SAMPLE_DOCUMENTS);
  const [currentDocIndex, setCurrentDocIndex] = useState<number>(0);
  const activeDocument = documents[currentDocIndex] || documents[0];

  // Voices
  const [voices, setVoices] = useState<VoiceItem[]>(CURATED_VOICES);
  const [selectedVoice, setSelectedVoice] = useState<VoiceItem>(CURATED_VOICES[0]);
  const [autoDetectLang, setAutoDetectLang] = useState<boolean>(true);
  const [isRecordingStt, setIsRecordingStt] = useState<boolean>(false);
  const [sttInterimText, setSttInterimText] = useState<string>('');
  const [sttMicVolume, setSttMicVolume] = useState<number>(0);
  const [sttStatusNotification, setSttStatusNotification] = useState<{
    message: string;
    type: 'success' | 'command' | 'info' | 'error';
  } | null>(null);
  const isRecordingSttRef = useRef<boolean>(false);
  const sttRecognitionRef = useRef<any>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sttRestartTimeoutRef = useRef<number | null>(null);
  const interimCommitTimerRef = useRef<number | null>(null);
  const lastInterimRef = useRef<string>('');

  // Playback parameters
  const [playbackSettings, setPlaybackSettings] = useState<PlaybackSettings>({
    rateWpm: 175,
    pitch: 0,
    volume: 100,
    ducking: true,
    pauseCommaMs: 250,
    pausePeriodMs: 450,
    pauseExclamationQuestionMs: 600,
    pauseParagraphMs: 900,
    breathingSimulation: true,
  });

  // Visual settings (Dyslexia-first defaults)
  const [visualSettings, setVisualSettings] = useState<VisualSettings>({
    highlightStyle: 'background',
    highlightColor: '#2563EB',
    highlightOpacity: 0.9,
    borderWidth: 2,
    theme: 'dyslexia',
    customBgColor: '#FAF6EE',
    customTextColor: '#1A2B4C',
    customHighlightColor: '#2563EB',
    sentenceHighlight: true,
    sentenceHighlightColor: '#4F46E5',
    fadeOutReadText: false,
    nextSentencePreview: true,
    fontFamily: 'sans',
    fontSize: 18,
    lineSpacing: 1.8,
    letterSpacing: 0.05,
  });

  // State: Playback execution
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState<number>(0);
  const [currentWordIdx, setCurrentWordIdx] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<ReadingBookmark[]>([
    {
      id: 'bm-initial',
      docId: 'doc-spec-word',
      title: 'Contextgevoelige getallen & valuta',
      sentenceIndex: 3,
      wordIndex: 0,
      createdAt: '2026-10-12',
      snippet: 'Op 01-01-2025 bedroeg de totale subsidie €50,00...',
    },
  ]);

  // Lexicon
  const [lexicon, setLexicon] = useState<LexiconEntry[]>(DEFAULT_LEXICON);

  // Modals & Panels
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showVoiceCommands, setShowVoiceCommands] = useState<boolean>(false);
  const [showFloatingDock, setShowFloatingDock] = useState<boolean>(true);
  const [showVisualPanel, setShowVisualPanel] = useState<boolean>(false);

  // Coordinator ref
  const coordinatorRef = useRef<SpeechCoordinator | null>(null);
  const sleepTimerRef = useRef<number | null>(null);

  // Initialize SpeechCoordinator & load voices
  useEffect(() => {
    const coord = new SpeechCoordinator();
    coordinatorRef.current = coord;

    coord.getAvailableVoices().then((loadedVoices) => {
      setVoices(loadedVoices);
      const dutch = loadedVoices.find((v) => v.lang.startsWith('nl'));
      if (dutch) setSelectedVoice(dutch);
    });

    return () => {
      coord.stop();
    };
  }, []);

  // Sleep timer handler
  useEffect(() => {
    if (sleepTimerRef.current) {
      window.clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }

    if (sleepTimerMinutes && sleepTimerMinutes > 0 && isPlaying) {
      sleepTimerRef.current = window.setTimeout(() => {
        handleStop();
        setSleepTimerMinutes(null);
      }, sleepTimerMinutes * 60 * 1000);
    }

    return () => {
      if (sleepTimerRef.current) {
        window.clearTimeout(sleepTimerRef.current);
      }
    };
  }, [sleepTimerMinutes, isPlaying]);

  // Split active document into sentences
  const allSentences = React.useMemo(() => {
    const raw = activeDocument.content;
    const matches = raw.match(/[^.!?]+[.!?]+|\S+$/g);
    return matches ? matches.map((s) => s.trim()).filter(Boolean) : [raw];
  }, [activeDocument]);

  // Speak a specific sentence by index
  const speakSentenceAt = useCallback(
    (index: number) => {
      if (index >= allSentences.length) {
        if (isLooping) {
          setCurrentSentenceIdx(0);
          speakSentenceAt(0);
        } else {
          // Check next document in queue
          if (currentDocIndex + 1 < documents.length) {
            setCurrentDocIndex((prev) => prev + 1);
            setCurrentSentenceIdx(0);
          } else {
            setIsPlaying(false);
            setIsPaused(false);
          }
        }
        return;
      }

      setCurrentSentenceIdx(index);
      setCurrentWordIdx(0);
      setIsPlaying(true);
      setIsPaused(false);

      const rawSentence = allSentences[index];
      // Normalize before feeding into speech coordinator
      const normalized = normalizeText(rawSentence, lexicon);
      const words = rawSentence.split(/\s+/).filter(Boolean);

      coordinatorRef.current?.speakSentence(
        normalized,
        words,
        selectedVoice,
        playbackSettings,
        (wordIdx) => {
          setCurrentWordIdx(wordIdx);
        },
        () => {
          // Sentence ended, proceed to next with paragraph/sentence pause
          const isLastInParagraph = rawSentence.endsWith('\n') || words.length === 0;
          const pauseMs = isLastInParagraph
            ? playbackSettings.pauseParagraphMs
            : rawSentence.endsWith('?') || rawSentence.endsWith('!')
            ? playbackSettings.pauseExclamationQuestionMs
            : playbackSettings.pausePeriodMs;

          setTimeout(() => {
            speakSentenceAt(index + 1);
          }, pauseMs);
        }
      );
    },
    [allSentences, isLooping, currentDocIndex, documents.length, selectedVoice, playbackSettings, lexicon]
  );

  const handlePlay = useCallback(() => {
    speakSentenceAt(currentSentenceIdx);
  }, [speakSentenceAt, currentSentenceIdx]);

  const handlePause = useCallback(() => {
    coordinatorRef.current?.pause();
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    coordinatorRef.current?.resume();
    setIsPaused(false);
  }, []);

  const handleStop = useCallback(() => {
    coordinatorRef.current?.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIdx(0);
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      if (isPaused) {
        handleResume();
      } else {
        handlePause();
      }
    } else {
      handlePlay();
    }
  }, [isPlaying, isPaused, handleResume, handlePause, handlePlay]);

  const handlePrevSentence = useCallback(() => {
    const nextIdx = Math.max(0, currentSentenceIdx - 1);
    setCurrentSentenceIdx(nextIdx);
    if (isPlaying) speakSentenceAt(nextIdx);
  }, [currentSentenceIdx, isPlaying, speakSentenceAt]);

  const handleNextSentence = useCallback(() => {
    const nextIdx = Math.min(allSentences.length - 1, currentSentenceIdx + 1);
    setCurrentSentenceIdx(nextIdx);
    if (isPlaying) speakSentenceAt(nextIdx);
  }, [currentSentenceIdx, allSentences.length, isPlaying, speakSentenceAt]);

  const handlePrevParagraph = useCallback(() => {
    const nextIdx = Math.max(0, currentSentenceIdx - 3);
    setCurrentSentenceIdx(nextIdx);
    if (isPlaying) speakSentenceAt(nextIdx);
  }, [currentSentenceIdx, isPlaying, speakSentenceAt]);

  const handleNextParagraph = useCallback(() => {
    const nextIdx = Math.min(allSentences.length - 1, currentSentenceIdx + 3);
    setCurrentSentenceIdx(nextIdx);
    if (isPlaying) speakSentenceAt(nextIdx);
  }, [currentSentenceIdx, allSentences.length, isPlaying, speakSentenceAt]);

  // Global Keyboard Shortcuts (Ctrl+Shift+Space, Ctrl+Left/Right, Ctrl+Up/Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + Space -> Play / Pause
      if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      }
      // Ctrl + Left -> Previous sentence
      else if (e.ctrlKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevSentence();
      }
      // Ctrl + Right -> Next sentence
      else if (e.ctrlKey && e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextSentence();
      }
      // Ctrl + Up -> Previous paragraph
      else if (e.ctrlKey && e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevParagraph();
      }
      // Ctrl + Down -> Next paragraph
      else if (e.ctrlKey && e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextParagraph();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handlePrevSentence, handleNextSentence, handlePrevParagraph, handleNextParagraph]);

  // Bookmarking toggle
  const handleToggleBookmark = (sentenceIdx: number) => {
    const existing = bookmarks.find(
      (b) => b.docId === activeDocument.id && b.sentenceIndex === sentenceIdx
    );
    if (existing) {
      setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
    } else {
      const newBm: ReadingBookmark = {
        id: `bm-${Date.now()}`,
        docId: activeDocument.id,
        title: `Zin #${sentenceIdx + 1} Markering`,
        sentenceIndex: sentenceIdx,
        wordIndex: 0,
        createdAt: new Date().toLocaleDateString('nl-NL'),
        snippet: (allSentences[sentenceIdx] || '').slice(0, 60) + '...',
      };
      setBookmarks((prev) => [...prev, newBm]);
    }
  };

  // Lexicon Handlers
  const handleAddLexiconEntry = (entry: Omit<LexiconEntry, 'id'>) => {
    setLexicon((prev) => [
      ...prev,
      { ...entry, id: `lex-${Date.now()}` },
    ]);
  };

  const handleRemoveLexiconEntry = (id: string) => {
    setLexicon((prev) => prev.filter((e) => e.id !== id));
  };

  // Load custom content from adapters
  const handleLoadFromAdapter = (title: string, content: string, type: string) => {
    const newDoc: DocumentItem = {
      id: `doc-adapter-${Date.now()}`,
      title,
      type: type as any,
      content,
      author: 'Geëxtraheerd via Adapter',
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setCurrentDocIndex(0);
    setCurrentSentenceIdx(0);
    setActiveTab('reader');
  };

  // Voice command dispatcher with hands-free navigation & bookmarking
  const handleVoiceCommand = (cmd: 'play' | 'pause' | 'stop' | 'slower' | 'faster' | 'next' | 'prev' | 'bookmark') => {
    if (cmd === 'play') handlePlay();
    else if (cmd === 'pause') handlePause();
    else if (cmd === 'stop') handleStop();
    else if (cmd === 'slower') {
      setPlaybackSettings((prev) => ({ ...prev, rateWpm: Math.max(50, prev.rateWpm - 20) }));
    } else if (cmd === 'faster') {
      setPlaybackSettings((prev) => ({ ...prev, rateWpm: Math.min(500, prev.rateWpm + 20) }));
    } else if (cmd === 'next') handleNextSentence();
    else if (cmd === 'prev') handlePrevSentence();
    else if (cmd === 'bookmark') handleToggleBookmark(currentSentenceIdx);
  };

  const handleAppendDictation = (text: string) => {
    setDocuments((prev) => {
      const updated = [...prev];
      if (updated[currentDocIndex]) {
        updated[currentDocIndex] = {
          ...updated[currentDocIndex],
          content: `${updated[currentDocIndex].content}\n\n${text}`,
        };
      }
      return updated;
    });
  };

  const showSttNotification = (message: string, type: 'success' | 'command' | 'info' | 'error') => {
    setSttStatusNotification({ message, type });
    setTimeout(() => {
      setSttStatusNotification((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Unified speech-to-text handler for dictation and hands-free voice commands
  const processSpeechText = useCallback(
    (rawText: string) => {
      const text = rawText.trim();
      if (!text) return;

      const lower = text.toLowerCase();
      if (lower.includes('lees voor') || lower.includes('start afspelen') || lower.includes('start met lezen')) {
        handlePlay();
        showSttNotification('Stemcommando: "Lees voor" geactiveerd', 'command');
      } else if (lower.includes('stop') || lower.includes('stil') || lower.includes('hou op')) {
        handleStop();
        showSttNotification('Stemcommando: "Stop" uitgevoerd', 'command');
      } else if (lower.includes('pauze')) {
        handlePause();
        showSttNotification('Stemcommando: "Pauze" uitgevoerd', 'command');
      } else if (lower.includes('hervat') || lower.includes('doorgaan') || lower.includes('verder')) {
        handleResume();
        showSttNotification('Stemcommando: "Hervat" uitgevoerd', 'command');
      } else if (lower.includes('sneller') || lower.includes('vlugger')) {
        setPlaybackSettings((prev) => ({ ...prev, rateWpm: Math.min(500, prev.rateWpm + 20) }));
        showSttNotification('Stemcommando: Snelheid +20 WPM verhoogd', 'command');
      } else if (lower.includes('langzamer') || lower.includes('trager')) {
        setPlaybackSettings((prev) => ({ ...prev, rateWpm: Math.max(50, prev.rateWpm - 20) }));
        showSttNotification('Stemcommando: Snelheid -20 WPM verlaagd', 'command');
      } else if (lower.includes('volgende zin') || lower === 'volgende') {
        handleNextSentence();
        showSttNotification('Stemcommando: Volgende zin', 'command');
      } else if (lower.includes('vorige zin') || lower === 'vorige') {
        handlePrevSentence();
        showSttNotification('Stemcommando: Vorige zin', 'command');
      } else {
        handleAppendDictation(text);
        showSttNotification(`Toegevoegd aan document: "${text.slice(0, 32)}..."`, 'success');
      }
    },
    [handlePlay, handleStop, handlePause, handleResume, handleNextSentence, handlePrevSentence, handleAppendDictation]
  );

  // Instant test / simulation for Whisper STT (works in all environments)
  const handleSimulateStt = useCallback(
    (text: string) => {
      setSttInterimText(text);
      setTimeout(() => {
        setSttInterimText('');
        processSpeechText(text);
      }, 500);
    },
    [processSpeechText]
  );

  // Cleanly terminate any active STT audio streams, recognition sessions, and restart timeouts
  const cleanupSttSession = useCallback(() => {
    isRecordingSttRef.current = false;
    if (sttRestartTimeoutRef.current) {
      window.clearTimeout(sttRestartTimeoutRef.current);
      sttRestartTimeoutRef.current = null;
    }
    if (interimCommitTimerRef.current) {
      window.clearTimeout(interimCommitTimerRef.current);
      interimCommitTimerRef.current = null;
    }
    lastInterimRef.current = '';
    if (sttRecognitionRef.current) {
      try {
        sttRecognitionRef.current.abort();
      } catch {}
      sttRecognitionRef.current = null;
    }
    if (audioStreamRef.current) {
      try {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close().catch(() => {});
      } catch {}
      audioContextRef.current = null;
    }
    setIsRecordingStt(false);
    setSttInterimText('');
    setSttMicVolume(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSttSession();
    };
  }, [cleanupSttSession]);

  // Start fresh STT session with microphone audio volume meter and fresh Web Speech Recognition instance
  const startSttSession = useCallback(() => {
    cleanupSttSession();
    isRecordingSttRef.current = true;
    setIsRecordingStt(true);
    setSttInterimText('');
    lastInterimRef.current = '';
    showSttNotification('Whisper AI luistert... Spreek nu of dicteer', 'info');

    // 1. Audio stream & VU meter
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          if (!isRecordingSttRef.current) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          audioStreamRef.current = stream;
          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              const ctx = new AudioCtx();
              audioContextRef.current = ctx;
              const source = ctx.createMediaStreamSource(stream);
              const analyser = ctx.createAnalyser();
              analyser.fftSize = 64;
              source.connect(analyser);

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const updateMeter = () => {
                if (!isRecordingSttRef.current || !ctx) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                const avg = sum / dataArray.length;
                setSttMicVolume(Math.min(100, Math.round(avg * 1.6)));
                requestAnimationFrame(updateMeter);
              };
              updateMeter();
            }
          } catch {}
        })
        .catch((err) => {
          console.warn('Microphone permission check:', err);
          showSttNotification('Microfoon niet toegestaan of bezet. Whisper simulator actief.', 'info');
        });
    }

    // 2. Launch Web Speech Recognition with safe instance recreation
    const launchRecognition = () => {
      if (!isRecordingSttRef.current) return;

      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRec) {
        showSttNotification('Browser Speech API niet beschikbaar. Whisper Simulator actief.', 'info');
        return;
      }

      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = toSpeechRecLang(selectedVoice?.lang);

        recognition.onstart = () => {
          if (isRecordingSttRef.current) {
            setIsRecordingStt(true);
          }
        };

        recognition.onresult = (event: any) => {
          let liveInterim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            const transcript = res[0]?.transcript?.trim() || '';
            if (res.isFinal) {
              if (interimCommitTimerRef.current) {
                window.clearTimeout(interimCommitTimerRef.current);
                interimCommitTimerRef.current = null;
              }
              lastInterimRef.current = '';
              setSttInterimText('');
              processSpeechText(transcript);
            } else {
              liveInterim += transcript + ' ';
            }
          }

          const trimmedInterim = liveInterim.trim();
          if (trimmedInterim) {
            setSttInterimText(trimmedInterim);
            lastInterimRef.current = trimmedInterim;

            if (interimCommitTimerRef.current) {
              window.clearTimeout(interimCommitTimerRef.current);
            }
            // Auto-commit on silence/pause of 1.3s so nothing spoken is lost!
            interimCommitTimerRef.current = window.setTimeout(() => {
              if (lastInterimRef.current) {
                const text = lastInterimRef.current;
                lastInterimRef.current = '';
                setSttInterimText('');
                processSpeechText(text);
              }
            }, 1300);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition error:', e.error);
          if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
            showSttNotification('Microfoon niet toegestaan door browser. Gebruik testknoppen.', 'error');
            cleanupSttSession();
          } else if (e.error === 'network') {
            showSttNotification('Netwerkfout bij online spraakservice. Whisper testknoppen beschikbaar.', 'info');
          }
          // Note: 'no-speech' happens on normal pauses; do not abort!
        };

        recognition.onend = () => {
          // Flush any pending interim transcript before restart
          if (lastInterimRef.current) {
            const text = lastInterimRef.current;
            lastInterimRef.current = '';
            setSttInterimText('');
            processSpeechText(text);
          }
          if (interimCommitTimerRef.current) {
            window.clearTimeout(interimCommitTimerRef.current);
            interimCommitTimerRef.current = null;
          }

          // Recreate fresh instance after small pause if still recording
          if (isRecordingSttRef.current) {
            sttRestartTimeoutRef.current = window.setTimeout(() => {
              if (isRecordingSttRef.current) {
                launchRecognition();
              }
            }, 300);
          } else {
            setIsRecordingStt(false);
            setSttInterimText('');
          }
        };

        recognition.start();
        sttRecognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition launch exception:', err);
      }
    };

    launchRecognition();
  }, [
    cleanupSttSession,
    selectedVoice?.lang,
    processSpeechText,
  ]);

  // Dock & Mini-Widget STT toggle handler (Dictation & hands-free voice commands)
  const handleToggleDockStt = useCallback(() => {
    if (isRecordingStt) {
      cleanupSttSession();
      setSttInterimText('');
      showSttNotification('STT dicteren gestopt', 'info');
    } else {
      startSttSession();
    }
  }, [isRecordingStt, cleanupSttSession, startSttSession]);

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 transition-all ${!isWindowMaximized ? 'p-4 sm:p-8 bg-slate-900/40 backdrop-blur-md' : ''}`}>
      <div className={`flex-1 flex flex-col ${!isWindowMaximized ? 'max-w-6xl w-full mx-auto rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-950' : ''}`}>
        {/* Native OS Desktop Window Titlebar (Windows 11 / macOS / Linux) */}
        <DesktopWindowFrame
          osStyle={osStyle}
          setOsStyle={setOsStyle}
          isMaximized={isWindowMaximized}
          onToggleMaximize={() => setIsWindowMaximized(!isWindowMaximized)}
          onMinimize={() => {
            // Minimize to system tray notification
            setShowFloatingDock(true);
          }}
          onClose={() => {
            handleStop();
          }}
        />

        {/* 3-Zone Top Bar Navigation */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onOpenExport={() => setShowExportModal(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TAB: GUI Showcase (Active by default for "Voorbeeld van de GUI") */}
          {activeTab === 'gui' && (
            <DesktopGuiShowcase
              osStyle={osStyle}
              setOsStyle={setOsStyle}
              isPlaying={isPlaying}
              isPaused={isPaused}
              onTogglePlay={handleTogglePlay}
              onStop={handleStop}
              onPrev={handlePrevSentence}
              onNext={handleNextSentence}
              currentSentenceText={allSentences[currentSentenceIdx] || ''}
              currentWordText={
                (allSentences[currentSentenceIdx] || '').split(/\s+/).filter(Boolean)[currentWordIdx] || ''
              }
              settings={playbackSettings}
              onUpdateSettings={(up) => setPlaybackSettings((prev) => ({ ...prev, ...up }))}
              visualSettings={visualSettings}
              onUpdateVisualSettings={(up) => setVisualSettings((prev) => ({ ...prev, ...up }))}
              voices={voices}
              selectedVoice={selectedVoice}
              onSelectVoice={(v) => setSelectedVoice(v)}
              isRecordingStt={isRecordingStt}
              onToggleStt={handleToggleDockStt}
              activeDocumentContent={activeDocument.content}
              activeDocumentTitle={activeDocument.title}
              sttInterimText={sttInterimText}
              sttStatusNotification={sttStatusNotification}
              onSimulateStt={handleSimulateStt}
              sttMicVolume={sttMicVolume}
              onSwitchToStudio={() => setActiveTab('reader')}
            />
          )}

          {/* TAB: Local AI Speech-to-Text (Whisper AI) Dictation & Hands-Free Commands */}
          {activeTab === 'stt' && (
            <WhisperDictationStudio
              onAppendToActiveDocument={handleAppendDictation}
              onExecuteCommand={handleVoiceCommand}
              onSpeakText={(text) => {
                coordinatorRef.current?.speakSentence(
                  text,
                  text.split(/\s+/),
                  selectedVoice,
                  playbackSettings,
                  () => {},
                  () => {}
                );
              }}
            />
          )}

          {/* TAB: Desktop App Build & Architecture Guide */}
          {activeTab === 'desktop' && (
            <div className="space-y-6">
              <DesktopBuildGuide />
              <div className="pt-4 border-t border-slate-800">
                <OsAccessibilityViewer />
              </div>
            </div>
          )}

          {/* TAB 1: Reader & Studio Workspace */}
          {activeTab === 'reader' && (
            <div className="space-y-6">
              {/* Top Workspace Bar: Document Switcher & Visual Panel Drawer Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs">
                <div className="flex items-center gap-3 overflow-x-auto max-w-full">
                  <span className="text-slate-400 font-semibold shrink-0">Wachtrij Documenten:</span>
                  {documents.map((doc, idx) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        handleStop();
                        setCurrentDocIndex(idx);
                        setCurrentSentenceIdx(0);
                      }}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                        currentDocIndex === idx
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {doc.title}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowVisualPanel(!showVisualPanel)}
                    className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 font-medium ${
                      showVisualPanel
                        ? 'bg-indigo-950/40 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Dyslexie & Weergave Opties</span>
                  </button>
                </div>
              </div>

              {/* Expandable Visual & Dyslexia Settings Panel */}
              {showVisualPanel && (
                <VisualSettingsPanel
                  settings={visualSettings}
                  onUpdate={(up) => setVisualSettings((prev) => ({ ...prev, ...up }))}
                />
              )}

              {/* Playback Controls Component */}
              <PlaybackControls
                isPlaying={isPlaying}
                isPaused={isPaused}
                onPlay={handlePlay}
                onPause={handlePause}
                onResume={handleResume}
                onStop={handleStop}
                onPrevSentence={handlePrevSentence}
                onNextSentence={handleNextSentence}
                onPrevParagraph={handlePrevParagraph}
                onNextParagraph={handleNextParagraph}
                settings={playbackSettings}
                onUpdateSettings={(up) => setPlaybackSettings((prev) => ({ ...prev, ...up }))}
                isLooping={isLooping}
                onToggleLoop={() => setIsLooping(!isLooping)}
                sleepTimerMinutes={sleepTimerMinutes}
                onSetSleepTimer={setSleepTimerMinutes}
                onOpenVoiceCommands={() => setShowVoiceCommands(true)}
              />

              {/* Reader Workspace Component (The Reading Canvas) */}
              <ReaderWorkspace
                content={activeDocument.content}
                currentSentenceIdx={currentSentenceIdx}
                currentWordIdx={currentWordIdx}
                isPlaying={isPlaying}
                visualSettings={visualSettings}
                onSentenceClick={(sIdx) => speakSentenceAt(sIdx)}
                bookmarks={bookmarks.filter((b) => b.docId === activeDocument.id)}
                onToggleBookmark={handleToggleBookmark}
              />

              {/* Voice Library Selector */}
              <VoiceSelector
                voices={voices}
                selectedVoice={selectedVoice}
                onSelectVoice={setSelectedVoice}
                autoDetectLang={autoDetectLang}
                onToggleAutoDetect={setAutoDetectLang}
              />
            </div>
          )}

          {/* TAB 2: Text Normalizer Lab */}
          {activeTab === 'normalizer' && (
            <NormalizerLab
              lexicon={lexicon}
              onAddLexiconEntry={handleAddLexiconEntry}
              onRemoveLexiconEntry={handleRemoveLexiconEntry}
              onSpeakText={(text) => {
                coordinatorRef.current?.speakSentence(
                  text,
                  text.split(/\s+/),
                  selectedVoice,
                  playbackSettings,
                  () => {},
                  () => {}
                );
              }}
            />
          )}

          {/* TAB 3: Document Adapters (Word, DOM, Email, PDF) */}
          {activeTab === 'adapters' && (
            <DocumentAdaptersViewer onLoadIntoReader={handleLoadFromAdapter} />
          )}

          {/* TAB 4: OS Accessibility Tree (Windows / macOS / Linux) */}
          {activeTab === 'a11y' && <OsAccessibilityViewer />}

          {/* TAB 5: Rust Core & ZIP Downloader */}
          {activeTab === 'rust' && <RustCodeViewer />}
        </main>
      </div>

      {/* Floating Toolbar (Minimized / Transparent Overlay) */}
      <FloatingToolbar
        isVisible={showFloatingDock}
        onClose={() => setShowFloatingDock(false)}
        isPlaying={isPlaying}
        isPaused={isPaused}
        onTogglePlay={handleTogglePlay}
        onStop={handleStop}
        onPrev={handlePrevSentence}
        onNext={handleNextSentence}
        rateWpm={playbackSettings.rateWpm}
        onRateChange={(wpm) => setPlaybackSettings((prev) => ({ ...prev, rateWpm: wpm }))}
        voices={voices}
        selectedVoice={selectedVoice}
        onSelectVoice={(v) => setSelectedVoice(v)}
        isRecordingStt={isRecordingStt}
        onToggleStt={handleToggleDockStt}
        sttInterimText={sttInterimText}
        sttStatusNotification={sttStatusNotification}
        onSimulateStt={handleSimulateStt}
        sttMicVolume={sttMicVolume}
      />

      {/* Audio Export Modal (WAV, SRT, LRC) */}
      <AudioExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        documentTitle={activeDocument.title}
        documentAuthor={activeDocument.author || 'VoxA11y'}
        textContent={activeDocument.content}
        rateWpm={playbackSettings.rateWpm}
      />

      {/* Voice Commands Modal (Speech Recognition) */}
      <VoiceCommandsModal
        isOpen={showVoiceCommands}
        onClose={() => setShowVoiceCommands(false)}
        onExecuteCommand={handleVoiceCommand}
      />
    </div>
  );
}
