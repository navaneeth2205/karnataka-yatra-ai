import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Compass,
  Calendar,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Share2,
  Users,
  Hotel,
  CloudSun,
} from 'lucide-react';
import { TripPlanResponse } from '../types/travel';
import { DayItineraryCard } from '../components/DayItineraryCard';
import { BudgetBreakdownCard } from '../components/BudgetBreakdownCard';
import { RouteMapPlaceholder } from '../components/RouteMapPlaceholder';
import { ItineraryRevisionPanel } from '../components/ItineraryRevisionPanel';
import { KannadaPhrasesWidget } from '../components/KannadaPhrasesWidget';
import { ShareExportModal } from '../components/ShareExportModal';
import { getWhatsAppShareUrl } from '../utils/shareUtils';

export const ResultsPage: React.FC = () => {
  const location = useLocation();

  const [trip, setTrip] = useState<TripPlanResponse | null>(
    (location.state as any)?.trip || null
  );
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!trip) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">No Itinerary Loaded</h2>
        <p className="text-xs text-stone-500">
          Please design a new trip or select one of our curated Karnataka circuits.
        </p>
        <Link
          to="/plan"
          className="inline-flex items-center gap-2 bg-stone-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Launch Trip Planner</span>
        </Link>
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTripRevised = (revisedTrip: TripPlanResponse) => {
    setTrip(revisedTrip);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsAppUrl = getWhatsAppShareUrl(trip);
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const travelers = trip.travelers_count || trip.budget.travelers_count || 1;
  const roomsAllocated = trip.budget.rooms_allocated || Math.ceil(travelers / 2);
  const perPersonCost = trip.budget.per_person_cost || Math.round(trip.budget.estimated_total_cost / travelers);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* =========================================================================
          PRINT-ONLY OFFICIAL TRAVEL GUIDE HEADER (Visible only in print & PDF export)
          ========================================================================= */}
      <div className="print-only mb-6 border-b-2 border-stone-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-kannada font-bold text-red-700 text-lg">ಕರ್ನಾಟಕ ಯಾತ್ರೆ AI</span>
              <span className="text-stone-400">•</span>
              <span className="text-xs font-extrabold tracking-wider uppercase text-stone-900">
                Official Travel Itinerary & Tour Plan
              </span>
            </div>
            <h1 className="text-xl font-black text-stone-900">{trip.title}</h1>
          </div>
          <div className="text-right text-xs text-stone-600">
            <div className="font-mono font-bold text-stone-900">Trip Ref: #{trip.trip_id}</div>
            <div>Issued: {currentDate}</div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-stone-200 grid grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-stone-500 block text-[10px] uppercase font-semibold">Origin Hub</span>
            <span className="font-bold text-stone-900">{trip.starting_city}</span>
          </div>
          <div>
            <span className="text-stone-500 block text-[10px] uppercase font-semibold">Duration & Party</span>
            <span className="font-bold text-stone-900">
              {trip.duration_days} Days • {travelers} {travelers === 1 ? 'Traveler' : 'Travelers'} ({roomsAllocated}R)
            </span>
          </div>
          <div>
            <span className="text-stone-500 block text-[10px] uppercase font-semibold">Style / Language</span>
            <span className="font-bold text-stone-900 capitalize">{trip.experience_preference} ({trip.preferred_language})</span>
          </div>
          <div>
            <span className="text-stone-500 block text-[10px] uppercase font-semibold">Estimated Cost</span>
            <span className="font-bold text-emerald-800">
              ₹{trip.budget.estimated_total_cost.toLocaleString('en-IN')} (₹{perPersonCost.toLocaleString('en-IN')}/person)
            </span>
          </div>
        </div>
      </div>

      {/* Screen Top Banner & Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4 min-w-0">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 min-w-0">
          <div className="space-y-3 max-w-3xl min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-md border border-amber-300 shrink-0">
                #{trip.trip_id}
              </span>
              <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-md shrink-0">
                Starting: {trip.starting_city}
              </span>
              <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-md shrink-0">
                {trip.duration_days} Days
              </span>

              {/* Party Size Pill */}
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-md shrink-0">
                <Users className="w-3 h-3 text-amber-700 shrink-0" />
                <span>{travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}</span>
                <span className="text-amber-400">•</span>
                <Hotel className="w-3 h-3 text-amber-700 shrink-0" />
                <span>{roomsAllocated} Room{roomsAllocated > 1 ? 's' : ''}</span>
              </span>

              {/* Season Pill */}
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-md capitalize shrink-0">
                <CloudSun className="w-3 h-3 text-amber-600 shrink-0" />
                <span>{trip.travel_season || 'winter'}</span>
              </span>

              <span className="text-xs font-bold uppercase bg-stone-900 text-stone-100 px-2.5 py-0.5 rounded-md shrink-0">
                {trip.experience_preference}
              </span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
                ₹{perPersonCost.toLocaleString('en-IN')}/person
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight break-words">
              {trip.title}
            </h1>

            <p className="text-sm text-stone-600 leading-relaxed break-words">
              {trip.summary}
            </p>

            {/* AI Model Seasonal Climate Prediction Insight */}
            {trip.seasonal_insight && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-950 min-w-0">
                <CloudSun className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed break-words min-w-0">
                  <span className="font-bold text-amber-900 mr-1.5">AI Climate Prediction:</span>
                  <span>{trip.seasonal_insight}</span>
                </div>
              </div>
            )}

            {/* Live Weather & Rain-Adaptive Status Banner */}
            {trip.weather_info && (
              <div
                className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs min-w-0 ${
                  trip.is_rain_adaptive || trip.weather_info.is_rainy
                    ? 'bg-blue-50 border border-blue-200 text-blue-950'
                    : 'bg-stone-50 border border-stone-200 text-stone-800'
                }`}
              >
                <span className="text-lg shrink-0 mt-0.5">
                  {trip.weather_info.weather_icon || (trip.is_rain_adaptive ? '🌧️' : '⛅')}
                </span>
                <div className="leading-relaxed break-words min-w-0">
                  <span className="font-bold mr-1.5">
                    {trip.is_rain_adaptive ? '☔ Rain-Adaptive Circuit Active:' : '🌤️ Sensed Atmospheric Weather:'}
                  </span>
                  <span>
                    {trip.weather_info.city} ({trip.weather_info.temperature_c}°C, {trip.weather_info.condition_label}).{' '}
                    {trip.is_rain_adaptive
                      ? 'Showers detected via external Open-Meteo sensing. Afternoon outdoor activities have been automatically replaced with covered royal palaces, art galleries, and cultural sanctuaries.'
                      : trip.weather_info.advisory}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="no-print flex flex-wrap items-center gap-2 self-start shrink-0">
            {/* Direct WhatsApp Share Button */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Share via WhatsApp"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs hover:scale-102"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {/* Export & Share Modal Trigger */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              title="Export & Share options (WhatsApp, PDF, Markdown, JSON)"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Export & Share</span>
            </button>

            {/* Native Print / PDF Button */}
            <button
              onClick={handlePrint}
              title="Print or Save as PDF"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-amber-600" />
              <span>PDF / Print</span>
            </button>

            <button
              onClick={handleCopyLink}
              title="Copy link to clipboard"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Link'}</span>
            </button>

            <Link
              to="/plan"
              state={{
                prefill: {
                  starting_city: trip.starting_city,
                  duration_days: trip.duration_days,
                  travelers_count: travelers,
                  travel_season: trip.travel_season,
                  total_budget_inr: trip.budget.requested_budget,
                  interests: trip.interests || ['heritage', 'nature'],
                  experience_preference: trip.experience_preference,
                  transport_mode: trip.transport_mode,
                  preferred_language: trip.preferred_language,
                },
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replan</span>
            </Link>
          </div>
        </div>

        {/* Validation Warnings Alert Bar (if any) */}
        {trip.validation_warnings.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Important Travel Advisories:</span>
            </div>
            {trip.validation_warnings.map((w, idx) => (
              <p key={idx} className="pl-6">{w}</p>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Left Itinerary Timeline (2 cols), Right Analytics & Route (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-0">
        {/* Left Column: Day-wise Cards */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              Day-by-Day Schedule
            </h2>
            <span className="text-xs text-stone-500 font-medium">
              {trip.days.length} Days Planned • {travelers} Traveler{travelers > 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-6 min-w-0">
            {trip.days.map((day) => (
              <DayItineraryCard key={day.day_number} day={day} />
            ))}
          </div>

          {/* Revision Panel (Hidden during print) */}
          <div className="revision-panel-container no-print min-w-0">
            <ItineraryRevisionPanel
              currentTrip={trip}
              onTripRevised={handleTripRevised}
            />
          </div>
        </div>

        {/* Right Column: Budget Breakdown, Route Map, & Kannada Phrases */}
        <div className="space-y-6 min-w-0">
          <BudgetBreakdownCard budget={trip.budget} />

          <RouteMapPlaceholder routeSummary={trip.route_summary} />

          <KannadaPhrasesWidget phrases={trip.kannada_travel_phrases} />
        </div>
      </div>

      {/* =========================================================================
          PRINT-ONLY OFFICIAL FOOTER & DISCLAIMER
          ========================================================================= */}
      <div className="print-only mt-8 pt-4 border-t border-stone-300 text-[10px] text-stone-500 space-y-1">
        <div className="flex items-center justify-between font-semibold text-stone-700">
          <span>Karnataka Yatra AI • Deterministic & Verified Regional Travel Intelligence</span>
          <span>karnataka-yatra-ai.local</span>
        </div>
        <p>
          Disclaimer: Estimated costs and travel times are calculated programmatically using regional tourism benchmarks for {travelers} traveler(s).
          Actual prices, entry permits, and operational hours may fluctuate seasonally. Always confirm temple dress codes,
          forest department permits (e.g., Bandipur/Nagarhole safaris), and monsoon road advisories prior to travel.
        </p>
      </div>

      {/* Export & Share Modal */}
      <ShareExportModal
        trip={trip}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
