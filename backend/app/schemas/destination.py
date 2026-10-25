from typing import List, Optional
from pydantic import BaseModel, Field


class AttractionItem(BaseModel):
    title: str
    description: str
    estimated_entry_fee_inr: int = 0
    estimated_time_hours: float = 2.0
    category: str = "sightseeing"
    is_estimate: bool = True


class Destination(BaseModel):
    id: str
    name: str
    name_kannada: str = ""
    region: str
    interests: List[str] = Field(default_factory=list)
    short_description: str
    ideal_duration_days: int = 2
    estimated_stay_cost_per_night: int = 1500
    estimated_daily_food_cost: int = 600
    latitude: float = 12.9716
    longitude: float = 77.5946
    best_season: str = "Year-round"
    highlight_foods: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    sample_attractions: List[AttractionItem] = Field(default_factory=list)
    is_sample_or_estimated: bool = True


class DestinationListResponse(BaseModel):
    total: int
    items: List[Destination]
