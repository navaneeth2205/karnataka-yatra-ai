import React, { useState } from 'react';
import { Sliders, Sparkles, Loader2 } from 'lucide-react';
import { TripPlanResponse } from '../types/travel';
import { reviseTrip } from '../services/api';

interface Props {
  currentTrip: TripPlanResponse;
  onTripRevised: (revisedTrip: TripPlanResponse) => void;
}

export const ItineraryRevisionPanel: React.FC<Props> = ({ currentTrip, onTripRevised }) => {
  const [instruction, setInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickPrompts = [
    'Reduce the budget by 20%',
    'Add more heritage & temple visits',
    'Switch transport to KSRTC bus',
    'Make the trip more relaxed & leisure',
    'Add trekking and adventure activities',
  ];

  const handleRevise = async (textToUse?: string) => {
    const text = (textToUse || instruction).trim();
    if (!text) return;

    setIsLoading(true);
    setError(null);

    try {
      const revised = await reviseTrip(currentTrip, text);
      onTripRevised(revised);
      setInstruction('');
    } catch (err: any) {
      setError(err.message || 'Failed to revise itinerary');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-red-500/5 to-stone-100 rounded-2xl border border-amber-200 p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-base font-bold text-stone-900">Revise & Fine-Tune Itinerary</h4>
          <p className="text-xs text-stone-600">
            Request deterministic adjustments to budget, pacing, destinations, or transport
          </p>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="my-4">
        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
          One-Click Quick Adjustments
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleRevise(prompt)}
              className="text-xs font-medium bg-white hover:bg-amber-100/70 text-stone-700 hover:text-amber-900 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-amber-300 transition-all shadow-2xs disabled:opacity-50"
            >
              + {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Instruction Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRevise();
        }}
        className="flex gap-2 mt-4"
      >
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g., 'reduce the budget', 'add more nature spots', 'travel by train'..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400"
        />
        <button
          type="submit"
          disabled={isLoading || !instruction.trim()}
          className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Apply Revision</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};
