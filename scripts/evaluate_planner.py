import json
import os
import sys
import time

sys.path.append(os.getcwd())
sys.stdout.reconfigure(encoding="utf-8")

from backend.app.schemas.trip import TripPlanRequest
from backend.app.services.itinerary_service import itinerary_service
from backend.app.services.llm_provider import get_llm_provider

HELD_OUT_PATH = r"C:\Kannada_Travel_guide_AI\dataset\eval_held_out.json"

if not os.path.exists(HELD_OUT_PATH):
    print(f"Error: {HELD_OUT_PATH} not found.")
    sys.exit(1)

with open(HELD_OUT_PATH, "r", encoding="utf-8") as f:
    eval_cases = json.load(f)

print(f"Loaded {len(eval_cases)} held-out evaluation test cases.\n")

results = []
metrics = {
    "total_cases": len(eval_cases),
    "day_count_matches": 0,
    "budget_safety_passed": 0,
    "disclaimer_present": 0,
    "kannada_phrases_included": 0,
    "curated_hub_coordinate_resolved": 0,
    "fallback_origin_count": 0,
}

lang_map = {
    "kn": "kannada", "kannada": "kannada", "kannada (india)": "kannada",
    "hi": "hindi", "hindi": "hindi", "hindi (india)": "hindi",
    "ta": "tamil", "tamil": "tamil", "tamil (india)": "tamil",
    "te": "telugu", "telugu": "telugu", "telugu (india)": "telugu",
    "ml": "malayalam", "malayalam": "malayalam", "malayalam (india)": "malayalam",
    "en": "english", "english": "english", "english (india)": "english",
    "original": "english",
}

for idx, case in enumerate(eval_cases):
    case_id = case["row_id"]
    target_lang_raw = case["target_language"].lower()
    pref_lang = lang_map.get(target_lang_raw, "english")

    duration = case["requested_duration"] or 3
    # Cap duration to 14 days supported by schema
    duration = min(14, max(1, duration))
    budget = case["requested_budget_inr"] or 20000

    # Build request
    req = TripPlanRequest(
        starting_city="Bengaluru",
        duration_days=duration,
        total_budget_inr=budget,
        interests=["heritage", "nature"],
        experience_preference="balanced",
        transport_mode="cab_rental",
        preferred_language=pref_lang, # type: ignore
    )

    t0 = time.time()
    plan = itinerary_service.generate_plan(req)
    latency_ms = int((time.time() - t0) * 1000)

    # 1. Day count check
    day_match = (len(plan.days) == req.duration_days)
    if day_match:
        metrics["day_count_matches"] += 1

    # 2. Budget safety check (either within budget, or has explicit warning)
    budget_ok = plan.budget.is_within_budget or (len(plan.validation_warnings) > 0)
    if budget_ok:
        metrics["budget_safety_passed"] += 1

    # 3. Disclaimer present
    has_disc = bool(plan.budget.disclaimer)
    if has_disc:
        metrics["disclaimer_present"] += 1

    # 4. Phrasebook check
    has_phrases = len(plan.kannada_travel_phrases) >= 3
    if has_phrases:
        metrics["kannada_phrases_included"] += 1

    # 5. Route coordinate resolution check (offline matrix lookup, NOT live external geocoding)
    origin_is_fallback = plan.route_summary.stops[0].is_fallback_coordinate if plan.route_summary.stops else True
    has_curated_coords = plan.route_summary.total_distance_km > 0 and len(plan.route_summary.stops) >= 2
    if has_curated_coords:
        metrics["curated_hub_coordinate_resolved"] = metrics.get("curated_hub_coordinate_resolved", 0) + 1
    if origin_is_fallback:
        metrics["fallback_origin_count"] = metrics.get("fallback_origin_count", 0) + 1

    score = sum([day_match, budget_ok, has_disc, has_phrases, has_curated_coords]) / 5.0 * 100

    results.append({
        "case_id": case_id,
        "language": pref_lang,
        "duration_days": duration,
        "budget_inr": budget,
        "score_percent": score,
        "latency_ms": latency_ms,
        "day_match": day_match,
        "budget_safety": budget_ok,
        "warnings_count": len(plan.validation_warnings),
        "circuit": plan.route_summary.primary_circuit,
        "origin_fallback_used": origin_is_fallback,
    })

# Compute aggregate scores
avg_score = sum(r["score_percent"] for r in results) / len(results)
avg_latency = sum(r["latency_ms"] for r in results) / len(results)

print("=" * 65)
print("KARNATAKA YATRA AI - PLANNER BENCHMARK EVALUATION")
print("=" * 65)
print(f"Evaluation Test Cases Tested   : {metrics['total_cases']}")
print(f"Structural Compliance Score   : {avg_score:.1f}%")
print(f"Average Planning Latency      : {avg_latency:.1f} ms")
print(f"Day Count Precision Rate      : {metrics['day_count_matches']}/{metrics['total_cases']} ({metrics['day_count_matches']/metrics['total_cases']*100:.1f}%)")
print(f"Budget Safety Compliance      : {metrics['budget_safety_passed']}/{metrics['total_cases']} ({metrics['budget_safety_passed']/metrics['total_cases']*100:.1f}%)")
print(f"Disclaimer Presence Rate      : {metrics['disclaimer_present']}/{metrics['total_cases']} ({metrics['disclaimer_present']/metrics['total_cases']*100:.1f}%)")
print(f"Phrasebook Integration Rate   : {metrics['kannada_phrases_included']}/{metrics['total_cases']} ({metrics['kannada_phrases_included']/metrics['total_cases']*100:.1f}%)")
print(f"Curated Hub Resolution Rate   : {metrics.get('curated_hub_coordinate_resolved', 0)}/{metrics['total_cases']} (Offline Matrix; Live Geocoding API: NOT invoked)")
print(f"Origin Fallback Triggered     : {metrics.get('fallback_origin_count', 0)}/{metrics['total_cases']} cases")

# Save evaluation results
EVAL_RESULTS_PATH = r"C:\Kannada_Travel_guide_AI\dataset\eval_results.json"
with open(EVAL_RESULTS_PATH, "w", encoding="utf-8") as f:
    json.dump({
        "aggregate_metrics": metrics,
        "overall_quality_score": round(avg_score, 2),
        "average_latency_ms": round(avg_latency, 2),
        "case_results": results,
    }, f, ensure_ascii=False, indent=2)

print(f"\nSaved evaluation results to: {EVAL_RESULTS_PATH}")
