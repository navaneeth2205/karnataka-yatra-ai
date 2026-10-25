import React, { useState } from 'react';
import { Navigation, Info, Map, ListOrdered } from 'lucide-react';
import { RouteSummary } from '../types/travel';
import { KarnatakaRouteMap } from './KarnatakaRouteMap';

interface Props {
  routeSummary: RouteSummary;
}

export const RouteMapPlaceholder: React.FC<Props> = ({ routeSummary }) => {
  const [activeTab, setActiveTab] = useState<'map' | 'timeline'>('map');

  const { stops, total_distance_km, primary_circuit, transit_mode, regional_travel_note } = routeSummary;

  const formatCircuitName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-stone-900">Regional Route & Map</h3>
            <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
              {formatCircuitName(primary_circuit)}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Total Leg: ~{total_distance_km.toLocaleString()} km roundtrip | Mode: {transit_mode.replace('_', ' ')}
          </p>
        </div>

        <div className="no-print flex items-center gap-1.5 self-start sm:self-auto bg-stone-200/60 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('map')}
            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'map' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-amber-600" />
            <span>Interactive Map</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'timeline' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Stops Timeline</span>
          </button>
        </div>
      </div>

      {activeTab === 'map' ? (
        <div className="p-4 sm:p-5 space-y-4">
          <KarnatakaRouteMap
            stops={stops}
            totalDistanceKm={total_distance_km}
            circuitName={primary_circuit}
          />

          {/* Regional Transit Advice Box */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2.5 min-w-0">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed break-words min-w-0">
              <span className="font-bold block mb-0.5">Regional Transit Note:</span>
              <span className="break-words">{regional_travel_note}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 min-w-0">
          {/* Stops Timeline */}
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-500 before:via-red-500 before:to-stone-400 min-w-0">
            {stops.map((stop, index) => {
              const isOrigin = index === 0;
              return (
                <div key={`${stop.name}-${index}`} className="relative group min-w-0">
                  {/* Pin Dot */}
                  <div
                    className={`absolute -left-[19px] sm:-left-[23px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center shrink-0 ${
                      isOrigin ? 'bg-amber-600 ring-2 ring-amber-200' : 'bg-red-600 ring-2 ring-red-200'
                    }`}
                  />

                  <div className="bg-stone-50 hover:bg-amber-50/40 p-3.5 rounded-xl border border-stone-200/80 transition-colors min-w-0">
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-sm text-stone-900 truncate">{stop.name}</span>
                        {isOrigin && (
                          <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-medium shrink-0">
                            Origin / Base
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-stone-500 bg-white px-2 py-0.5 rounded-md border border-stone-200 shrink-0">
                        {isOrigin ? 'Day 1 Start' : `Day ${stop.day_numbers.join(', ')}`}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-500 min-w-0">
                      <span>Region: <span className="text-stone-700 font-medium capitalize">{stop.region.replace('_', ' ')}</span></span>
                      <span>•</span>
                      <span>Coords: {stop.latitude.toFixed(2)}° N, {stop.longitude.toFixed(2)}° E</span>
                      {stop.is_fallback_coordinate && (
                        <span className="text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded text-[10px] shrink-0">
                          Curated Matrix
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Regional Transit Advice Box */}
          <div className="mt-6 p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-3 min-w-0">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed break-words min-w-0">
              <span className="font-bold block mb-0.5">Karnataka Regional Transit Note:</span>
              <span className="break-words">{regional_travel_note}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
