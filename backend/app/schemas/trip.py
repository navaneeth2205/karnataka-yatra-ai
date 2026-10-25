from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator


SupportedInterest = Literal[
    "nature", "heritage", "adventure", "food", "beaches", "wildlife", "spirituality"
]
SupportedExperience = Literal["budget-friendly", "relaxed", "adventurous", "balanced"]
SupportedTransport = Literal["public_bus", "train", "cab_rental", "self_drive"]
SupportedLanguage = Literal["english", "kannada", "hindi", "telugu", "tamil", "malayalam"]
SupportedSeason = Literal["winter", "summer", "monsoon", "post_monsoon"]


class TripPlanRequest(BaseModel):
    starting_city: str = Field(..., min_length=2, max_length=100, description="City where the journey begins, e.g. Bengaluru, Mysuru")
    duration_days: int = Field(..., ge=1, le=14, description="Trip duration in days (1 to 14)")
    total_budget_inr: int = Field(..., ge=1000, le=2000000, description="Total planned budget in INR")
    travelers_count: int = Field(default=1, ge=1, le=30, description="Total number of travelers (1 to 30)")
    travel_season: SupportedSeason = Field(default="winter", description="Travel season: winter, summer, monsoon, post_monsoon")
    interests: List[SupportedInterest] = Field(..., min_length=1, description="At least one travel interest")
    experience_preference: SupportedExperience = Field(default="balanced", description="Trip pace / travel style")
    transport_mode: SupportedTransport = Field(default="cab_rental", description="Preferred transport mode")
    preferred_language: SupportedLanguage = Field(default="english", description="Preferred output language")

    @field_validator("starting_city")
    @classmethod
    def clean_city(cls, v: str) -> str:
        return v.strip().title()


class CostBreakdown(BaseModel):
    accommodation: int
    food: int
    transport: int
    activities_entry: int
    contingency_reserve: int


class BudgetSummary(BaseModel):
    requested_budget: int
    estimated_total_cost: int
    remaining_buffer: int
    is_within_budget: bool
    cost_breakdown: CostBreakdown
    currency: str = "INR"
    disclaimer: str = "All cost estimates are based on sample standard season benchmarks. Not live verified bookings."
    travelers_count: int = 1
    rooms_allocated: int = 1
    per_person_cost: int = 0


class ActivitySlot(BaseModel):
    time: str
    title: str
    description: str
    location_name: str
    estimated_entry_inr: int = 0
    is_estimate: bool = True
    icon_hint: str = "map-pin"


class DayItinerary(BaseModel):
    day_number: int
    title: str
    destination_name: str
    destination_kannada: str = ""
    morning_activity: ActivitySlot
    afternoon_activity: ActivitySlot
    evening_activity: ActivitySlot
    cuisine_recommendations: List[str] = Field(default_factory=list)
    day_budget_estimate: int
    travel_tip: str


class KannadaPhrase(BaseModel):
    phrase: str
    pronunciation: str
    meaning: str
    context: str


class RouteStop(BaseModel):
    name: str
    region: str
    day_numbers: List[int]
    latitude: float
    longitude: float
    is_fallback_coordinate: bool = False


class RouteSummary(BaseModel):
    total_distance_km: int
    primary_circuit: str
    transit_mode: str
    stops: List[RouteStop]
    regional_travel_note: str


class TripPlanResponse(BaseModel):
    trip_id: str
    starting_city: str
    duration_days: int
    travelers_count: int = 1
    travel_season: str = "winter"
    seasonal_insight: Optional[str] = None
    weather_info: Optional[dict] = None
    is_rain_adaptive: bool = False
    interests: List[str] = Field(default_factory=list)
    experience_preference: str
    transport_mode: str
    preferred_language: str
    title: str
    summary: str
    budget: BudgetSummary
    route_summary: RouteSummary
    days: List[DayItinerary]
    kannada_travel_phrases: List[KannadaPhrase]
    validation_warnings: List[str] = Field(default_factory=list)
    planner_mode: str = "deterministic"


class TripValidationResult(BaseModel):
    is_valid: bool
    warnings: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    minimum_recommended_budget: int
    per_day_allocated_budget: int
    travelers_count: int = 1
    per_person_budget: int = 0
    travel_season: str = "winter"
    seasonal_advice: Optional[str] = None
    weather_info: Optional[dict] = None


class TripRevisionRequest(BaseModel):
    current_trip: TripPlanResponse
    revision_instruction: str = Field(..., min_length=3, description="User instruction, e.g. 'reduce budget', 'add more heritage'")
