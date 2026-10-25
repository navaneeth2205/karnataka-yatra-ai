import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Destination } from '../types/travel';
import { Compass, Layers, Globe, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

interface Props {
  destinations: Destination[];
  onPlanTrip: (dest: Destination) => void;
}

type MapLayerType = 'voyager' | 'streets' | 'satellite';

const TILE_LAYERS: Record<MapLayerType, { url: string; attribution: string; maxZoom: number }> = {
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OSM</a> &copy; <a href="https://carto.com/" target="_blank" rel="noreferrer">CARTO</a>',
    maxZoom: 19,
  },
  streets: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18,
  },
};

const REGION_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  heritage_circuit: { bg: '#d97706', text: '#fff', label: 'Heritage Circuit' },
  western_ghats: { bg: '#059669', text: '#fff', label: 'Western Ghats' },
  coastal: { bg: '#0284c7', text: '#fff', label: 'Coastal Karavali' },
  southern_karnataka: { bg: '#7c3aed', text: '#fff', label: 'Southern Karnataka' },
};

export const KarnatakaDestinationsMap: React.FC<Props> = ({ destinations, onPlanTrip }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());

  const [activeLayer, setActiveLayer] = useState<MapLayerType>('voyager');
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [14.5, 75.8],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
      });

      const initial = TILE_LAYERS[activeLayer];
      const tileLayer = L.tileLayer(initial.url, {
        maxZoom: initial.maxZoom,
        attribution: initial.attribution,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);
      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Update Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const cfg = TILE_LAYERS[activeLayer];
    const newTile = L.tileLayer(cfg.url, {
      maxZoom: cfg.maxZoom,
      attribution: cfg.attribution,
    }).addTo(map);
    tileLayerRef.current = newTile;
  }, [activeLayer]);

  // Render Destination Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    markerMapRef.current.clear();

    if (destinations.length === 0) return;

    const latLngs: L.LatLngTuple[] = [];

    destinations.forEach((dest) => {
      if (!dest.latitude || !dest.longitude) return;
      const pos: L.LatLngTuple = [dest.latitude, dest.longitude];
      latLngs.push(pos);

      const regStyle = REGION_COLORS[dest.region] || { bg: '#dc2626', text: '#fff', label: dest.region };

      const pinHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="
            background: ${regStyle.bg};
            color: white;
            font-size: 11px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.28);
            border: 2px solid white;
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
          ">
            <span>${dest.name}</span>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 7px solid ${regStyle.bg};
            margin-top: -1px;
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.25));
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-destination-marker',
        html: pinHtml,
        iconSize: [40, 42],
        iconAnchor: [20, 40],
        popupAnchor: [0, -36],
      });

      const marker = L.marker(pos, { icon: customIcon });

      const foodsHtml = dest.highlight_foods.slice(0, 3).map((f) => `
        <span style="display: inline-block; font-size: 10px; background: #fef3c7; color: #92400e; padding: 1px 6px; border-radius: 4px; margin-right: 4px; margin-top: 3px;">
          ${f}
        </span>
      `).join('');

      const popupHtml = `
        <div style="padding: 6px; min-width: 200px; max-width: 260px; font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
            <strong style="font-size: 14px; font-weight: 800; color: #1c1917;">${dest.name}</strong>
            <span style="font-size: 10px; font-weight: 700; background: #f5f5f4; color: #44403c; padding: 1px 6px; border-radius: 4px;">
              ${regStyle.label}
            </span>
          </div>
          <div style="font-size: 11px; color: #b45309; font-weight: 700; margin-bottom: 4px;" class="font-kannada">
            ${dest.name_kannada}
          </div>
          <p style="font-size: 11px; color: #57534e; line-height: 1.4; margin: 4px 0;">
            ${dest.short_description}
          </p>
          <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: #292524; background: #fafaf9; padding: 4px 6px; border-radius: 6px; margin-top: 6px;">
            <span>Est. Stay: ~₹${dest.estimated_stay_cost_per_night}/n</span>
            <span>Duration: ${dest.ideal_duration_days}D</span>
          </div>
          ${dest.highlight_foods.length > 0 ? `<div style="margin-top: 6px;">${foodsHtml}</div>` : ''}
          <button
            id="plan-btn-${dest.id}"
            style="width: 100%; margin-top: 8px; background: #1c1917; color: white; border: none; padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;"
          >
            Plan Trip Here →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`plan-btn-${dest.id}`);
        if (btn) {
          btn.onclick = () => onPlanTrip(dest);
        }
      });

      marker.on('click', () => {
        setSelectedDestId(dest.id);
      });

      layerGroup.addLayer(marker);
      markerMapRef.current.set(dest.id, marker);
    });

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 10,
        animate: true,
      });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [destinations]);

  // Clean up
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleFitAll = () => {
    if (!mapInstanceRef.current || destinations.length === 0) return;
    const latLngs = destinations
      .filter((d) => d.latitude && d.longitude)
      .map((d) => [d.latitude, d.longitude] as L.LatLngTuple);
    if (latLngs.length > 0) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(latLngs), {
        padding: [40, 40],
        maxZoom: 10,
        animate: true,
      });
    }
    setSelectedDestId(null);
  };

  const handleFlyToDest = (dest: Destination) => {
    if (!mapInstanceRef.current || !dest.latitude || !dest.longitude) return;
    setSelectedDestId(dest.id);
    mapInstanceRef.current.flyTo([dest.latitude, dest.longitude], 11, {
      duration: 1.0,
    });
    const marker = markerMapRef.current.get(dest.id);
    if (marker) {
      marker.openPopup();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
      {/* Map Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/70">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-600 shrink-0" />
            <h3 className="text-base font-bold text-stone-900">
              Interactive Karnataka Exploration Map
            </h3>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
              {destinations.length} Hubs
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Click on any regional pin to inspect historical highlights, stay benchmarks, and launch trips directly.
          </p>
        </div>

        {/* Map Style & Expand Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white p-1 rounded-xl border border-stone-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveLayer('voyager')}
            title="Clean Voyager Style"
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeLayer === 'voyager' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('streets')}
            title="OpenStreetMap Roads"
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeLayer === 'streets' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('satellite')}
            title="High-Res Aerial Satellite"
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeLayer === 'satellite' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-stone-200 mx-0.5" />

          <button
            type="button"
            onClick={handleFitAll}
            title="Fit All Karnataka Hubs"
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse Map' : 'Expand Map View'}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5 text-amber-700" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div
        className={`relative w-full transition-all duration-300 ease-in-out bg-stone-100 ${
          isExpanded ? 'h-[560px]' : 'h-96 sm:h-[420px]'
        }`}
      >
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Legend */}
        <div className="absolute bottom-3 right-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-stone-200 shadow-sm text-[10px] text-stone-700 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <span>Heritage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Western Ghats</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
            <span>Karavali Coast</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span>Southern Karunadu</span>
          </div>
        </div>
      </div>

      {/* Quick Clickable Destination Chips */}
      <div className="p-3 bg-stone-50 border-t border-stone-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {destinations.map((dest) => {
            const isSelected = selectedDestId === dest.id;
            const reg = REGION_COLORS[dest.region];
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => handleFlyToDest(dest)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs scale-102'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: reg?.bg || '#dc2626' }}
                />
                <span>{dest.name}</span>
                <span className="text-[10px] opacity-70 font-normal">({dest.ideal_duration_days}D)</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
