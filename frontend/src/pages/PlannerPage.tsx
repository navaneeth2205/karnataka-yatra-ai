import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  IndianRupee,
  Car,
  Sparkles,
  AlertTriangle,
  Loader2,
  Users,
  Plus,
  Minus,
  CheckCircle2,
  Compass,
  ArrowRight,
  Shield,
  Hotel,
} from 'lucide-react';
import {
  TripPlanRequest,
  SupportedInterest,
  SupportedExperience,
  SupportedTransport,
  SupportedLanguage,
  SupportedSeason,
  TripValidationResult,
  WeatherInfo,
} from '../types/travel';
import {
  INTERESTS_DATA,
  POPULAR_CITIES,
  EXPERIENCE_TYPES,
  TRANSPORT_MODES,
  LANGUAGES,
} from '../data/karnatakaConstants';
import { planTrip, validateTrip, fetchLiveWeather } from '../services/api';

const PARTY_PRESETS = [
  { label: 'Solo', count: 1, desc: '1 Room (Single)' },
  { label: 'Couple', count: 2, desc: '1 Room (Double)' },
  { label: 'Family', count: 3, desc: '1-2 Rooms' },
  { label: 'Group of 4', count: 4, desc: '2 Rooms' },
  { label: 'Large Group', count: 6, desc: '3 Rooms • SUV' },
];

const getInterestEmoji = (iconName: string) => {
  switch (iconName) {
    case 'Landmark': return '🏛️';
    case 'Trees': return '🌲';
    case 'Waves': return '🌊';
    case 'Compass': return '🐅';
    case 'Utensils': return '🍛';
    case 'Mountain': return '⛰️';
    case 'Sparkles': return '🛕';
    default: return '✨';
  }
};

export const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const prefill = (location.state as any)?.prefill as TripPlanRequest | undefined;

  const [startingCity, setStartingCity] = useState(prefill?.starting_city || 'Bengaluru');
  const [durationDays, setDurationDays] = useState<number>(prefill?.duration_days || 3);
  const [travelersCount, setTravelersCount] = useState<number>(prefill?.travelers_count || 2);
  const [budgetInr, setBudgetInr] = useState<number>(prefill?.total_budget_inr || 24000);
  const [interests, setInterests] = useState<SupportedInterest[]>(
    prefill?.interests || ['heritage', 'nature']
  );
  const [experience, setExperience] = useState<SupportedExperience>(
    prefill?.experience_preference || 'balanced'
  );
  const [transport, setTransport] = useState<SupportedTransport>(
    prefill?.transport_mode || 'cab_rental'
  );
  const [language, setLanguage] = useState<SupportedLanguage>(
    prefill?.preferred_language || 'kannada'
  );

  const [liveWeather, setLiveWeather] = useState<WeatherInfo | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<TripValidationResult | null>(null);

  // Automated real-time weather sensing for starting city
  useEffect(() => {
    if (!startingCity.trim()) return;
    let isMounted = true;
    setIsLoadingWeather(true);
    const timer = setTimeout(async () => {
      try {
        const data = await fetchLiveWeather(startingCity);
        if (isMounted) {
          setLiveWeather(data);
        }
      } catch (err) {
        console.warn('Weather fetch warning:', err);
      } finally {
        if (isMounted) setIsLoadingWeather(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [startingCity]);

  // Live validation whenever parameters change
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const result = await validateTrip({
          starting_city: startingCity,
          duration_days: durationDays,
          total_budget_inr: budgetInr,
          travelers_count: travelersCount,
          travel_season: (liveWeather?.season as SupportedSeason) || 'winter',
          interests,
          experience_preference: experience,
          transport_mode: transport,
          preferred_language: language,
        });
        setValidationResult(result);
      } catch {
        // Quietly catch validation preview errors
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [startingCity, durationDays, travelersCount, liveWeather?.season, budgetInr, interests, experience, transport, language]);

  const toggleInterest = (interestId: SupportedInterest) => {
    if (interests.includes(interestId)) {
      if (interests.length > 1) {
        setInterests(interests.filter((i) => i !== interestId));
      }
    } else {
      setInterests([...interests, interestId]);
    }
  };

  const handleTravelerCountChange = (delta: number) => {
    const next = Math.max(1, Math.min(20, travelersCount + delta));
    setTravelersCount(next);
  };

  const setPerPersonBudgetPreset = (amountPerPerson: number) => {
    setBudgetInr(amountPerPerson * travelersCount);
  };

  const perPersonCost = Math.round(budgetInr / Math.max(1, travelersCount));
  const perPersonPerDay = Math.round(perPersonCost / Math.max(1, durationDays));
  const roomsAllocated = Math.ceil(travelersCount / 2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startingCity.trim()) {
      setError('Please provide a starting city in Karnataka.');
      return;
    }
    if (interests.length === 0) {
      setError('Please select at least one travel interest.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: TripPlanRequest = {
      starting_city: startingCity,
      duration_days: durationDays,
      total_budget_inr: budgetInr,
      travelers_count: travelersCount,
      travel_season: (liveWeather?.season as SupportedSeason) || 'winter',
      interests,
      experience_preference: experience,
      transport_mode: transport,
      preferred_language: language,
    };

    try {
      const plan = await planTrip(payload);
      navigate(`/itinerary/${plan.trip_id}`, { state: { trip: plan } });
    } catch (err: any) {
      setError(err.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Editorial Header */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Curated Karnataka Expeditions</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Plan Your Karnataka Journey
        </h1>

        <p className="text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
          Accurate regional price estimation, party-aware room allocation, and culturally resonant day-by-day itineraries.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* =========================================================================
            SECTION 1: STARTING CITY & AUTOMATED LIVE WEATHER SENSING
            ========================================================================= */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <label htmlFor="startingCityInput" className="text-sm font-bold text-stone-900 block">
                Starting Location
              </label>
              <p className="text-xs text-stone-500">Select a major gateway hub or enter any Karnataka town</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setStartingCity(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  startingCity.toLowerCase() === city.toLowerCase()
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <input
            id="startingCityInput"
            type="text"
            value={startingCity}
            onChange={(e) => setStartingCity(e.target.value)}
            placeholder="Or type another gateway (e.g., Hassan, Karwar, Gokarna, Bidar)..."
            required
            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-hidden transition-all bg-stone-50/50 hover:bg-white"
          />

          {/* Automated Real-Time Weather & Climate Sensing Card */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              liveWeather?.is_rainy
                ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                : 'bg-stone-50 border-stone-200 text-stone-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0 ${
                    liveWeather?.is_rainy ? 'bg-blue-100 text-blue-700' : 'bg-amber-100/80 text-amber-800'
                  }`}
                >
                  {isLoadingWeather ? (
                    <Loader2 className="w-5 h-5 animate-spin text-stone-500" />
                  ) : (
                    liveWeather?.weather_icon || '⛅'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 border border-stone-200/80 text-stone-700">
                      Automated Live Climate Sensing
                    </span>
                    {liveWeather?.season && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 capitalize">
                        {liveWeather.season.replace('_', ' ')} Season
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-extrabold text-stone-900 mt-1">
                    {isLoadingWeather ? (
                      <span className="text-stone-500 font-medium">Sensing atmospheric weather in {startingCity}...</span>
                    ) : (
                      <span>
                        {liveWeather?.city || startingCity}: {liveWeather?.temperature_c}°C • {liveWeather?.condition_label}
                        {liveWeather?.rain_probability_pct ? ` • ${liveWeather.rain_probability_pct}% Rain Probability` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {liveWeather && (
                <div className="flex items-center gap-2 shrink-0">
                  {liveWeather.is_rainy ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs">
                      <span>☔ Rain-Adaptive Mode Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-bold shadow-xs">
                      <span>🌤️ Favorable Sightseeing</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {liveWeather?.is_rainy ? (
              <div className="mt-3 pt-2.5 border-t border-blue-200/80 flex items-start gap-2 text-xs text-blue-900">
                <span className="font-bold shrink-0">Adaptive Protection:</span>
                <span>
                  Real-time showers detected. Afternoon slots automatically substituted with sheltered indoor attractions, museums, and covered palaces away from rain.
                </span>
              </div>
            ) : (
              liveWeather?.advisory && (
                <p className="mt-2.5 pt-2 border-t border-stone-200/80 text-xs text-stone-600">
                  {liveWeather.advisory}
                </p>
              )
            )}
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: TRAVELERS COUNT (PARTY SIZE)
            ========================================================================= */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <label className="text-sm font-bold text-stone-900 block">
                  Party Size & Travelers
                </label>
                <p className="text-xs text-stone-500">
                  Accurately calculates room sharing, meal costs, and vehicle sizing
                </p>
              </div>
            </div>

            {/* Stepper Control */}
            <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-2xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleTravelerCountChange(-1)}
                disabled={travelersCount <= 1}
                className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Decrease traveler count"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="font-extrabold text-stone-900 text-base min-w-[3rem] text-center">
                {travelersCount} {travelersCount === 1 ? 'Person' : 'People'}
              </span>

              <button
                type="button"
                onClick={() => handleTravelerCountChange(1)}
                disabled={travelersCount >= 20}
                className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Increase traveler count"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {PARTY_PRESETS.map((p) => {
              const active = travelersCount === p.count;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setTravelersCount(p.count)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    active
                      ? 'border-amber-600 bg-amber-50/70 ring-1 ring-amber-600'
                      : 'border-stone-200 bg-stone-50/40 hover:bg-stone-100/60'
                  }`}
                >
                  <span className="block text-xs font-bold text-stone-900">{p.label}</span>
                  <span className="block text-[11px] text-stone-500 mt-0.5">{p.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Party Intelligence Indicator */}
          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-stone-600">
            <div className="flex items-center gap-1.5 font-semibold text-stone-800">
              <Hotel className="w-3.5 h-3.5 text-amber-700" />
              <span>{roomsAllocated} {roomsAllocated === 1 ? 'Room' : 'Rooms'} ({travelersCount === 1 ? 'Single Occupancy' : 'Double Sharing'})</span>
            </div>
            <span className="text-stone-300">•</span>
            <div className="flex items-center gap-1.5 font-semibold text-stone-800">
              <Car className="w-3.5 h-3.5 text-amber-700" />
              <span>
                {travelersCount <= 4
                  ? 'Sedan / Hatchback (Up to 4 passengers)'
                  : travelersCount <= 7
                  ? 'Innova / 7-Seater SUV'
                  : 'Tempo Traveller (Group Vehicle)'}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: DURATION & BUDGET ALLOCATION
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Duration */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <label htmlFor="durationRangeInput" className="text-sm font-bold text-stone-900 block">
                    Duration
                  </label>
                  <p className="text-xs text-stone-500">Days of exploration</p>
                </div>
              </div>

              <span className="text-base font-extrabold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                {durationDays} {durationDays === 1 ? 'Day' : 'Days'}
              </span>
            </div>

            <input
              id="durationRangeInput"
              type="range"
              min={1}
              max={14}
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-stone-400 font-medium">
              <span>1 Day Day-trip</span>
              <span>Weekend (2-3)</span>
              <span>1 Week</span>
              <span>14 Days Grand Circuit</span>
            </div>
          </div>

          {/* Budget */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div>
                  <label htmlFor="budgetNumberInput" className="text-sm font-bold text-stone-900 block">
                    Total Party Budget
                  </label>
                  <p className="text-xs text-stone-500">In Indian Rupees (INR)</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-extrabold text-emerald-800 block">
                  ₹{budgetInr.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-semibold text-stone-500">
                  ~₹{perPersonCost.toLocaleString('en-IN')}/person
                </span>
              </div>
            </div>

            <input
              id="budgetNumberInput"
              type="number"
              step={1000}
              min={2000}
              max={1000000}
              value={budgetInr}
              onChange={(e) => setBudgetInr(Math.max(1000, Number(e.target.value)))}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-hidden bg-stone-50/50"
            />

            {/* Quick Presets per Person */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider">
                Per-Person Targets:
              </span>
              <div className="flex gap-1.5">
                {[
                  { label: '₹8k', perP: 8000 },
                  { label: '₹15k', perP: 15000 },
                  { label: '₹25k', perP: 25000 },
                  { label: '₹40k', perP: 40000 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setPerPersonBudgetPreset(preset.perP)}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 5: TRAVEL INTERESTS
            ========================================================================= */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <label className="text-sm font-bold text-stone-900 block">
                  Travel Passions & Interests
                </label>
                <p className="text-xs text-stone-500">Select one or more to personalize destination matching</p>
              </div>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
              {interests.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {INTERESTS_DATA.map((item) => {
              const selected = interests.includes(item.id as SupportedInterest);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id as SupportedInterest)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selected
                      ? 'border-amber-600 bg-amber-50/70 ring-1 ring-amber-600 shadow-2xs'
                      : 'border-stone-200 bg-stone-50/40 hover:bg-stone-100/60'
                  }`}
                >
                  <span className="text-xl block mb-1">{getInterestEmoji(item.iconName)}</span>
                  <span className="text-xs font-bold text-stone-900 block">{item.label}</span>
                  <span className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{item.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            SECTION 6: TRAVEL PACE, TRANSIT & LANGUAGE
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Experience Style */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-3">
            <label htmlFor="experiencePreferenceSelect" className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
              Pace & Experience
            </label>
            <select
              id="experiencePreferenceSelect"
              value={experience}
              onChange={(e) => setExperience(e.target.value as SupportedExperience)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold bg-stone-50 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            >
              {EXPERIENCE_TYPES.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.label} — {exp.sub}
                </option>
              ))}
            </select>
          </div>

          {/* Transport Mode */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-3">
            <label htmlFor="transportModeSelect" className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
              Transit Preference
            </label>
            <select
              id="transportModeSelect"
              value={transport}
              onChange={(e) => setTransport(e.target.value as SupportedTransport)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold bg-stone-50 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            >
              {TRANSPORT_MODES.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.label} — {tm.sub}
                </option>
              ))}
            </select>
          </div>

          {/* Language Preference */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-3">
            <label htmlFor="preferredLanguageSelect" className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
              Itinerary Language
            </label>
            <select
              id="preferredLanguageSelect"
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold bg-stone-50 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.nativeName} ({lang.label})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* =========================================================================
            LIVE REAL-TIME VALIDATION INTELLIGENCE
            ========================================================================= */}
        {validationResult && (
          <div className="p-5 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-600" />
                Trip Feasibility Intelligence
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                Target: ₹{perPersonCost.toLocaleString('en-IN')}/person (~₹{perPersonPerDay.toLocaleString('en-IN')}/day)
              </span>
            </div>

            {validationResult.warnings.length > 0 ? (
              <div className="space-y-1.5 text-xs text-amber-900 bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200">
                {validationResult.warnings.map((w, idx) => (
                  <p key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </p>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Budget is sound! Estimated survival minimum for {travelersCount} traveler(s) over {durationDays} days is ₹{validationResult.minimum_recommended_budget.toLocaleString('en-IN')}.
                </span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* =========================================================================
            SUBMIT ACTION
            ========================================================================= */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm shadow-lg shadow-stone-900/10 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Curating Personalized Circuit for {travelersCount} Traveler(s)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Plan My Karnataka Yatra</span>
                <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
