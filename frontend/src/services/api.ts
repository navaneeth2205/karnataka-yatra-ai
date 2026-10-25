import {
  TripPlanRequest,
  TripPlanResponse,
  TripValidationResult,
  Destination,
  WeatherInfo,
} from '../types/travel';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:8000');

function getApiUrl(endpoint: string): URL {
  const base =
    API_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');
  return new URL(endpoint, base);
}

export async function fetchLiveWeather(city: string): Promise<WeatherInfo> {
  const url = getApiUrl('/api/v1/weather/current');
  url.searchParams.set('city', city);
  url.searchParams.set('_t', Date.now().toString());
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Weather fetch failed (${res.status})`);
  }
  return res.json();
}

export async function fetchHealth(): Promise<{ status: string; destinations_count: number }> {
  const url = getApiUrl('/health');
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchDestinations(params?: {
  interest?: string;
  region?: string;
  search?: string;
}): Promise<{ total: number; items: Destination[] }> {
  const url = getApiUrl('/api/v1/destinations');
  if (params?.interest) url.searchParams.set('interest', params.interest);
  if (params?.region) url.searchParams.set('region', params.region);
  if (params?.search) url.searchParams.set('search', params.search);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Failed to fetch destinations: ${res.statusText}`);
  }
  return res.json();
}

export async function planTrip(request: TripPlanRequest): Promise<TripPlanResponse> {
  const url = getApiUrl('/api/v1/trips/plan');
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Trip planning failed (${res.status})`);
  }
  return res.json();
}

export async function validateTrip(request: TripPlanRequest): Promise<TripValidationResult> {
  const url = getApiUrl('/api/v1/trips/validate');
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Validation failed (${res.status})`);
  }
  return res.json();
}

export async function reviseTrip(
  currentTrip: TripPlanResponse,
  revisionInstruction: string
): Promise<TripPlanResponse> {
  const url = getApiUrl('/api/v1/trips/revise');
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      current_trip: currentTrip,
      revision_instruction: revisionInstruction,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Trip revision failed (${res.status})`);
  }
  return res.json();
}
