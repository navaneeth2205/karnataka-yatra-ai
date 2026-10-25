import React, { useState } from 'react';
import { BookOpen, Check, MessageSquare } from 'lucide-react';
import { KannadaPhrase } from '../types/travel';

interface Props {
  phrases: KannadaPhrase[];
}

export const KannadaPhrasesWidget: React.FC<Props> = ({ phrases }) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-base font-bold text-stone-900">Essential Kannada Travel Phrasebook</h4>
            <p className="text-xs text-stone-500">Connect with locals, drivers, and shopkeepers across Karnataka</p>
          </div>
        </div>
        <span className="text-xs bg-red-50 text-red-700 font-kannada font-bold px-2 py-0.5 rounded border border-red-200">
          ಕನ್ನಡ
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {phrases.map((phrase, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-stone-50 hover:bg-amber-50/40 border border-stone-200/70 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-kannada text-base font-bold text-stone-900 leading-snug">
                  {phrase.phrase}
                </span>
                <button
                  onClick={() => copyToClipboard(phrase.phrase, idx)}
                  title="Copy phrase"
                  className="text-stone-400 hover:text-stone-700 p-1 rounded transition-colors"
                >
                  {copiedIdx === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <p className="text-xs font-semibold text-amber-800 mt-0.5">
                Say: <span className="font-normal italic">"{phrase.pronunciation}"</span>
              </p>
              <p className="text-xs font-medium text-stone-700 mt-1">
                Meaning: {phrase.meaning}
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-stone-200/60 text-[11px] text-stone-500">
              💡 {phrase.context}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
