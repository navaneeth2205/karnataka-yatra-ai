import React from 'react';
import { Heart, Compass, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Karnataka Yatra AI</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              AI-driven personalized travel planning for Karnataka. Deterministic budget engineering, regional clustering, and multilingual local intelligence.
            </p>
            <p className="text-xs text-amber-400/90 font-kannada">
              "ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ, ಸಿರಿಗನ್ನಡಂ ಬಾಳ್ಗೆ"
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">Karnataka Circuits</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/plan" className="hover:text-amber-400 transition-colors">Hampi & Badami Heritage</Link></li>
              <li><Link to="/plan" className="hover:text-amber-400 transition-colors">Karavali Coastal Escapade</Link></li>
              <li><Link to="/plan" className="hover:text-amber-400 transition-colors">Western Ghats & Coffee Trails</Link></li>
              <li><Link to="/plan" className="hover:text-amber-400 transition-colors">Mysuru & Kabini Safari</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">Reliability & Ethics</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Deterministic budget calculation (No invented pricing)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Adaption Labs dataset adapter ready</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Multilingual phrasebook and cultural etiquette</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">Hackathon Info</h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-2">
              Built for Karnataka Tourism Hackathon. Python FastAPI backend paired with React, Vite & Tailwind CSS.
            </p>
            <span className="inline-block px-2.5 py-1 text-[11px] rounded bg-stone-800 text-stone-300 border border-stone-700">
              Deterministic Mode Active
            </span>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <p>© 2026 Karnataka Yatra AI. Sample data provided for planning purposes.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Karnataka tourism
          </p>
        </div>
      </div>
    </footer>
  );
};
