import React, { useState, useEffect } from 'react';
import { BookOpen, Check, Copy, Volume2, VolumeX, Sparkles, Gauge } from 'lucide-react';
import { KannadaPhrase } from '../types/travel';
import { playKannadaSpeech } from '../utils/audioUtils';

interface Props {
  phrases: KannadaPhrase[];
}

export const KannadaPhrasesWidget: React.FC<Props> = ({ phrases }) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [isSlowMode, setIsSlowMode] = useState<boolean>(true);
  const [stopFn, setStopFn] = useState<(() => void) | null>(null);

  // Clean up any ongoing speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (stopFn) {
        stopFn();
      }
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    };
  }, [stopFn]);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSpeak = (text: string, idx: number) => {
    // If clicking the currently playing phrase, stop it
    if (playingIdx === idx) {
      if (stopFn) stopFn();
      setPlayingIdx(null);
      setStopFn(null);
      return;
    }

    // Stop any previous speech
    if (stopFn) stopFn();

    const rate = isSlowMode ? 0.78 : 1.0;

    const cancel = playKannadaSpeech(
      text,
      () => setPlayingIdx(idx),
      () => {
        setPlayingIdx(null);
        setStopFn(null);
      },
      rate
    );

    setStopFn(() => cancel);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold shadow-2xs shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-extrabold text-stone-900">
                Essential Kannada Phrasebook
              </h4>
              <span className="text-[10px] bg-red-50 text-red-700 font-kannada font-bold px-2 py-0.5 rounded-full border border-red-200">
                ಕನ್ನಡ ಧ್ವನಿ
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Listen to native pronunciations to converse respectfully across Karnataka
            </p>
          </div>
        </div>

        {/* Speed & Practice Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsSlowMode(!isSlowMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isSlowMode
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
            title="Toggle between slow phonetic learning speed and normal speech speed"
          >
            <Gauge className="w-3.5 h-3.5 text-amber-700" />
            <span>{isSlowMode ? 'Slow (0.8x)' : 'Normal (1.0x)'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Helper Banner */}
      <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="leading-relaxed">
          Tap the <strong className="text-red-700">Listen (🔊)</strong> button on any phrase to hear natural Kannada audio pronunciation powered by Web Speech Synthesis.
        </span>
      </div>

      {/* Phrases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {phrases.map((phrase, idx) => {
          const isPlaying = playingIdx === idx;
          const isCopied = copiedIdx === idx;

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isPlaying
                  ? 'bg-red-50/70 border-red-300 ring-2 ring-red-400/40 shadow-xs'
                  : 'bg-stone-50/70 hover:bg-white border-stone-200/80 hover:shadow-2xs'
              }`}
            >
              <div>
                {/* Phrase Title & Action Bar */}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-kannada text-lg font-bold text-stone-900 leading-snug">
                    {phrase.phrase}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Audio Pronunciation Button */}
                    <button
                      type="button"
                      onClick={() => handleSpeak(phrase.phrase, idx)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-red-600 text-white shadow-xs animate-pulse ring-2 ring-red-400'
                          : 'bg-red-100/80 hover:bg-red-200/90 text-red-800'
                      }`}
                      title={isPlaying ? 'Stop audio' : 'Listen to authentic Kannada pronunciation'}
                    >
                      {isPlaying ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      <span>{isPlaying ? 'Stop' : 'Listen'}</span>
                    </button>

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => copyToClipboard(phrase.phrase, idx)}
                      title="Copy Kannada phrase to clipboard"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Phonetics & Meaning */}
                <p className="text-xs font-bold text-amber-800 mt-1">
                  Say: <span className="font-medium italic font-mono">"{phrase.pronunciation}"</span>
                </p>
                <p className="text-xs text-stone-700 mt-1.5 leading-relaxed">
                  <span className="font-semibold text-stone-900">Meaning:</span> {phrase.meaning}
                </p>
              </div>

              {/* Contextual Usage Tip */}
              <div className="mt-3 pt-2 border-t border-stone-200/70 text-[11px] text-stone-500 flex items-center gap-1.5">
                <span>💡</span>
                <span className="leading-snug">{phrase.context}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
