import React, { useMemo } from 'react';
import { Bookmark, BookmarkCheck, ArrowRight, CornerDownRight } from 'lucide-react';
import { ReadingBookmark, VisualSettings } from '../types/tts';

interface ReaderWorkspaceProps {
  content: string;
  currentSentenceIdx: number;
  currentWordIdx: number;
  isPlaying: boolean;
  visualSettings: VisualSettings;
  onSentenceClick: (sentenceIdx: number) => void;
  bookmarks: ReadingBookmark[];
  onToggleBookmark: (sentenceIdx: number) => void;
}

export const ReaderWorkspace: React.FC<ReaderWorkspaceProps> = ({
  content,
  currentSentenceIdx,
  currentWordIdx,
  isPlaying,
  visualSettings,
  onSentenceClick,
  bookmarks,
  onToggleBookmark,
}) => {
  // Parse paragraphs and sentences
  const paragraphs = useMemo(() => {
    return content.split(/\n\s*\n/).map((paraStr) => {
      // split into sentences keeping punctuation
      const sentenceRegex = /[^.!?]+[.!?]+|\S+$/g;
      const matches = paraStr.match(sentenceRegex) || [paraStr];
      return matches.map((s) => s.trim()).filter(Boolean);
    });
  }, [content]);

  // Flatten sentences to compute global indices
  const flatSentences = useMemo(() => {
    const list: { text: string; paraIdx: number; sentenceInParaIdx: number; globalIdx: number }[] = [];
    let count = 0;
    paragraphs.forEach((para, pIdx) => {
      para.forEach((sent, sIdx) => {
        list.push({
          text: sent,
          paraIdx: pIdx,
          sentenceInParaIdx: sIdx,
          globalIdx: count,
        });
        count++;
      });
    });
    return list;
  }, [paragraphs]);

  // Determine container styling based on theme
  const themeStyles = useMemo(() => {
    switch (visualSettings.theme) {
      case 'dyslexia':
        return {
          bg: 'bg-[#FAF6EE]',
          text: 'text-[#1A2B4C]',
          cardBg: 'bg-[#F4EEDB] border-[#E8DEC7]',
          fontFamily: 'font-sans',
        };
      case 'high-contrast-yellow':
        return {
          bg: 'bg-black',
          text: 'text-[#FFE600]',
          cardBg: 'bg-neutral-900 border-yellow-500/50',
          fontFamily: 'font-mono',
        };
      case 'high-contrast-cyan':
        return {
          bg: 'bg-black',
          text: 'text-[#00F0FF]',
          cardBg: 'bg-neutral-900 border-cyan-500/50',
          fontFamily: 'font-mono',
        };
      case 'slate-dark':
        return {
          bg: 'bg-slate-900',
          text: 'text-slate-100',
          cardBg: 'bg-slate-800/80 border-slate-700',
          fontFamily: 'font-sans',
        };
      case 'clean-light':
      default:
        return {
          bg: 'bg-white',
          text: 'text-slate-900',
          cardBg: 'bg-slate-50 border-slate-200',
          fontFamily: 'font-sans',
        };
    }
  }, [visualSettings.theme]);

  // Dynamic highlight style classes for words
  const getWordHighlightStyle = (isCurrentWord: boolean) => {
    if (!isCurrentWord || !isPlaying) return {};

    const style: React.CSSProperties = {};

    if (visualSettings.highlightStyle === 'background') {
      style.backgroundColor = visualSettings.highlightColor;
      style.opacity = 1;
      style.borderRadius = '3px';
      style.padding = '0 3px';
      style.color = visualSettings.theme === 'high-contrast-yellow' ? '#000000' : '#FFFFFF';
    } else if (visualSettings.highlightStyle === 'underline-single') {
      style.textDecoration = 'underline';
      style.textDecorationColor = visualSettings.highlightColor;
      style.textDecorationThickness = `${visualSettings.borderWidth}px`;
    } else if (visualSettings.highlightStyle === 'underline-double') {
      style.textDecoration = 'underline double';
      style.textDecorationColor = visualSettings.highlightColor;
      style.textDecorationThickness = `${visualSettings.borderWidth}px`;
    } else if (visualSettings.highlightStyle === 'underline-wavy') {
      style.textDecoration = 'underline wavy';
      style.textDecorationColor = visualSettings.highlightColor;
      style.textDecorationThickness = `${visualSettings.borderWidth}px`;
    } else if (visualSettings.highlightStyle === 'bordered') {
      style.outline = `${visualSettings.borderWidth}px solid ${visualSettings.highlightColor}`;
      style.outlineOffset = '2px';
      style.borderRadius = '3px';
      style.padding = '0 2px';
    } else if (visualSettings.highlightStyle === 'bold-italic') {
      style.fontWeight = 'bold';
      style.fontStyle = 'italic';
      style.color = visualSettings.highlightColor;
    }

    return style;
  };

  const nextSentenceText = useMemo(() => {
    if (currentSentenceIdx + 1 < flatSentences.length) {
      return flatSentences[currentSentenceIdx + 1].text;
    }
    return null;
  }, [currentSentenceIdx, flatSentences]);

  return (
    <div
      className={`relative w-full rounded-xl p-6 sm:p-8 transition-colors border shadow-xs ${themeStyles.bg} ${themeStyles.text} ${themeStyles.cardBg}`}
      style={{
        fontSize: `${visualSettings.fontSize}px`,
        lineHeight: visualSettings.lineSpacing,
        letterSpacing: `${visualSettings.letterSpacing}em`,
      }}
    >
      {/* Next sentence preview bar if enabled */}
      {visualSettings.nextSentencePreview && nextSentenceText && isPlaying && (
        <div className="mb-6 px-4 py-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-medium flex items-center gap-2">
          <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
          <span className="opacity-70 whitespace-nowrap">Volgende zin:</span>
          <span className="italic truncate">{nextSentenceText}</span>
        </div>
      )}

      {/* Paragraphs and sentences rendering */}
      <div className="space-y-6">
        {paragraphs.map((paraSentences, pIdx) => (
          <p key={pIdx} className="leading-relaxed">
            {paraSentences.map((sentText) => {
              const item = flatSentences.find(
                (f) => f.paraIdx === pIdx && f.text === sentText
              );
              if (!item) return null;
              const globalIdx = item.globalIdx;

              const isCurrentSentence = globalIdx === currentSentenceIdx;
              const isPastSentence = globalIdx < currentSentenceIdx;
              const isBookmarked = bookmarks.some((b) => b.sentenceIndex === globalIdx);

              // Split sentence into words
              const words = sentText.split(/\s+/).filter(Boolean);

              // Sentence highlight styling
              let sentenceWrapperClass = 'inline cursor-pointer transition-colors rounded px-1 py-0.5 relative group ';
              if (isCurrentSentence && visualSettings.sentenceHighlight && isPlaying) {
                sentenceWrapperClass += 'bg-indigo-500/15 ';
              }
              if (visualSettings.fadeOutReadText && isPastSentence && isPlaying) {
                sentenceWrapperClass += 'opacity-40 ';
              }

              return (
                <span
                  key={globalIdx}
                  onClick={() => onSentenceClick(globalIdx)}
                  className={sentenceWrapperClass}
                  title="Klik om vanaf deze zin voor te lezen"
                >
                  {/* Bookmark tag */}
                  {isBookmarked && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(globalIdx);
                      }}
                      className="inline-block mr-1 align-middle text-amber-500 hover:text-amber-600"
                      title="Bladwijzer (klik om te verwijderen)"
                    >
                      <BookmarkCheck className="w-4 h-4 inline" />
                    </span>
                  )}

                  {/* Render individual words with boundary tracking */}
                  {words.map((word, wIdx) => {
                    const isCurrentWord = isCurrentSentence && wIdx === currentWordIdx;
                    return (
                      <React.Fragment key={wIdx}>
                        <span
                          style={getWordHighlightStyle(isCurrentWord)}
                          className={`transition-all duration-75 ${
                            isCurrentWord && isPlaying
                              ? 'scale-[1.03] inline-block font-semibold shadow-xs'
                              : ''
                          }`}
                        >
                          {word}
                        </span>
                        {' '}
                      </React.Fragment>
                    );
                  })}
                  {' '}
                </span>
              );
            })}
          </p>
        ))}
      </div>

      {/* Footer controls inside document viewport */}
      <div className="mt-8 pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs opacity-60">
        <div className="flex items-center gap-4">
          <span>Zin: {currentSentenceIdx + 1} van {flatSentences.length}</span>
          <span>·</span>
          <span>Woord in zin: {currentWordIdx + 1}</span>
        </div>
        <button
          onClick={() => onToggleBookmark(currentSentenceIdx)}
          className="flex items-center gap-1.5 hover:opacity-100 transition-opacity"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Zet bladwijzer op huidige zin</span>
        </button>
      </div>
    </div>
  );
};
