import pytest
from unittest.mock import patch, MagicMock
from backend.app.services.llm_provider import (
    GeminiLLMProvider,
    DeterministicProvider,
    get_llm_provider,
    load_curated_few_shot_examples,
)
from backend.app.schemas.destination import Destination


def create_dummy_destinations():
    return [
        Destination(
            id="hampi",
            name="Hampi",
            name_kannada="ಹಂಪಿ",
            region="heritage_circuit",
            interests=["heritage"],
            short_description="Vijayanagara ruins",
            ideal_duration_days=2,
            estimated_stay_cost_per_night=1200,
            estimated_daily_food_cost=500,
            latitude=15.335,
            longitude=76.46,
            best_season="Oct-Mar",
            highlight_foods=["Jolada Rotti"],
            tags=["unesco"],
            sample_attractions=[],
            is_sample_or_estimated=True,
        )
    ]


def test_deterministic_provider_languages():
    provider = DeterministicProvider()
    dests = create_dummy_destinations()

    # Kannada
    res_kn = provider.generate_narrative(
        "Bengaluru", 3, ["heritage"], "balanced", dests, "kannada"
    )
    assert "ಕರ್ನಾಟಕ ಯಾತ್ರೆ" in res_kn["title"]
    assert res_kn["provider"] == "deterministic"

    # Hindi
    res_hi = provider.generate_narrative(
        "Bengaluru", 3, ["heritage"], "balanced", dests, "hindi"
    )
    assert "कर्नाटक यात्रा" in res_hi["title"]

    # English
    res_en = provider.generate_narrative(
        "Bengaluru", 3, ["heritage"], "balanced", dests, "english"
    )
    assert "Hampi" in res_en["title"]


def test_gemini_provider_missing_key_fallback():
    provider = GeminiLLMProvider(api_key="")
    dests = create_dummy_destinations()

    res = provider.generate_narrative(
        "Bengaluru", 3, ["heritage"], "balanced", dests, "kannada"
    )
    assert res["provider"] == "deterministic"
    assert "ಕರ್ನಾಟಕ ಯಾತ್ರೆ" in res["title"]


def test_gemini_provider_error_handling():
    provider = GeminiLLMProvider(api_key="dummy_test_key")
    dests = create_dummy_destinations()

    # Simulate network failure during Gemini API call
    with patch("httpx.Client.post", side_effect=Exception("Connection refused")):
        res = provider.generate_narrative(
            "Bengaluru", 3, ["heritage"], "balanced", dests, "kannada"
        )
        assert res["provider"] == "deterministic"
        assert "ಕರ್ನಾಟಕ ಯಾತ್ರೆ" in res["title"]


def test_get_llm_provider_default():
    provider = get_llm_provider()
    assert isinstance(provider, DeterministicProvider)
