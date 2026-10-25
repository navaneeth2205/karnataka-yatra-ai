import json
import csv
import os
from typing import List, Dict, Any, Optional
from backend.app.schemas.destination import Destination, AttractionItem


class DatasetAdapter:
    """
    Flexible Adapter pattern to import and normalize datasets, including future
    datasets delivered by Adaption Labs, without making rigid schema assumptions.
    """

    @staticmethod
    def _find_field(record: Dict[str, Any], candidates: List[str], default: Any = None) -> Any:
        for candidate in candidates:
            if candidate in record and record[candidate] is not None:
                return record[candidate]
            # Try lowercased / stripped keys
            for key, val in record.items():
                if key.lower().replace(" ", "_") == candidate.lower().replace(" ", "_") and val is not None:
                    return val
        return default

    @classmethod
    def normalize_record(cls, raw: Dict[str, Any]) -> Optional[Destination]:
        try:
            dest_id = cls._find_field(raw, ["id", "destination_id", "slug", "code"], default="")
            name = cls._find_field(raw, ["name", "destination_name", "place_name", "title"], default="")
            if not name:
                return None
            if not dest_id:
                dest_id = name.lower().replace(" ", "_").replace("&", "and")

            name_kannada = cls._find_field(raw, ["name_kannada", "kannada_name", "kannada_title"], default="")
            region = cls._find_field(raw, ["region", "zone", "circuit", "area"], default="southern_karnataka")
            
            raw_interests = cls._find_field(raw, ["interests", "categories", "interest_types", "tags"], default=[])
            if isinstance(raw_interests, str):
                interests = [i.strip().lower() for i in raw_interests.split(",") if i.strip()]
            elif isinstance(raw_interests, list):
                interests = [str(i).strip().lower() for i in raw_interests]
            else:
                interests = []

            short_description = cls._find_field(
                raw,
                ["short_description", "description", "summary", "overview", "about"],
                default=f"Explore the wonders of {name}, Karnataka.",
            )

            ideal_duration_days = int(cls._find_field(raw, ["ideal_duration_days", "duration_days", "ideal_days"], default=2))
            stay_cost = int(cls._find_field(raw, ["estimated_stay_cost_per_night", "stay_cost", "hotel_rate", "avg_hotel_cost"], default=1500))
            food_cost = int(cls._find_field(raw, ["estimated_daily_food_cost", "food_cost", "daily_meals_cost"], default=600))

            lat = float(cls._find_field(raw, ["latitude", "lat", "geo_lat"], default=12.9716))
            lon = float(cls._find_field(raw, ["longitude", "lon", "lng", "geo_lon"], default=77.5946))
            best_season = cls._find_field(raw, ["best_season", "season", "best_time_to_visit"], default="October to March")

            raw_foods = cls._find_field(raw, ["highlight_foods", "famous_food", "local_cuisine", "foods"], default=[])
            if isinstance(raw_foods, str):
                highlight_foods = [f.strip() for f in raw_foods.split(",") if f.strip()]
            elif isinstance(raw_foods, list):
                highlight_foods = [str(f).strip() for f in raw_foods]
            else:
                highlight_foods = []

            raw_tags = cls._find_field(raw, ["tags", "keywords"], default=[])
            if isinstance(raw_tags, str):
                tags = [t.strip().lower() for t in raw_tags.split(",") if t.strip()]
            elif isinstance(raw_tags, list):
                tags = [str(t).strip().lower() for t in raw_tags]
            else:
                tags = []

            # Attractions mapping
            raw_attractions = cls._find_field(raw, ["sample_attractions", "attractions", "places_to_visit", "spots"], default=[])
            attraction_items: List[AttractionItem] = []
            if isinstance(raw_attractions, list):
                for att in raw_attractions:
                    if isinstance(att, dict):
                        att_title = cls._find_field(att, ["title", "name", "spot_name"], default=f"Visit {name}")
                        att_desc = cls._find_field(att, ["description", "details"], default="")
                        att_fee = int(cls._find_field(att, ["estimated_entry_fee_inr", "entry_fee", "ticket_price", "cost"], default=0))
                        att_hours = float(cls._find_field(att, ["estimated_time_hours", "hours", "duration_hours"], default=2.0))
                        att_category = cls._find_field(att, ["category", "type"], default="sightseeing")
                        attraction_items.append(
                            AttractionItem(
                                title=att_title,
                                description=att_desc,
                                estimated_entry_fee_inr=att_fee,
                                estimated_time_hours=att_hours,
                                category=att_category,
                                is_estimate=True,
                            )
                        )

            return Destination(
                id=dest_id,
                name=name,
                name_kannada=name_kannada,
                region=region,
                interests=interests,
                short_description=short_description,
                ideal_duration_days=ideal_duration_days,
                estimated_stay_cost_per_night=stay_cost,
                estimated_daily_food_cost=food_cost,
                latitude=lat,
                longitude=lon,
                best_season=best_season,
                highlight_foods=highlight_foods,
                tags=tags,
                sample_attractions=attraction_items,
                is_sample_or_estimated=True,
            )
        except Exception:
            return None


class DatasetLoader:
    """
    Loads destination data from JSON or CSV files using the adapter pattern.
    """

    @classmethod
    def load_from_json(cls, file_path: str) -> List[Destination]:
        if not os.path.exists(file_path):
            return []
        with open(file_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)

        destinations: List[Destination] = []
        if isinstance(raw_data, list):
            for item in raw_data:
                dest = DatasetAdapter.normalize_record(item)
                if dest:
                    destinations.append(dest)
        elif isinstance(raw_data, dict):
            # If wrapped in a dictionary key like 'destinations' or 'data'
            items = raw_data.get("destinations") or raw_data.get("data") or raw_data.get("items") or []
            for item in items:
                dest = DatasetAdapter.normalize_record(item)
                if dest:
                    destinations.append(dest)
        return destinations

    @classmethod
    def load_from_csv(cls, file_path: str) -> List[Destination]:
        if not os.path.exists(file_path):
            return []
        destinations: List[Destination] = []
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                dest = DatasetAdapter.normalize_record(row)
                if dest:
                    destinations.append(dest)
        return destinations
