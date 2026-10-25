import pytest
from backend.app.services.budget_service import BudgetService
from backend.app.services.destination_service import destination_service


def test_budget_calculation_deterministic():
    dests = destination_service.all_destinations[:2]
    budget_summary = BudgetService.calculate_budget(
        requested_budget=20000,
        duration_days=3,
        destinations=dests,
        experience_preference="balanced",
        transport_mode="cab_rental",
        estimated_total_km=400,
    )

    assert budget_summary.requested_budget == 20000
    assert budget_summary.estimated_total_cost > 0
    assert budget_summary.cost_breakdown.accommodation > 0
    assert budget_summary.cost_breakdown.food > 0
    assert budget_summary.cost_breakdown.transport > 0
    assert budget_summary.cost_breakdown.activities_entry >= 0
    assert budget_summary.cost_breakdown.contingency_reserve > 0

    expected_sum = (
        budget_summary.cost_breakdown.accommodation
        + budget_summary.cost_breakdown.food
        + budget_summary.cost_breakdown.transport
        + budget_summary.cost_breakdown.activities_entry
        + budget_summary.cost_breakdown.contingency_reserve
    )
    assert budget_summary.estimated_total_cost == expected_sum


def test_budget_exceeded_flag():
    dests = destination_service.all_destinations[:3]
    # Very small requested budget for 5 days with cab
    low_budget = 3000
    budget_summary = BudgetService.calculate_budget(
        requested_budget=low_budget,
        duration_days=5,
        destinations=dests,
        experience_preference="relaxed",
        transport_mode="cab_rental",
        estimated_total_km=800,
    )

    assert budget_summary.is_within_budget is False
    assert budget_summary.remaining_buffer < 0


def test_experience_multipliers_effect():
    dests = destination_service.all_destinations[:2]
    budget_budget = BudgetService.calculate_budget(
        requested_budget=20000,
        duration_days=3,
        destinations=dests,
        experience_preference="budget-friendly",
        transport_mode="public_bus",
        estimated_total_km=400,
    )

    budget_relaxed = BudgetService.calculate_budget(
        requested_budget=20000,
        duration_days=3,
        destinations=dests,
        experience_preference="relaxed",
        transport_mode="public_bus",
        estimated_total_km=400,
    )

    assert budget_budget.cost_breakdown.accommodation < budget_relaxed.cost_breakdown.accommodation
    assert budget_budget.cost_breakdown.food < budget_relaxed.cost_breakdown.food


def test_party_size_budget_scaling():
    dests = destination_service.all_destinations[:2]

    # Solo traveler
    solo = BudgetService.calculate_budget(
        requested_budget=20000,
        duration_days=3,
        destinations=dests,
        experience_preference="balanced",
        transport_mode="cab_rental",
        estimated_total_km=400,
        travelers_count=1,
    )

    # 4 travelers
    group4 = BudgetService.calculate_budget(
        requested_budget=60000,
        duration_days=3,
        destinations=dests,
        experience_preference="balanced",
        transport_mode="cab_rental",
        estimated_total_km=400,
        travelers_count=4,
    )

    assert solo.rooms_allocated == 1
    assert group4.rooms_allocated == 2
    # Food is 4x for 4 people
    assert group4.cost_breakdown.food == solo.cost_breakdown.food * 4
    # Entry fees are 4x for 4 people
    assert group4.cost_breakdown.activities_entry == solo.cost_breakdown.activities_entry * 4
    # Per person calculation is accurate
    assert group4.per_person_cost == int(round(group4.estimated_total_cost / 4))
    # Line items balance 100%
    expected_sum = (
        group4.cost_breakdown.accommodation
        + group4.cost_breakdown.food
        + group4.cost_breakdown.transport
        + group4.cost_breakdown.activities_entry
        + group4.cost_breakdown.contingency_reserve
    )
    assert group4.estimated_total_cost == expected_sum

