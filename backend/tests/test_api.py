import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "destinations_count" in data
    assert data["destinations_count"] >= 10


def test_get_destinations_endpoint():
    res = client.get("/api/v1/destinations")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "items" in data
    assert data["total"] > 0

    # Filtered
    res_heritage = client.get("/api/v1/destinations?interest=heritage")
    assert res_heritage.status_code == 200
    assert res_heritage.json()["total"] > 0


def test_plan_trip_endpoint():
    payload = {
        "starting_city": "Bengaluru",
        "duration_days": 3,
        "total_budget_inr": 18000,
        "interests": ["nature", "wildlife"],
        "experience_preference": "balanced",
        "transport_mode": "cab_rental",
        "preferred_language": "kannada",
    }
    res = client.post("/api/v1/trips/plan", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "trip_id" in data
    assert len(data["days"]) == 3
    assert data["budget"]["requested_budget"] == 18000
    assert len(data["route_summary"]["stops"]) >= 2


def test_validate_trip_endpoint():
    payload = {
        "starting_city": "Mysuru",
        "duration_days": 5,
        "total_budget_inr": 2000,  # Unrealistic low budget
        "interests": ["heritage"],
        "experience_preference": "relaxed",
        "transport_mode": "cab_rental",
        "preferred_language": "english",
    }
    res = client.post("/api/v1/trips/validate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["warnings"]) > 0
    assert data["minimum_recommended_budget"] > 2000


def test_revise_trip_endpoint():
    plan_payload = {
        "starting_city": "Bengaluru",
        "duration_days": 2,
        "total_budget_inr": 12000,
        "interests": ["food"],
        "experience_preference": "balanced",
        "transport_mode": "cab_rental",
        "preferred_language": "english",
    }
    plan_res = client.post("/api/v1/trips/plan", json=plan_payload)
    assert plan_res.status_code == 200
    current_trip = plan_res.json()

    revise_payload = {
        "current_trip": current_trip,
        "revision_instruction": "reduce budget significantly",
    }
    rev_res = client.post("/api/v1/trips/revise", json=revise_payload)
    assert rev_res.status_code == 200
    revised_data = rev_res.json()
    assert "Revised" in revised_data["title"]
    assert revised_data["budget"]["requested_budget"] < current_trip["budget"]["requested_budget"]


def test_weather_endpoint():
    res = client.get("/api/v1/weather/current?city=Bengaluru")
    assert res.status_code == 200
    data = res.json()
    assert data["city"] == "Bengaluru"
    assert "temperature_c" in data
    assert "condition_label" in data
    assert "is_rainy" in data
    assert "season" in data
    assert "advisory" in data


def test_plan_trip_includes_weather_and_season():
    payload = {
        "starting_city": "Bengaluru",
        "duration_days": 2,
        "total_budget_inr": 15000,
        "interests": ["nature", "heritage"],
        "experience_preference": "balanced",
        "transport_mode": "cab_rental",
        "preferred_language": "kannada",
    }
    res = client.post("/api/v1/trips/plan", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "weather_info" in data
    assert data["weather_info"]["city"] == "Bengaluru"
    assert "is_rain_adaptive" in data
    assert "travel_season" in data


def test_kannada_tts_endpoint():
    res = client.get("/api/v1/tts", params={"text": "ನಮಸ್ಕಾರ"})
    assert res.status_code == 200
    assert "audio/mpeg" in res.headers.get("content-type", "")
    assert len(res.content) > 1000

    # Test cache hit
    res_cached = client.get("/api/v1/tts", params={"text": "ನಮಸ್ಕಾರ"})
    assert res_cached.status_code == 200
    assert res_cached.content == res.content

    # Test empty text validation
    res_empty = client.get("/api/v1/tts", params={"text": "   "})
    assert res_empty.status_code == 400

