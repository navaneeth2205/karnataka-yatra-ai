import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  IndianRupee,
  ShieldCheck,
  ArrowRight,
  Landmark,
} from 'lucide-react';
import { CURATED_PRESETS, CircuitPreset } from '../data/karnatakaConstants';
import { planTrip } from '../services/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLaunchPreset = async (preset: CircuitPreset) => {
    try {
      const plan = await planTrip(preset.sampleRequest);
      navigate(`/itinerary/${plan.trip_id}`, { state: { trip: plan } });
    } catch {
      // Fallback navigate to planner pre-filled
      navigate('/plan', { state: { prefill: preset.sampleRequest } });
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-600/15 via-red-600/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Itinerary Intelligence for Karunadu</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Discover the Soul of <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-red-400 bg-clip-text text-transparent">
              Karnataka with Precision AI
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-stone-300 text-sm sm:text-base leading-relaxed">
            Personalized, budget-aware travel planning across Karnataka's ancient Hoysala ruins, misty Western Ghats, and Karavali beaches. With deterministic math and multilingual Kannada intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/plan"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-amber-600/25 transition-all hover:scale-102 active:scale-98 text-sm"
            >
              <Compass className="w-4 h-4" />
              <span>Plan My Karnataka Yatra</span>
            </Link>

            <Link
              to="/destinations"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold px-6 py-3.5 rounded-xl border border-stone-700 transition-all text-sm"
            >
              <span>Explore Destinations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="block text-2xl font-black text-amber-400">12+</span>
              <span className="text-xs text-stone-400">Curated Destinations</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="block text-2xl font-black text-yellow-400">100%</span>
              <span className="text-xs text-stone-400">Deterministic Budgeting</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="block text-2xl font-black text-red-400">6</span>
              <span className="text-xs text-stone-400">Regional Languages</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="block text-2xl font-black text-emerald-400">Zero</span>
              <span className="text-xs text-stone-400">Hallucinated Pricing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Circuit Presets */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
              <Landmark className="w-4 h-4" />
              <span>Handcrafted Karnataka Circuits</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              One-Click Signature Expeditions
            </h2>
          </div>
          <p className="text-xs text-stone-500 max-w-sm">
            Launch instantly with optimized regional clustering and realistic budget estimates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CURATED_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className={`h-36 bg-gradient-to-br ${preset.bannerGradient} p-5 text-white flex flex-col justify-between relative`}>
                  <span className="self-start text-[11px] font-bold bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/30">
                    {preset.badge}
                  </span>
                  <div>
                    <h3 className="font-bold text-base leading-snug drop-shadow-xs">{preset.title}</h3>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {preset.subtitle}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-stone-100">
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                      Key Highlights
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {preset.highlights.map((h, i) => (
                        <span key={i} className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => handleLaunchPreset(preset)}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-stone-900 hover:bg-amber-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-2xs group-hover:scale-101"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Generate Itinerary</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Architectural Highlights */}
      <section className="bg-stone-100 py-16 px-4 sm:px-6 lg:px-8 border-y border-stone-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
              Engineered for Real-World Karnataka Travel
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Unlike generic chatbots that produce impractical travel hops and made-up costs, Karnataka Yatra AI is built with deterministic foundations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">Deterministic Budget Math</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Calculates transparent allocations across lodging, food, transit, entry tickets, and safety reserves. If a trip exceeds your budget, you receive an explicit warning—not a hidden surprise.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">Regional Clustering & Routing</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Groups destinations intelligently by geographic corridors (Coastal Karavali, Western Ghats, Hoysala Heritage) so travelers never waste whole days backtracking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">Adaption Labs Ingestion Ready</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Constructed with an Adapter Pattern that ingests future datasets from Adaption Labs smoothly without assuming hardcoded column names upfront.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
