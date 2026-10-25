import math
from typing import List, Optional, Dict
from backend.app.schemas.destination import Destination
from backend.app.services.dataset_loader import DatasetLoader
from backend.app.core.config import settings


class DestinationService:
    def __init__(self, data_path: Optional[str] = None):
        self.data_path = data_path or settings.DATA_PATH
        self._destinations: List[Destination] = []
        self.reload()

    def reload(self) -> None:
        self._destinations = DatasetLoader.load_from_json(self.data_path)

    @property
    def all_destinations(self) -> List[Destination]:
        return self._destinations

    def get_by_id(self, dest_id: str) -> Optional[Destination]:
        for d in self._destinations:
            if d.id == dest_id:
                return d
        return None

    def search_destinations(
        self,
        interest: Optional[str] = None,
        region: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Destination]:
        results = self._destinations

        if region:
            norm_region = region.strip().lower()
            results = [d for d in results if d.region.lower() == norm_region]

        if interest:
            norm_interest = interest.strip().lower()
            results = [
                d
                for d in results
                if norm_interest in [i.lower() for i in d.interests]
                or norm_interest in [t.lower() for t in d.tags]
            ]

        if search:
            query = search.strip().lower()
            results = [
                d
                for d in results
                if query in d.name.lower()
                or query in d.name_kannada.lower()
                or query in d.short_description.lower()
                or any(query in t.lower() for t in d.tags)
            ]

        return results

    def select_destinations_for_trip(
        self,
        starting_city: str,
        duration_days: int,
        interests: List[str],
        experience_preference: str,
    ) -> List[Destination]:
        """
        Sensible destination selection using interest affinity and regional clustering.
        Avoids scheduling too many far-flung destinations in a short trip.
        """
        if not self._destinations:
            return []

        # Determine how many distinct destinations can be realistically visited
        if duration_days <= 2:
            target_dest_count = 1
        elif duration_days <= 4:
            target_dest_count = 2
        elif duration_days <= 7:
            target_dest_count = min(3, len(self._destinations))
        else:
            target_dest_count = min(math.ceil(duration_days / 2.5), len(self._destinations))

        # Score destinations
        scored: List[tuple[float, Destination]] = []
        interest_set = {i.lower() for i in interests}

        # Preferred region affinity based on starting city
        origin_lower = starting_city.lower()
        preferred_regions = []
        if any(c in origin_lower for c in ["bengaluru", "bangalore", "mysuru", "mysore"]):
            preferred_regions = ["southern_karnataka", "western_ghats", "heritage_circuit"]
        elif any(c in origin_lower for c in ["mangaluru", "mangalore", "udupi"]):
            preferred_regions = ["coastal", "western_ghats"]
        elif any(c in origin_lower for c in ["hubballi", "hubli", "belagavi", "belgaum", "dharwad"]):
            preferred_regions = ["heritage_circuit", "coastal", "western_ghats"]
        else:
            preferred_regions = ["southern_karnataka", "heritage_circuit", "western_ghats", "coastal"]

        for dest in self._destinations:
            score = 0.0
            dest_interests = {i.lower() for i in dest.interests}
            dest_tags = {t.lower() for t in dest.tags}

            # Interest match score
            overlap = len(interest_set.intersection(dest_interests))
            tag_overlap = len(interest_set.intersection(dest_tags))
            score += overlap * 4.0 + tag_overlap * 2.0

            # Regional proximity score
            if dest.region in preferred_regions:
                rank = preferred_regions.index(dest.region)
                score += (len(preferred_regions) - rank) * 1.5

            # Experience pace match
            if experience_preference == "relaxed" and dest.region in ["coastal", "western_ghats"]:
                score += 2.0
            elif experience_preference == "adventurous" and any(
                tag in dest_tags for tag in ["trekking", "rafting", "safari", "bouldering"]
            ):
                score += 2.5
            elif experience_preference == "budget-friendly" and dest.estimated_stay_cost_per_night <= 1600:
                score += 2.0

            scored.append((score, dest))

        # Sort by highest score
        scored.sort(key=lambda x: x[0], reverse=True)

        # Primary anchor destination
        selected: List[Destination] = [scored[0][1]]
        primary_region = selected[0].region

        # For remaining destinations, prioritize destinations in the same or adjacent region
        # to ensure sensible regional clustering and avoid excessive backtracking
        remaining_candidates = [d for _, d in scored if d.id != selected[0].id]

        # Prioritize matching region first
        same_region = [d for d in remaining_candidates if d.region == primary_region]
        other_regions = [d for d in remaining_candidates if d.region != primary_region]

        pool = same_region + other_regions
        for candidate in pool:
            if len(selected) >= target_dest_count:
                break
            selected.append(candidate)

        return selected


# Singleton instance
destination_service = DestinationService()
