import React from 'react';
import { Sun, Sunset, MapPin, Lightbulb, Utensils, Clock, Camera } from 'lucide-react';
import { DayItinerary, ActivitySlot } from '../types/travel';

interface Props {
  day: DayItinerary;
}

const ActivitySlotItem: React.FC<{
  slot: ActivitySlot;
  period: 'Morning' | 'Afternoon' | 'Evening';
  icon: React.ReactNode;
}> = ({ slot, period, icon }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3.5 p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 hover:border-amber-300 hover:bg-stone-50 transition-all min-w-0">
      <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:w-28 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-lg border border-amber-200/50 shrink-0">
          {icon}
          <span>{period}</span>
        </div>
        <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
          <Clock className="w-3 h-3 text-stone-400 shrink-0" />
          <span>{slot.time}</span>
        </span>
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
          <h5 className="text-sm font-bold text-stone-900 tracking-tight break-words min-w-0">{slot.title}</h5>
          {slot.estimated_entry_inr > 0 ? (
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
              Entry: ~₹{slot.estimated_entry_inr}/person
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-stone-600 bg-white px-2 py-0.5 rounded-full border border-stone-200 shrink-0">
              Free Entry
            </span>
          )}
        </div>
        <p className="text-xs text-stone-600 leading-relaxed break-words">{slot.description}</p>
        <div className="pt-1 flex items-center gap-1.5 text-[11px] text-stone-500 font-medium min-w-0">
          <MapPin className="w-3.5 h-3.5 text-amber-600/70 shrink-0" />
          <span className="break-words">Location: {slot.location_name}</span>
        </div>
      </div>
    </div>
  );
};

export const DayItineraryCard: React.FC<Props> = ({ day }) => {
  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden hover:shadow-md transition-shadow min-w-0">
      {/* Day Header Banner */}
      <div className="p-5 sm:p-6 border-b border-stone-100 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="bg-amber-500 text-stone-950 text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wide shrink-0">
              Day {day.day_number}
            </span>
            <span className="text-amber-300 font-kannada text-sm font-semibold break-words">
              {day.destination_kannada}
            </span>
          </div>
          <h4 className="text-base font-bold text-white tracking-tight break-words">{day.title}</h4>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">Estimated Day Outlay</span>
          <span className="text-sm font-black text-amber-400">~₹{day.day_budget_estimate.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Slots Body */}
      <div className="p-5 sm:p-6 space-y-3.5 min-w-0">
        <ActivitySlotItem
          slot={day.morning_activity}
          period="Morning"
          icon={<Sun className="w-3.5 h-3.5 text-amber-600" />}
        />

        <ActivitySlotItem
          slot={day.afternoon_activity}
          period="Afternoon"
          icon={<Camera className="w-3.5 h-3.5 text-amber-600" />}
        />

        <ActivitySlotItem
          slot={day.evening_activity}
          period="Evening"
          icon={<Sunset className="w-3.5 h-3.5 text-red-600" />}
        />

        {/* Local Cuisine & Food Recommendations */}
        {day.cuisine_recommendations.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 mt-4 space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wider break-words">
                Must-Try Local Flavors in {day.destination_name}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {day.cuisine_recommendations.map((food, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold bg-white text-amber-900 px-3 py-1 rounded-xl border border-amber-200/80 shadow-2xs break-words"
                >
                  {food}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Local Travel Tip */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-2.5 text-xs text-stone-600 min-w-0">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed break-words min-w-0">
            <span className="font-bold text-stone-900 mr-1.5">Karnataka Travel Tip:</span>
            <span>{day.travel_tip}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
