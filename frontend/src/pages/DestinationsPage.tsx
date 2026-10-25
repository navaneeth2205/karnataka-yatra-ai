import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Compass,
  Sparkles,
  Utensils,
  Loader2,
} from 'lucide-react';
import { Destination } from '../types/travel';
import { fetchDestinations } from '../services/api';

export const DestinationsPage: React.FC = () => {
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');

  const regions = [
    { id: '', label: 'All Regions' },
    { id: 'heritage_circuit', label: 'Heritage Circuit' },
    { id: 'western_ghats', label: 'Western Ghats' },
    { id: 'coastal', label: 'Coastal Karavali' },
    { id: 'southern_karnataka', label: 'Southern Karnataka' },
  ];

  const interests = [
    { id: '', label: 'All Interests' },
    { id: 'heritage', label: 'Heritage' },
    { id: 'nature', label: 'Nature' },
    { id: 'beaches', label: 'Beaches' },
    { id: 'wildlife', label: 'Wildlife' },
    { id: 'food', label: 'Food & Cuisine' },
    { id: 'spirituality', label: 'Spirituality' },
    { id: 'adventure', label: 'Adventure' },
  ];

  useEffect(() => {
    loadDestinations();
  }, [selectedRegion, selectedInterest]);

  const loadDestinations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDestinations({
        region: selectedRegion || undefined,
        interest: selectedInterest || undefined,
        search: search || undefined,
      });
      setDestinations(data.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load destinations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDestinations();
  };

  const planForDestination = (dest: Destination) => {
    navigate('/plan', {
      state: {
        prefill: {
          starting_city: 'Bengaluru',
          duration_days: dest.ideal_duration_days || 2,
          total_budget_inr: (dest.estimated_stay_cost_per_night + dest.estimated_daily_food_cost) * 2 + 5000,
          interests: dest.interests,
          experience_preference: 'balanced',
          transport_mode: 'cab_rental',
          preferred_language: 'kannada',
        },
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5 text-amber-600" />
          <span>Curated Karnataka Destinations</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Destinations Across Karnataka
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Handpicked regional hubs with realistic sample data, authentic cuisine, and activity timings.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by destination name, temple, waterfalls, food..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Region & Interest Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-stone-100">
          {/* Region Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">Region:</span>
            {regions.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedRegion === r.id
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Interest Select */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Interest:</span>
            <select
              value={selectedInterest}
              onChange={(e) => setSelectedInterest(e.target.value)}
              className="text-xs rounded-lg border border-stone-300 py-1 px-2.5 bg-white text-stone-700"
            >
              {interests.map((i) => (
                <option key={i.id} value={i.id}>{i.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-2" />
          <p className="text-xs text-stone-500">Loading Karnataka destinations...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 text-center">
          {error}
        </div>
      ) : destinations.length === 0 ? (
        <div className="py-16 text-center text-stone-500 text-sm">
          No destinations found matching your criteria. Try resetting filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-extrabold text-stone-900 leading-tight">
                      {dest.name}
                    </h3>
                    <p className="text-xs text-amber-700 font-kannada mt-0.5">
                      {dest.name_kannada}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md capitalize">
                    {dest.region.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {dest.short_description}
                </p>

                {/* Benchmark Rates */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-[11px] text-stone-600">
                  <div className="bg-stone-50 p-2 rounded-lg">
                    <span className="text-stone-400 block text-[10px]">Est. Stay / Night</span>
                    <span className="font-bold text-stone-900">~₹{dest.estimated_stay_cost_per_night}</span>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-lg">
                    <span className="text-stone-400 block text-[10px]">Ideal Duration</span>
                    <span className="font-bold text-stone-900">{dest.ideal_duration_days} Days</span>
                  </div>
                </div>

                {/* Highlight Foods */}
                {dest.highlight_foods.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-amber-600" /> Famous Cuisine
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {dest.highlight_foods.slice(0, 3).map((food, i) => (
                        <span key={i} className="text-[11px] bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => planForDestination(dest)}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-stone-900 hover:bg-amber-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Plan Trip Here</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
