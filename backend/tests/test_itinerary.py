import pytest
from backend.app.schemas.trip import TripPlanRequest, TripRevisionRequest
from backend.app.services.itinerary_service import itinerary_service


def test_itinerary_generation():
    req = TripPlanRequest(
        starting_city="Bengaluru",
        duration_days=3,
        total_budget_inr=15000,
        interests=["heritage", "nature"],
        experience_preference="balanced",
        transport_mode="cab_rental",
        preferred_language="kannada",
    )

    plan = itinerary_service.generate_plan(req)

    assert plan.starting_city == "Bengaluru"
    assert plan.duration_days == 3
    assert len(plan.days) == 3
    assert plan.budget.requested_budget == 15000
    assert len(plan.kannada_travel_phrases) > 0
    assert plan.route_summary.total_distance_km > 0
    assert len(plan.route_summary.stops) >= 2


def test_day_slots_complete():
    req = TripPlanRequest(
        starting_city="Mangaluru",
        duration_days=2,
        total_budget_inr=10000,
        interests=["beaches", "food"],
        experience_preference="relaxed",
        transport_mode="public_bus",
        preferred_language="english",
    )

    plan = itinerary_service.generate_plan(req)

    for day in plan.days:
        assert day.morning_activity.title
        assert day.morning_activity.time
        assert day.afternoon_activity.title
        assert day.evening_activity.title
        assert len(day.cuisine_recommendations) > 0
        assert day.travel_tip


def test_itinerary_revision():
    req = TripPlanRequest(
        starting_city="Bengaluru",
        duration_days=4,
        total_budget_inr=25000,
        interests=["heritage"],
        experience_preference="balanced",
        transport_mode="cab_rental",
        preferred_language="english",
    )

    original_plan = itinerary_service.generate_plan(req)

    rev_req = TripRevisionRequest(
        current_trip=original_plan,
        revision_instruction="reduce the budget and switch to bus",
    )

    revised_plan = itinerary_service.revise_itinerary(rev_req)

    assert revised_plan.transport_mode == "public_bus"
    assert revised_plan.experience_preference == "budget-friendly"
    assert revised_plan.budget.requested_budget < original_plan.budget.requested_budget
    assert "Revised" in revised_plan.title


def test_seasonal_prediction_differences():
    # Winter request
    req_winter = TripPlanRequest(
        starting_city="Bengaluru",
        duration_days=3,
        total_budget_inr=20000,
        interests=["heritage", "nature"],
        experience_preference="balanced",
        transport_mode="cab_rental",
        preferred_language="english",
        travel_season="winter",
    )
    plan_winter = itinerary_service.generate_plan(req_winter)

    # Summer request (same gateway and interests)
    req_summer = TripPlanRequest(
        starting_city="Bengaluru",
        duration_days=3,
        total_budget_inr=20000,
        interests=["heritage", "nature"],
        experience_preference="balanced",
        transport_mode="cab_rental",
        preferred_language="english",
        travel_season="summer",
    )
    plan_summer = itinerary_service.generate_plan(req_summer)

    assert plan_winter.seasonal_insight is not None
    assert plan_summer.seasonal_insight is not None
    assert "Winter" in plan_winter.seasonal_insight
    assert "Summer" in plan_summer.seasonal_insight

    # In summer, Western Ghats cool elevations are predicted over scorching plains
    summer_dest_names = [d.destination_name.lower() for d in plan_summer.days]
    assert any(h in "".join(summer_dest_names) for h in ["chikmagalur", "coorg", "dandeli"])


def test_multilingual_localization_output():
    # Kannada
    plan_kn = itinerary_service.generate_plan(
        TripPlanRequest(
            starting_city="Bengaluru",
            duration_days=2,
            total_budget_inr=15000,
            interests=["heritage"],
            experience_preference="balanced",
            transport_mode="cab_rental",
            preferred_language="kannada",
        )
    )
    assert "ದಿನ 1" in plan_kn.days[0].title
    assert any("\u0c80" <= c <= "\u0cff" for c in plan_kn.days[0].morning_activity.title)

    # Hindi
    plan_hi = itinerary_service.generate_plan(
        TripPlanRequest(
            starting_city="Bengaluru",
            duration_days=2,
            total_budget_inr=15000,
            interests=["heritage"],
            experience_preference="balanced",
            transport_mode="cab_rental",
            preferred_language="hindi",
        )
    )
    assert "दिन 1" in plan_hi.days[0].title
    assert any("\u0900" <= c <= "\u097f" for c in plan_hi.days[0].morning_activity.title)

