import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RouteStop } from '../types/travel';
import { Maximize2 } from 'lucide-react';

interface Props {
  stops: RouteStop[];
  totalDistanceKm: number;
  circuitName: string;
}

export const KarnatakaRouteMap: React.FC<Props> = ({ stops, totalDistanceKm, circuitName }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [14.5, 75.8],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap official tiles (100% free, zero API key required)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

      // Zoom control in bottom left
      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    // Clear previous markers & lines
    layerGroup.clearLayers();

    if (stops.length === 0) return;

    const latLngs: L.LatLngTuple[] = [];

    stops.forEach((stop, idx) => {
      const isOrigin = idx === 0;
      const pos: L.LatLngTuple = [stop.latitude, stop.longitude];
      latLngs.push(pos);

      // Custom HTML Pin icon
      const dayLabel = isOrigin ? 'Start' : `D${stop.day_numbers.join(',')}`;
      const bgColor = isOrigin ? '#d97706' : '#dc2626'; // amber-600 vs red-600

      const pinHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
          <div style="
            background: ${bgColor};
            color: white;
            font-size: 11px;
            font-weight: 800;
            padding: 3px 7px;
            border-radius: 9999px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            border: 2px solid white;
            display: flex;
            align-items: center;
            gap: 3px;
            white-space: nowrap;
          ">
            <span>${dayLabel}</span>
          </div>
          <div style="
            width: 8px;
            height: 8px;
            background: ${bgColor};
            transform: rotate(45deg);
            margin-top: -4px;
            border-bottom: 2px solid white;
            border-right: 2px solid white;
          "></div>
          <div style="
            width: 10px;
            height: 4px;
            background: rgba(0,0,0,0.2);
            border-radius: 50%;
            margin-top: 1px;
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: pinHtml,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -38],
      });

      const marker = L.marker(pos, { icon: customIcon });

      // Rich Popup
      const regionClean = stop.region ? stop.region.replace(/_/g, ' ') : 'Hub';
      const fallbackNotice = stop.is_fallback_coordinate
        ? `<div style="margin-top: 4px; font-size: 10px; color: #b45309; background: #fef3c7; padding: 2px 6px; border-radius: 4px;">⚠️ Curated Regional Hub Coordinate</div>`
        : '';

      const popupHtml = `
        <div style="padding: 6px; min-width: 160px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
            <strong style="font-size: 13px; color: #1c1917;">${stop.name}</strong>
            <span style="font-size: 10px; font-weight: 700; background: #f5f5f4; color: #44403c; padding: 1px 6px; border-radius: 4px; text-transform: capitalize;">
              ${regionClean}
            </span>
          </div>
          <div style="font-size: 11px; color: #78716c; margin-top: 2px;">
            ${isOrigin ? 'Trip Origin Hub' : `Scheduled Stop: Day ${stop.day_numbers.join(', ')}`}
          </div>
          <div style="font-size: 10px; color: #a8a29e; margin-top: 4px;">
            ${stop.latitude.toFixed(2)}° N, ${stop.longitude.toFixed(2)}° E
          </div>
          ${fallbackNotice}
        </div>
      `;

      marker.bindPopup(popupHtml);
      layerGroup.addLayer(marker);
    });

    // Draw connecting route polyline
    if (latLngs.length > 1) {
      // Connect back to origin for round trip loop
      const fullLoopLatLngs = [...latLngs, latLngs[0]];

      // Outer glow line
      const glowLine = L.polyline(fullLoopLatLngs, {
        color: '#f8b102',
        weight: 6,
        opacity: 0.4,
      });
      layerGroup.addLayer(glowLine);

      // Core dashed road line
      const mainLine = L.polyline(fullLoopLatLngs, {
        color: '#c91818',
        weight: 3,
        opacity: 0.85,
        dashArray: '8, 8',
      });
      layerGroup.addLayer(mainLine);
    }

    // Fit map bounds to show all points with smooth padding
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 10,
      animate: true,
    });

  }, [stops]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleFitBounds = () => {
    if (!mapInstanceRef.current || stops.length === 0) return;
    const latLngs = stops.map(s => [s.latitude, s.longitude] as L.LatLngTuple);
    const bounds = L.latLngBounds(latLngs);
    mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 10, animate: true });
  };

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-stone-200 shadow-inner bg-stone-100">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Top Overlay Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2 pointer-events-none">
        <span className="bg-white/95 backdrop-blur-xs text-stone-900 text-[11px] font-bold px-3 py-1 rounded-lg border border-stone-200 shadow-sm flex items-center gap-1.5 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>{circuitName.replace(/_/g, ' ').toUpperCase()} CIRCUIT</span>
        </span>
        <span className="bg-white/95 backdrop-blur-xs text-stone-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-stone-200 shadow-sm pointer-events-auto">
          ~{totalDistanceKm.toLocaleString()} km
        </span>
      </div>

      {/* Reset Bounds Action Button */}
      <button
        onClick={handleFitBounds}
        title="Reset Map View"
        className="absolute top-3 right-3 z-20 bg-white/95 hover:bg-white text-stone-700 hover:text-stone-900 p-2 rounded-lg border border-stone-200 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* Bottom Legend */}
      <div className="absolute bottom-3 right-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm text-[10px] text-stone-600 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
          <span>Origin Hub</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <span>Destination Stop</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-0.5 bg-red-600 border-t border-dashed border-red-600" />
          <span>Curated Road Track</span>
        </div>
      </div>
    </div>
  );
};
