import uuid
from typing import List, Dict, Any, Optional
from backend.app.schemas.trip import (
    TripPlanRequest,
    TripPlanResponse,
    DayItinerary,
    ActivitySlot,
    KannadaPhrase,
    TripRevisionRequest,
)
from backend.app.schemas.destination import Destination
from backend.app.services.destination_service import destination_service
from backend.app.services.budget_service import BudgetService
from backend.app.services.routing_service import EstimatedDistanceRoutingService
from backend.app.services.llm_provider import get_llm_provider
from backend.app.services.validation_service import ValidationService
from backend.app.services.seasonal_ai_service import SeasonalAIPredictor
from backend.app.services.localization_service import LocalizationService
from backend.app.services.weather_service import WeatherService


class ItineraryService:
    def __init__(self):
        self.routing_service = EstimatedDistanceRoutingService()
        self.llm_provider = get_llm_provider()

    def generate_plan(self, req: TripPlanRequest) -> TripPlanResponse:
        # 1. Validation check
        validation = ValidationService.validate_trip_request(req)
        warnings: List[str] = list(validation.warnings)

        # Automated real-time weather sensing (Open-Meteo external API)
        live_weather = WeatherService.fetch_live_weather(req.starting_city)
        sensed_season = live_weather.get("season", "winter")
        is_rainy = live_weather.get("is_rainy", False)

        # Automated season detection: use sensed season unless explicitly specified
        travel_season = getattr(req, "travel_season", None) or sensed_season

        # If rain detected, activate Rain-Adaptive Mode
        if is_rainy:
            warnings.insert(
                0,
                f"☔ Rain-Adaptive Mode Active: Real-time precipitation sensed in {req.starting_city} "
                f"({live_weather.get('temperature_c', 22)}°C, {live_weather.get('condition_label', 'Rain')}). "
                f"Outdoor afternoon slots have been automatically substituted with sheltered indoor attractions, museums, and covered heritage palaces."
            )
        else:
            warnings.append(
                f"🌤️ Live Climate: {live_weather.get('condition_label', 'Pleasant')} in {req.starting_city} ({live_weather.get('temperature_c', 24)}°C). Ideal for sightseeing."
            )

        # 2. Determine target destination count
        if req.duration_days <= 2:
            target_dest_count = 1
        elif req.duration_days <= 4:
            target_dest_count = 2
        elif req.duration_days <= 7:
            target_dest_count = 3
        else:
            target_dest_count = min(4, len(destination_service.all_destinations))

        # 3. Model-predicted seasonal destination selection (predicted, not static rules)
        seasonal_result = SeasonalAIPredictor.predict_seasonal_itinerary(
            destinations=destination_service.all_destinations,
            travel_season=travel_season,
            starting_city=req.starting_city,
            duration_days=req.duration_days,
            interests=req.interests,
            experience_preference=req.experience_preference,
            target_dest_count=target_dest_count,
        )

        destinations = seasonal_result["destinations"]
        if not destinations:
            destinations = destination_service.all_destinations[:2]

        # 4. Routing calculation
        route_summary = self.routing_service.calculate_route(
            starting_city=req.starting_city,
            destinations=destinations,
            transport_mode=req.transport_mode,
        )

        # 5. Budget calculation
        budget_summary = BudgetService.calculate_budget(
            requested_budget=req.total_budget_inr,
            duration_days=req.duration_days,
            destinations=destinations,
            experience_preference=req.experience_preference,
            transport_mode=req.transport_mode,
            estimated_total_km=route_summary.total_distance_km,
            travelers_count=req.travelers_count,
        )

        # Explicit warning if itinerary exceeds requested budget
        if not budget_summary.is_within_budget:
            overage = budget_summary.estimated_total_cost - req.total_budget_inr
            warnings.insert(
                0,
                f"Budget Warning: Estimated trip expense (₹{budget_summary.estimated_total_cost:,}) exceeds "
                f"your requested budget (₹{req.total_budget_inr:,}) by ₹{overage:,}. Consider selecting 'budget-friendly' mode or public transport.",
            )

        # Add seasonal advisory if present
        if seasonal_result.get("seasonal_tip"):
            warnings.append(f"Seasonal Advisory ({travel_season.capitalize()}): {seasonal_result['seasonal_tip']}")

        # 6. Narrative generation in requested target language
        narrative = self.llm_provider.generate_narrative(
            starting_city=req.starting_city,
            duration_days=req.duration_days,
            interests=req.interests,
            experience_preference=req.experience_preference,
            destinations=destinations,
            preferred_language=req.preferred_language,
            travel_season=travel_season,
        )

        # 7. Localized Day-by-Day Itinerary Generation (100% target language) with Rain-Adaptive support
        days = self._build_days(
            duration_days=req.duration_days,
            destinations=destinations,
            preferred_language=req.preferred_language,
            budget_summary=budget_summary,
            seasonal_result=seasonal_result,
            is_rainy=is_rainy,
        )

        # Localized Kannada Phrasebook
        phrase_dicts = LocalizationService.get_localized_phrases(req.preferred_language)
        phrases = [KannadaPhrase(**p) for p in phrase_dicts]

        trip_id = f"ky-{uuid.uuid4().hex[:8]}"

        return TripPlanResponse(
            trip_id=trip_id,
            starting_city=req.starting_city,
            duration_days=req.duration_days,
            travelers_count=req.travelers_count,
            travel_season=travel_season,
            seasonal_insight=seasonal_result.get("seasonal_insight"),
            weather_info=live_weather,
            is_rain_adaptive=is_rainy,
            interests=req.interests,
            experience_preference=req.experience_preference,
            transport_mode=req.transport_mode,
            preferred_language=req.preferred_language,
            title=narrative["title"],
            summary=narrative["summary"],
            budget=budget_summary,
            route_summary=route_summary,
            days=days,
            kannada_travel_phrases=phrases,
            validation_warnings=warnings,
            planner_mode=narrative.get("provider", seasonal_result.get("provider", "deterministic")),
        )

    def _build_days(
        self,
        duration_days: int,
        destinations: List[Destination],
        preferred_language: str,
        budget_summary: Any,
        seasonal_result: Dict[str, Any],
        is_rainy: bool = False,
    ) -> List[DayItinerary]:
        days: List[DayItinerary] = []
        dest_count = len(destinations)
        per_day_est = int(budget_summary.estimated_total_cost / duration_days)
        highlight_activities = seasonal_result.get("highlight_activities", {})

        for day_idx in range(1, duration_days + 1):
            dest_index = min(int((day_idx - 1) / (duration_days / dest_count)), dest_count - 1)
            dest = destinations[dest_index]

            localized_dest_name = LocalizationService.get_localized_destination_name(dest.id, preferred_language)
            day_title = LocalizationService.get_localized_day_title(day_idx, localized_dest_name, preferred_language)

            morning_info = LocalizationService.get_localized_slot("morning", localized_dest_name, preferred_language)
            afternoon_info = LocalizationService.get_localized_slot("afternoon", localized_dest_name, preferred_language)
            evening_info = LocalizationService.get_localized_slot("evening", localized_dest_name, preferred_language)

            # Seasonal special touch for morning or afternoon if predicted
            if dest.id in highlight_activities:
                seasonal_highlight = highlight_activities[dest.id]
                morning_info["desc"] = f"{morning_info['desc']} ({seasonal_highlight})"

            morning = ActivitySlot(
                time="08:30 AM - 12:30 PM",
                title=morning_info["title"],
                description=morning_info["desc"],
                location_name=localized_dest_name,
                estimated_entry_inr=50,
                is_estimate=True,
                icon_hint="sun",
            )

            # If rainy, substitute afternoon activity with indoor sheltered venue
            if is_rainy:
                indoor_venue = WeatherService.get_indoor_substitute(dest.id)
                prefix_map = {
                    "kannada": "☔ [ಮಳೆ-ರಕ್ಷಿತ ಒಳಾಂಗಣ]",
                    "hindi": "☔ [बारिश-सुरक्षित इनडोर]",
                    "telugu": "☔ [వర్షం-రక్షిత ఇండోర్]",
                    "tamil": "☔ [மழை-பாதுகாப்பான உள்ளரங்கம்]",
                    "malayalam": "☔ [മഴ-സംരക്ഷിത ഇൻഡോർ]",
                    "english": "☔ [Rain-Protected Indoor]",
                }
                prefix = prefix_map.get(preferred_language, "☔ [Rain-Protected Indoor]")
                afternoon_title = f"{prefix} {indoor_venue['title']}"
                afternoon_desc = f"{indoor_venue['description']} (Venue: {indoor_venue['location']})"
                afternoon_icon = "umbrella"
            else:
                afternoon_title = afternoon_info["title"]
                afternoon_desc = afternoon_info["desc"]
                afternoon_icon = "camera"

            afternoon = ActivitySlot(
                time="01:30 PM - 04:30 PM",
                title=afternoon_title,
                description=afternoon_desc,
                location_name=localized_dest_name,
                estimated_entry_inr=25,
                is_estimate=True,
                icon_hint=afternoon_icon,
            )

            evening = ActivitySlot(
                time="05:30 PM - 08:00 PM",
                title=evening_info["title"],
                description=evening_info["desc"],
                location_name=localized_dest_name,
                estimated_entry_inr=0,
                is_estimate=False,
                icon_hint="sunset",
            )

            cuisine_list = LocalizationService.get_localized_cuisine(dest.id, preferred_language)
            tip = LocalizationService.get_localized_tip(day_idx, preferred_language)

            days.append(
                DayItinerary(
                    day_number=day_idx,
                    title=day_title,
                    destination_name=localized_dest_name,
                    destination_kannada=dest.name_kannada,
                    morning_activity=morning,
                    afternoon_activity=afternoon,
                    evening_activity=evening,
                    cuisine_recommendations=cuisine_list,
                    day_budget_estimate=per_day_est,
                    travel_tip=tip,
                )
            )

        return days

    def revise_itinerary(self, revision: TripRevisionRequest) -> TripPlanResponse:
        current = revision.current_trip
        instruction = revision.revision_instruction.lower().strip()

        new_experience = current.experience_preference
        new_transport = current.transport_mode
        new_budget = current.budget.requested_budget
        added_interests = []

        if "reduce" in instruction or "budget" in instruction or "cheaper" in instruction:
            new_experience = "budget-friendly"
            if current.transport_mode == "cab_rental":
                new_transport = "public_bus"
            new_budget = int(current.budget.requested_budget * 0.82)

        elif "luxury" in instruction or "relax" in instruction or "comfortable" in instruction:
            new_experience = "relaxed"
            if current.transport_mode == "public_bus":
                new_transport = "cab_rental"

        elif "adventure" in instruction or "trek" in instruction or "hike" in instruction:
            new_experience = "adventurous"
            added_interests.append("adventure")

        elif "heritage" in instruction or "history" in instruction or "temple" in instruction:
            added_interests.append("heritage")

        elif "beach" in instruction or "coastal" in instruction:
            added_interests.append("beaches")

        base_interests = current.interests if getattr(current, "interests", None) else ["nature", "heritage"]
        if added_interests:
            interests = added_interests + [i for i in base_interests if i not in added_interests]
        else:
            interests = base_interests

        revised_request = TripPlanRequest(
            starting_city=current.starting_city,
            duration_days=current.duration_days,
            total_budget_inr=new_budget,
            travelers_count=getattr(current, "travelers_count", 1),
            travel_season=getattr(current, "travel_season", "winter"),
            interests=interests,  # type: ignore
            experience_preference=new_experience,  # type: ignore
            transport_mode=new_transport,  # type: ignore
            preferred_language=current.preferred_language,  # type: ignore
        )

        revised_plan = self.generate_plan(revised_request)
        revised_plan.title = f"Revised: {revised_plan.title}"
        revised_plan.summary = f"Updated based on your request ('{revision.revision_instruction}'): {revised_plan.summary}"

        return revised_plan


itinerary_service = ItineraryService()
