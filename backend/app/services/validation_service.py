from typing import List
from backend.app.schemas.trip import TripPlanRequest, TripValidationResult
from backend.app.services.budget_service import BudgetService
from backend.app.services.weather_service import WeatherService


class ValidationService:
    @classmethod
    def validate_trip_request(cls, request: TripPlanRequest) -> TripValidationResult:
        warnings: List[str] = []
        suggestions: List[str] = []

        travelers = max(1, getattr(request, "travelers_count", 1))

        # Real-time weather sensing
        weather_info = WeatherService.fetch_live_weather(request.starting_city)
        sensed_season = weather_info.get("season", "winter")

        min_recommended = BudgetService.get_minimum_recommended_budget(
            duration_days=request.duration_days,
            transport_mode=request.transport_mode,
            travelers_count=travelers,
        )
        per_day_budget = int(request.total_budget_inr / request.duration_days)
        per_person_budget = int(request.total_budget_inr / travelers)

        is_valid = True

        # Budget sufficiency check scaled by party size
        if request.total_budget_inr < min_recommended:
            party_label = "solo traveler" if travelers == 1 else f"{travelers} travelers"
            warnings.append(
                f"Requested budget of ₹{request.total_budget_inr:,} (₹{per_person_budget:,}/person) is below the estimated baseline of ₹{min_recommended:,} "
                f"for a {request.duration_days}-day trip for {party_label} via {request.transport_mode.replace('_', ' ')}."
            )
            if request.transport_mode in ["cab_rental", "self_drive"]:
                suggestions.append(
                    "Switching to KSRTC public bus or South Western Railway can save 35-50% on transit expenses."
                )
            suggestions.append(
                f"Consider increasing total budget to ~₹{min_recommended:,} (~₹{int(min_recommended / travelers):,}/person) for a comfortable trip."
            )

        # Vehicle capacity sanity checks
        if travelers >= 5 and request.transport_mode == "cab_rental":
            suggestions.append(
                f"For {travelers} travelers, we've factored an Innova / 7-seater SUV or Tempo Traveller for comfortable ghat navigation."
            )

        # Transport vs budget sanity
        if request.transport_mode == "cab_rental" and per_day_budget < 2500:
            warnings.append(
                "Private cab rental requires at least ₹2,500-₹3,500/day including fuel, driver allowance, and toll fees."
            )

        # Duration vs interests
        if request.duration_days > 7 and len(request.interests) < 2:
            suggestions.append(
                "For journeys longer than a week, consider combining complementary circuits (e.g. Coastal Karavali + Malenadu Ghats)."
            )

        if not warnings:
            suggestions.append(f"Ready to generate! Your parameters are well-balanced for {travelers} traveler(s).")

        travel_season = getattr(request, "travel_season", None) or sensed_season
        seasonal_advices = {
            "winter": "Winter (Nov-Feb): Optimal climate across Karnataka. Ideal for open stone ruins (Hampi, Badami) and Western Ghats treks.",
            "summer": "Summer (Mar-May): Consider cool elevation hill retreats (Chikmagalur, Coorg, Dandeli) to avoid northern Deccan heat.",
            "monsoon": "Monsoon (Jun-Aug): Prime season for roaring Western Ghat waterfalls (Jog Falls, Abbey Falls). Avoid sea swimming.",
            "post_monsoon": "Post-Monsoon (Sep-Oct): Lush greenery and Dasara cultural festivities across Mysuru and ancient sanctuaries.",
        }
        seasonal_advice = seasonal_advices.get(travel_season, seasonal_advices["winter"])

        return TripValidationResult(
            is_valid=is_valid,
            warnings=warnings,
            suggestions=suggestions,
            minimum_recommended_budget=min_recommended,
            per_day_allocated_budget=per_day_budget,
            travelers_count=travelers,
            per_person_budget=per_person_budget,
            travel_season=travel_season,
            seasonal_advice=seasonal_advice,
            weather_info=weather_info,
        )
