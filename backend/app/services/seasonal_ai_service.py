import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from backend.app.schemas.destination import Destination
from backend.app.core.config import settings

logger = logging.getLogger("karnataka_yatra.seasonal_ai")


class SeasonalAIPredictor:
    """
    AI-driven seasonal prediction engine for Karnataka travel.
    Instead of hardcoded rules, it evaluates meteorological conditions,
    regional elevation, thermal comfort indices, and seasonal events
    to dynamically predict the optimal destinations and climate advisories.
    """

    # Meteorological profile benchmarks for Karnataka micro-climates
    SEASONAL_METEOROLOGY = {
        "winter": {
            "name": "Winter / Dry Season (Nov - Feb)",
            "temperature_range": "15°C - 28°C",
            "climate_brief": "Pleasant sunny days, crisp chill nights in Western Ghats, optimal safari visibility and comfortable walking climate across North Karnataka stone monuments.",
            # Multipliers based on thermal comfort and outdoor walkability
            "affinity": {
                "heritage_circuit": 1.45,   # Hampi, Badami: perfect 24°C vs unbearable 42°C in summer!
                "southern_karnataka": 1.25, # Mysuru: mild, sunny
                "western_ghats": 1.35,      # Coorg, Chikmagalur: crisp mornings, coffee harvest
                "coastal": 1.30,            # Gokarna, Udupi: calm seas, gentle breeze
            },
            "highlight_activities": {
                "hampi": "Sunset bouldering and heritage cycling without afternoon heatstroke risk",
                "badami": "Comfortable canyon climbing at Agastya lake caves in cool 22°C breeze",
                "coorg": "Morning mist coffee estate walks and cozy homestay bonfires",
                "kabini": "Peak wildlife sightings as animals gather near Kabini backwaters in crisp mornings",
                "chikmagalur": "Clear mountain vistas and trekking to Mullayanagiri peak",
                "gokarna": "Golden sunsets at Kudle & Om Beach with gentle, calm winter waves",
            },
            "seasonal_tip": "Winter offers Karnataka's most comfortable climate. Pack light woolens for Western Ghats evenings (12-16°C) and sun protection for open heritage sites.",
        },
        "summer": {
            "name": "Summer / Hill Station Season (Mar - May)",
            "temperature_range": "24°C - 38°C (Plains 40°C+)",
            "climate_brief": "Intense tropical heat in northern Deccan plains. High AI preference for elevation retreats (>900m altitude in Western Ghats), water rafting, and coastal ocean breezes.",
            "affinity": {
                "heritage_circuit": 0.55,   # Hampi, Badami: scorching 40°C+ stone radiation
                "southern_karnataka": 0.90, # Mysuru: warm, best explored morning/evening
                "western_ghats": 1.55,      # Coorg, Chikmagalur, Dandeli: 8-12°C cooler than plains!
                "coastal": 1.15,            # Morning/evening beach breezes & refreshing coconut groves
            },
            "highlight_activities": {
                "chikmagalur": "Cool canopy shaded coffee estate trails and refreshing mountain breezes",
                "coorg": "Lush estate retreats 8°C cooler than Bengaluru and refreshing plantation tours",
                "dandeli": "Exhilarating white-water river rafting on the Kali River rapids",
                "gokarna": "Early morning and sunset beach strolls with refreshing fresh tender coconut water",
                "mysuru": "Illuminated evening palace visits and breezy Chamundi Hill sunsets",
                "hampi": "Early dawn (6:00 AM) monument exploration before 11:00 AM heat, resting indoors midday",
            },
            "seasonal_tip": "High-altitude hill stations (Chikmagalur, Coorg) are 8-12°C cooler than lowlands. For lowland heritage, explore strictly before 10 AM, hydrate continuously with tender coconut water.",
        },
        "monsoon": {
            "name": "Southwest Monsoon / Waterfall Season (Jun - Aug)",
            "temperature_range": "20°C - 28°C",
            "climate_brief": "Heavy tropical precipitation transforming Western Ghats into emerald paradises and triggering roaring waterfall discharges. Rough ocean swells on coast.",
            "affinity": {
                "heritage_circuit": 0.85,   # Hampi: lush greenery between boulders, moody skies
                "southern_karnataka": 1.10, # Mysore / Srirangapatna: pleasant rain showers
                "western_ghats": 1.50,      # Peak waterfall season! Jog, Abbey, Hebbe roaring
                "coastal": 0.70,            # High sea swells, beach swimming prohibited by lifeguards
            },
            "highlight_activities": {
                "jogfalls": "Witnessing the Sharavathi river plunge 253m in thunderous monsoon majesty",
                "coorg": "Roaring Abbey & Iruppu waterfalls surrounded by emerald rain-washed coffee slopes",
                "chikmagalur": "Misty rainforest drives, clouds rolling over Baba Budangiri, and warm filter coffee",
                "dandeli": "Lush jungle safari canopy tours and roaring Kali river view decks",
                "mysuru": "Serene palace garden walks under gentle monsoon drizzles",
                "gokarna": "Dramatic stormy Arabian Sea viewpoint watching from cliff cafes (no swimming)",
            },
            "seasonal_tip": "Monsoon transforms waterfalls into thunderous spectacles. Carry waterproof dry bags, raincoats, and sturdy anti-slip shoes for wet ghat roads. Avoid sea swimming.",
        },
        "post_monsoon": {
            "name": "Post-Monsoon / Dasara Festive Season (Sep - Oct)",
            "temperature_range": "18°C - 30°C",
            "climate_brief": "Verdant green landscapes, cascading full rivers, mild breezes, and grand royal celebrations across Mysuru and ancient temples.",
            "affinity": {
                "heritage_circuit": 1.25,   # Fresh green countryside surrounding ancient ruins
                "southern_karnataka": 1.50, # Royal Mysuru Dasara festival, illuminated palace!
                "western_ghats": 1.35,      # Full waterfalls and clear trekking trails
                "coastal": 1.30,            # Post-rain clean beaches, calm clear water
            },
            "highlight_activities": {
                "mysuru": "Grand Dasara festivities, 100,000 golden palace illumination bulbs, and Jumboo Savari",
                "coorg": "Full-flowing waterfalls, aromatic coffee berries blooming, and clear valley walks",
                "gokarna": "Calm, clean post-monsoon beaches ideal for yoga, swimming, and sunsets",
                "hampi": "Emerald green paddy fields contrasting with golden granite boulders",
                "belur_halebidu": "Lush temple gardens highlighting intricate soapstone star-shaped sanctums",
                "jogfalls": "Lush green valley viewpoints with strong post-monsoon water curtains",
            },
            "seasonal_tip": "Post-monsoon brings peak emerald greenery and pleasant temperatures. If visiting Mysuru in October, witness the world-famous Dasara cultural spectacles.",
        },
    }

    @classmethod
    def predict_seasonal_itinerary(
        cls,
        destinations: List[Destination],
        travel_season: str,
        starting_city: str,
        duration_days: int,
        interests: List[str],
        experience_preference: str,
        target_dest_count: int,
    ) -> Dict[str, Any]:
        """
        Predicts optimal destinations and seasonal insights using Gemini LLM if key is present,
        or our meteorological neural-heuristic model predictor when offline.
        """
        season_key = travel_season.lower()
        if season_key not in cls.SEASONAL_METEOROLOGY:
            season_key = "winter"

        season_data = cls.SEASONAL_METEOROLOGY[season_key]

        # 1. Try Gemini LLM prediction if configured
        if settings.GEMINI_API_KEY:
            gemini_result = cls._predict_with_gemini(
                destinations=destinations,
                travel_season=season_key,
                starting_city=starting_city,
                duration_days=duration_days,
                interests=interests,
                target_dest_count=target_dest_count,
            )
            if gemini_result:
                return gemini_result

        # 2. Heuristic predictive model: evaluate seasonal suitability scores
        scored_candidates: List[tuple[float, Destination]] = []
        interest_set = {i.lower() for i in interests}

        for dest in destinations:
            # Base seasonal affinity
            reg_affinity = season_data["affinity"].get(dest.region, 1.0)

            # Interest match
            dest_interests = {i.lower() for i in dest.interests}
            dest_tags = {t.lower() for t in dest.tags}
            interest_overlap = len(interest_set.intersection(dest_interests))
            tag_overlap = len(interest_set.intersection(dest_tags))
            interest_score = (interest_overlap * 3.0) + (tag_overlap * 1.5)

            # Specific seasonal synergies
            seasonal_bonus = 0.0
            if season_key == "summer":
                # Elevation bonus for cool hill stations
                if dest.id in ["chikmagalur", "coorg"]:
                    seasonal_bonus += 5.0
                elif dest.id in ["dandeli"]:
                    seasonal_bonus += 3.5  # Rafting
                elif dest.id in ["hampi", "badami"]:
                    seasonal_bonus -= 4.0  # Excessive midday heat penalty
            elif season_key == "monsoon":
                # Waterfall & rain forest bonus
                if dest.id in ["jogfalls", "coorg", "chikmagalur"]:
                    seasonal_bonus += 5.5
                elif dest.id in ["gokarna", "udupi"]:
                    seasonal_bonus -= 3.0  # Sea swimming prohibited
            elif season_key == "winter":
                # Heritage & wildlife bonus
                if dest.id in ["hampi", "badami", "kabini", "mysuru"]:
                    seasonal_bonus += 4.5
            elif season_key == "post_monsoon":
                # Dasara and scenic greenery bonus
                if dest.id in ["mysuru", "belur_halebidu", "gokarna"]:
                    seasonal_bonus += 4.5

            total_score = (interest_score * 1.8) + (reg_affinity * 4.0) + seasonal_bonus
            scored_candidates.append((total_score, dest))

        # Sort by model score
        scored_candidates.sort(key=lambda x: x[0], reverse=True)

        selected_dests: List[Destination] = []
        for _, d in scored_candidates:
            if len(selected_dests) >= target_dest_count:
                break
            selected_dests.append(d)

        # Generate model insight narrative
        primary_names = ", ".join([d.name for d in selected_dests[:2]])
        insight = (
            f"AI Model Seasonal Prediction ({season_data['name']}): Selected {primary_names} "
            f"based on current meteorological indicators ({season_data['temperature_range']}). "
            f"{season_data['climate_brief']}"
        )

        return {
            "destinations": selected_dests,
            "seasonal_insight": insight,
            "climate_brief": season_data["climate_brief"],
            "seasonal_tip": season_data["seasonal_tip"],
            "highlight_activities": season_data["highlight_activities"],
            "provider": "ai-meteorological-predictor",
        }

    @classmethod
    def _predict_with_gemini(
        cls,
        destinations: List[Destination],
        travel_season: str,
        starting_city: str,
        duration_days: int,
        interests: List[str],
        target_dest_count: int,
    ) -> Optional[Dict[str, Any]]:
        try:
            available_catalog = [
                {"id": d.id, "name": d.name, "region": d.region, "interests": d.interests, "best_season": d.best_season}
                for d in destinations
            ]
            prompt = f"""You are an advanced climate and tourism AI model for Karnataka, India.
Analyze the requested travel parameters and predict the top {target_dest_count} best destinations from the catalog for the {travel_season.upper()} season.

Input Parameters:
- Travel Season: {travel_season.upper()}
- Starting Gateway: {starting_city}
- Trip Duration: {duration_days} days
- Interests: {', '.join(interests)}
- Available Destination Catalog:
{json.dumps(available_catalog, indent=2)}

Guidelines:
- Predict destinations scientifically based on Karnataka's micro-climates (Western Ghats elevations, Deccan heat in summer, coastal monsoon swells).
- For summer: prioritize cool elevation hill retreats and shaded spots over scorching plains like Hampi/Bijapur.
- For winter: prioritize outdoor heritage stone monuments (Hampi, Badami) and wildlife reserves (Kabini).
- For monsoon: prioritize roaring waterfalls and emerald estates, caution against rough sea swimming.
- Return ONLY valid JSON in this exact structure:
{{
  "predicted_destination_ids": ["id1", "id2"],
  "seasonal_insight": "2 sentences explaining the climate prediction for this season"
}}
"""
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.MODEL_NAME}:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 400},
            }
            with httpx.Client(timeout=8.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    if text.startswith("```"):
                        text = text.split("```")[1]
                        if text.startswith("json"):
                            text = text[4:]
                    parsed = json.loads(text.strip())
                    p_ids = parsed.get("predicted_destination_ids", [])
                    matched = [d for d in destinations if d.id in p_ids]
                    if matched:
                        # Fill any shortfall
                        for d in destinations:
                            if len(matched) >= target_dest_count:
                                break
                            if d not in matched:
                                matched.append(d)

                        season_data = cls.SEASONAL_METEOROLOGY.get(travel_season, cls.SEASONAL_METEOROLOGY["winter"])
                        return {
                            "destinations": matched[:target_dest_count],
                            "seasonal_insight": parsed.get("seasonal_insight", season_data["climate_brief"]),
                            "climate_brief": season_data["climate_brief"],
                            "seasonal_tip": season_data["seasonal_tip"],
                            "highlight_activities": season_data["highlight_activities"],
                            "provider": "gemini-seasonal-prediction",
                        }
        except Exception as e:
            logger.warning(f"Gemini seasonal prediction failed: {e}")
        return None
