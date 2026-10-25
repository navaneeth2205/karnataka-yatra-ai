import pytest
from backend.app.services.destination_service import destination_service
from backend.app.services.dataset_loader import DatasetAdapter


def test_destinations_loaded():
    destinations = destination_service.all_destinations
    assert len(destinations) >= 10, "Expected at least 10 curated destinations"
    ids = [d.id for d in destinations]
    assert "hampi" in ids
    assert "mysuru" in ids
    assert "gokarna" in ids
    assert "coorg" in ids


def test_filter_by_interest():
    heritage_places = destination_service.search_destinations(interest="heritage")
    assert len(heritage_places) > 0
    for place in heritage_places:
        assert (
            "heritage" in [i.lower() for i in place.interests]
            or "heritage" in [t.lower() for t in place.tags]
        )


def test_filter_by_region():
    coastal_places = destination_service.search_destinations(region="coastal")
    assert len(coastal_places) > 0
    for place in coastal_places:
        assert place.region == "coastal"


def test_search_destinations():
    results = destination_service.search_destinations(search="temple")
    assert len(results) > 0
    for d in results:
        found = (
            "temple" in d.name.lower()
            or "temple" in d.short_description.lower()
            or any("temple" in t.lower() for t in d.tags)
        )
        assert found


def test_dataset_adapter_tolerance():
    # Test importing messy/flexible field names as will come from Adaption Labs
    raw_record = {
        "place_name": "Agumbe Rainforest",
        "zone": "western_ghats",
        "interest_types": "nature, adventure",
        "about": "Cherrapunji of the South with dense canopy and King Cobras.",
        "hotel_rate": 1800,
        "daily_meals_cost": 500,
        "geo_lat": 13.5074,
        "geo_lon": 75.0934,
    }
    normalized = DatasetAdapter.normalize_record(raw_record)
    assert normalized is not None
    assert normalized.name == "Agumbe Rainforest"
    assert normalized.region == "western_ghats"
    assert "nature" in normalized.interests
    assert normalized.estimated_stay_cost_per_night == 1800
    assert normalized.is_sample_or_estimated is True
