import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RouteStop } from '../types/travel';
import { Maximize2, Minimize2, Compass, Layers, Globe, RotateCcw } from 'lucide-react';

interface Props {
  stops: RouteStop[];
  totalDistanceKm: number;
  circuitName: string;
}

type MapLayerType = 'streets' | 'satellite' | 'voyager';

const TILE_LAYERS: Record<MapLayerType, { url: string; attribution: string; maxZoom: number }> = {
  streets: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    maxZoom: 19,
  },
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OSM</a> &copy; <a href="https://carto.com/" target="_blank" rel="noreferrer">CARTO</a>',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
};

export const KarnatakaRouteMap: React.FC<Props> = ({ stops, totalDistanceKm, circuitName }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerMapRef = useRef<Map<number, L.Marker>>(new Map());

  const [activeLayer, setActiveLayer] = useState<MapLayerType>('voyager');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [14.5, 75.8],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
      });

      // Default Voyager tile layer (clean, crisp, modern)
      const initialLayer = TILE_LAYERS[activeLayer];
      const tileLayer = L.tileLayer(initialLayer.url, {
        maxZoom: initialLayer.maxZoom,
        attribution: initialLayer.attribution,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);
      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    // Invalidate size on mount after layout settles
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Update Tile Layer when user toggles style
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = TILE_LAYERS[activeLayer];
    const newTileLayer = L.tileLayer(cfg.url, {
      maxZoom: cfg.maxZoom,
      attribution: cfg.attribution,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [activeLayer]);

  // Render stops, route line, and custom pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    markerMapRef.current.clear();

    if (stops.length === 0) return;

    const latLngs: L.LatLngTuple[] = [];

    stops.forEach((stop, idx) => {
      const isOrigin = idx === 0;
      const stopNumber = idx + 1;
      const pos: L.LatLngTuple = [stop.latitude, stop.longitude];
      latLngs.push(pos);

      const bgColor = isOrigin ? '#d97706' : '#dc2626'; // amber-600 vs red-600
      const stopBadge = isOrigin ? 'Start Hub' : `Day ${stop.day_numbers.join(',')}`;

      // Custom HTML Pin Marker with surgical coordinate needle anchor
      const pinHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="
            background: ${bgColor};
            color: white;
            font-size: 11px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 2px solid white;
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
          ">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${isOrigin ? '#fef08a' : '#fecaca'};"></span>
            <span>${isOrigin ? 'Start Hub' : `Stop ${stopNumber}`}</span>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid ${bgColor};
            margin-top: -1px;
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.25));
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: pinHtml,
        iconSize: [36, 44],
        iconAnchor: [18, 42],
        popupAnchor: [0, -38],
      });

      const marker = L.marker(pos, { icon: customIcon });

      // Rich Informational Popup
      const regionClean = stop.region ? stop.region.replace(/_/g, ' ') : 'Hub';
      const fallbackNotice = stop.is_fallback_coordinate
        ? `<div style="margin-top: 4px; font-size: 10px; color: #b45309; background: #fef3c7; padding: 2px 6px; border-radius: 4px;">⚠️ Curated Regional Hub Coordinate</div>`
        : '';

      const popupHtml = `
        <div style="padding: 6px; min-width: 170px; max-width: 240px; font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 3px;">
            <strong style="font-size: 13px; font-weight: 800; color: #1c1917;">${stop.name}</strong>
            <span style="font-size: 10px; font-weight: 700; background: ${isOrigin ? '#fef3c7' : '#fee2e2'}; color: ${isOrigin ? '#b45309' : '#991b1b'}; padding: 1px 6px; border-radius: 4px; text-transform: capitalize;">
              ${regionClean}
            </span>
          </div>
          <div style="font-size: 11px; font-weight: 600; color: #78716c;">
            ${isOrigin ? 'Trip Origin Hub' : `Scheduled Tour Stop: ${stopBadge}`}
          </div>
          <div style="font-size: 10px; color: #a8a29e; margin-top: 4px;">
            📍 ${stop.latitude.toFixed(2)}° N, ${stop.longitude.toFixed(2)}° E
          </div>
          ${fallbackNotice}
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedStopIndex(idx);
      });

      layerGroup.addLayer(marker);
      markerMapRef.current.set(idx, marker);
    });

    // Draw connecting sequential circuit polyline
    if (latLngs.length > 1) {
      const fullLoopLatLngs = [...latLngs, latLngs[0]];

      // Ambient warm glow
      const glowLine = L.polyline(fullLoopLatLngs, {
        color: '#f59e0b',
        weight: 8,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      });
      layerGroup.addLayer(glowLine);

      // Core Karnataka Crimson road track
      const mainLine = L.polyline(fullLoopLatLngs, {
        color: '#dc2626',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '10, 8',
        lineCap: 'round',
        lineJoin: 'round',
      });
      layerGroup.addLayer(mainLine);
    }

    // Auto-fit all coordinates cleanly inside bounds
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 10,
      animate: true,
    });

    // Invalidate size in case of container changes
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
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

  // Handle Container Resize / Expand Toggle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
      handleFitBounds();
    }, 250);
    return () => clearTimeout(timer);
  }, [isExpanded]);

  const handleFitBounds = () => {
    if (!mapInstanceRef.current || stops.length === 0) return;
    const latLngs = stops.map((s) => [s.latitude, s.longitude] as L.LatLngTuple);
    const bounds = L.latLngBounds(latLngs);
    mapInstanceRef.current.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 10,
      animate: true,
    });
    setSelectedStopIndex(null);
  };

  const handleFlyToStop = (index: number) => {
    if (!mapInstanceRef.current || !stops[index]) return;
    const stop = stops[index];
    setSelectedStopIndex(index);

    mapInstanceRef.current.flyTo([stop.latitude, stop.longitude], 11, {
      duration: 1.0,
    });

    const marker = markerMapRef.current.get(index);
    if (marker) {
      marker.openPopup();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs space-y-0">
      {/* Map Canvas Frame */}
      <div
        className={`relative w-full transition-all duration-300 ease-in-out overflow-hidden bg-stone-100 ${
          isExpanded ? 'h-[500px]' : 'h-80 sm:h-96'
        }`}
      >
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Top-Left Circuit & Distance Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2 pointer-events-none">
          <span className="bg-white/95 backdrop-blur-xs text-stone-900 text-[11px] font-bold px-3 py-1 rounded-lg border border-stone-200 shadow-sm flex items-center gap-1.5 pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{circuitName.replace(/_/g, ' ').toUpperCase()}</span>
          </span>
          <span className="bg-white/95 backdrop-blur-xs text-stone-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-stone-200 shadow-sm pointer-events-auto">
            ~{totalDistanceKm.toLocaleString()} km circuit
          </span>
        </div>

        {/* Top-Right Control Buttons (Layer Switcher, Re-center, Expand) */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1 rounded-xl border border-stone-200 shadow-sm">
          {/* Layer Selector */}
          <div className="flex items-center gap-1 border-r border-stone-200 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={() => setActiveLayer('voyager')}
              title="Clean Voyager Map Style"
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeLayer === 'voyager'
                  ? 'bg-amber-100 text-amber-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('streets')}
              title="OpenStreetMap Road Network"
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeLayer === 'streets'
                  ? 'bg-amber-100 text-amber-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('satellite')}
              title="High-Res Satellite Aerial View"
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeLayer === 'satellite'
                  ? 'bg-amber-100 text-amber-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset Zoom / Fit Bounds */}
          <button
            type="button"
            onClick={handleFitBounds}
            title="Fit All Tour Stops"
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Expand Height Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse Map View' : 'Expand to Large Map View'}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5 text-amber-700" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-3 right-3 z-20 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-stone-200 shadow-sm text-[10px] text-stone-600 flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>Origin Hub</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span>Tour Stop</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-0.5 bg-red-600 border-t border-dashed border-red-600" />
            <span>Road Route</span>
          </div>
        </div>
      </div>

      {/* Interactive Waypoint Chips Carousel */}
      {stops.length > 0 && (
        <div className="p-3 bg-stone-50 border-t border-stone-200 min-w-0">
          <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 mb-2">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span>Click any stop to fly & inspect on map:</span>
            </span>
            <span className="text-[10px] text-stone-400">{stops.length} Total Waypoints</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {stops.map((stop, index) => {
              const isOrigin = index === 0;
              const isActive = selectedStopIndex === index;
              return (
                <button
                  key={`${stop.name}-${index}`}
                  type="button"
                  onClick={() => handleFlyToStop(index)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs scale-102'
                      : isOrigin
                      ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isOrigin ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className="font-bold">{isOrigin ? 'Start' : `Stop ${index + 1}`}:</span>
                  <span>{stop.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
