import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles } from 'lucide-react';
import { fetchHealth } from '../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [backendReady, setBackendReady] = useState<boolean | null>(null);

  useEffect(() => {
    fetchHealth()
      .then(() => setBackendReady(true))
      .catch(() => setBackendReady(false));
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-stone-900 group-hover:text-amber-700 transition-colors">
                  Karnataka Yatra <span className="text-amber-600">AI</span>
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-amber-300">
                  ಕರ್ನಾಟಕ
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">Smart Travel Planner for Karunadu</p>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Discover
            </Link>
            <Link
              to="/destinations"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/destinations') ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Destinations
            </Link>
            <Link
              to="/plan"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/plan') ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Plan Trip
            </Link>
          </nav>

          {/* Right Status / Action */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500 px-2 py-1 rounded-full bg-stone-100 border border-stone-200">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendReady === true ? 'bg-emerald-500 animate-pulse' : backendReady === false ? 'bg-red-500' : 'bg-amber-400'
                }`}
              />
              <span>{backendReady === true ? 'FastAPI Connected' : backendReady === false ? 'Backend Offline' : 'Connecting...'}</span>
            </div>

            <Link
              to="/plan"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Itinerary</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
