export type SupportedInterest =
  | 'nature'
  | 'heritage'
  | 'adventure'
  | 'food'
  | 'beaches'
  | 'wildlife'
  | 'spirituality';

export type SupportedExperience = 'budget-friendly' | 'relaxed' | 'adventurous' | 'balanced';

export type SupportedTransport = 'public_bus' | 'train' | 'cab_rental' | 'self_drive';

export type SupportedLanguage = 'english' | 'kannada' | 'hindi' | 'telugu' | 'tamil' | 'malayalam';

export type SupportedSeason = 'winter' | 'summer' | 'monsoon' | 'post_monsoon';

export interface TripPlanRequest {
  starting_city: string;
  duration_days: number;
  total_budget_inr: number;
  travelers_count?: number;
  travel_season?: SupportedSeason;
  interests: SupportedInterest[];
  experience_preference: SupportedExperience;
  transport_mode: SupportedTransport;
  preferred_language: SupportedLanguage;
}

export interface CostBreakdown {
  accommodation: number;
  food: number;
  transport: number;
  activities_entry: number;
  contingency_reserve: number;
}

export interface BudgetSummary {
  requested_budget: number;
  estimated_total_cost: number;
  remaining_buffer: number;
  is_within_budget: boolean;
  cost_breakdown: CostBreakdown;
  currency: string;
  disclaimer: string;
  travelers_count?: number;
  rooms_allocated?: number;
  per_person_cost?: number;
}

export interface ActivitySlot {
  time: string;
  title: string;
  description: string;
  location_name: string;
  estimated_entry_inr: number;
  is_estimate: boolean;
  icon_hint: string;
}

export interface DayItinerary {
  day_number: number;
  title: string;
  destination_name: string;
  destination_kannada: string;
  morning_activity: ActivitySlot;
  afternoon_activity: ActivitySlot;
  evening_activity: ActivitySlot;
  cuisine_recommendations: string[];
  day_budget_estimate: number;
  travel_tip: string;
}

export interface KannadaPhrase {
  phrase: string;
  pronunciation: string;
  meaning: string;
  context: string;
}

export interface RouteStop {
  name: string;
  region: string;
  day_numbers: number[];
  latitude: number;
  longitude: number;
  is_fallback_coordinate?: boolean;
}

export interface RouteSummary {
  total_distance_km: number;
  primary_circuit: string;
  transit_mode: string;
  stops: RouteStop[];
  regional_travel_note: string;
}

export interface WeatherInfo {
  city: string;
  temperature_c: number;
  condition_label: string;
  weather_code: number;
  is_rainy: boolean;
  rain_probability_pct: number;
  weather_icon: string;
  season: string;
  source: string;
  advisory: string;
}

export interface TripPlanResponse {
  trip_id: string;
  starting_city: string;
  duration_days: number;
  travelers_count?: number;
  travel_season?: string;
  seasonal_insight?: string;
  weather_info?: WeatherInfo;
  is_rain_adaptive?: boolean;
  experience_preference: string;
  transport_mode: string;
  preferred_language: string;
  title: string;
  summary: string;
  budget: BudgetSummary;
  route_summary: RouteSummary;
  days: DayItinerary[];
  kannada_travel_phrases: KannadaPhrase[];
  validation_warnings: string[];
  planner_mode: string;
}

export interface TripValidationResult {
  is_valid: boolean;
  warnings: string[];
  suggestions: string[];
  minimum_recommended_budget: number;
  per_day_allocated_budget: number;
  travelers_count?: number;
  per_person_budget?: number;
  travel_season?: string;
  seasonal_advice?: string;
  weather_info?: WeatherInfo;
}

export interface AttractionItem {
  title: string;
  description: string;
  estimated_entry_fee_inr: number;
  estimated_time_hours: number;
  category: string;
  is_estimate: boolean;
}

export interface Destination {
  id: string;
  name: string;
  name_kannada: string;
  region: string;
  interests: string[];
  short_description: string;
  ideal_duration_days: number;
  estimated_stay_cost_per_night: number;
  estimated_daily_food_cost: number;
  latitude: number;
  longitude: number;
  best_season: string;
  highlight_foods: string[];
  tags: string[];
  sample_attractions: AttractionItem[];
  is_sample_or_estimated: boolean;
}
