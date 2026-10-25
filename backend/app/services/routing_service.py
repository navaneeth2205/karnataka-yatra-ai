import math
from abc import ABC, abstractmethod
from typing import List, Dict, Tuple
from backend.app.schemas.destination import Destination
from backend.app.schemas.trip import RouteSummary, RouteStop


class BaseRoutingService(ABC):
    @abstractmethod
    def calculate_route(
        self,
        starting_city: str,
        destinations: List[Destination],
        transport_mode: str,
    ) -> RouteSummary:
        """Calculate route sequence, total distance, and stops."""
        pass


class EstimatedDistanceRoutingService(BaseRoutingService):
    """
    Computes realistic transit distances and times across Karnataka hubs
    using a curated coordinate matrix and realistic road curvature multipliers.
    Ready to swap with Google Maps or Mapbox routing.
    """

    # Coordinates for common Karnataka and regional transit hubs
    CITY_COORDINATES: Dict[str, Tuple[float, float]] = {
        "Bengaluru": (12.9716, 77.5946),
        "Bangalore": (12.9716, 77.5946),
        "Mysuru": (12.2958, 76.6394),
        "Mysore": (12.2958, 76.6394),
        "Mangaluru": (12.9141, 74.8560),
        "Mangalore": (12.9141, 74.8560),
        "Hubballi": (15.3647, 75.1240),
        "Hubli": (15.3647, 75.1240),
        "Dharwad": (15.4589, 75.0078),
        "Belagavi": (15.8497, 74.4977),
        "Belgaum": (15.8497, 74.4977),
        "Shivamogga": (13.9299, 75.5681),
        "Shimoga": (13.9299, 75.5681),
        "Kalaburagi": (17.3297, 76.8343),
        "Gulbarga": (17.3297, 76.8343),
        "Udupi": (13.3409, 74.7421),
        "Hassan": (13.0072, 76.1029),
        "Bidar": (17.9104, 77.5199),
        "Karwar": (14.8136, 74.1298),
        "Ballari": (15.1394, 76.9214),
        "Bellary": (15.1394, 76.9214),
        "Vijayapura": (16.8302, 75.7100),
        "Bijapur": (16.8302, 75.7100),
        "Chikmagalur": (13.3161, 75.7720),
        "Chikkamagaluru": (13.3161, 75.7720),
        "Madikeri": (12.4244, 75.7382),
        "Coorg": (12.4244, 75.7382),
        "Hampi": (15.3350, 76.4600),
        "Badami": (15.9189, 75.6768),
        "Gokarna": (14.5479, 74.3188),
        "Dandeli": (15.2417, 74.6292),
        # Common gateway feeder hubs
        "Kochi": (9.9312, 76.2673),
        "Cochin": (9.9312, 76.2673),
        "Pune": (18.5204, 73.8567),
        "Mumbai": (19.0760, 72.8777),
        "Hyderabad": (17.3850, 78.4867),
        "Chennai": (13.0827, 80.2707),
    }

    @staticmethod
    def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        r = 6371.0  # Earth radius in kilometers
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return r * c

    def get_starting_coords(self, starting_city: str) -> Tuple[float, float, bool]:
        """Returns (latitude, longitude, is_fallback_coordinate)."""
        clean = starting_city.strip().title()
        if clean in self.CITY_COORDINATES:
            lat, lon = self.CITY_COORDINATES[clean]
            return (lat, lon, False)
        # Default fallback to Bengaluru when starting city is outside catalog
        return (12.9716, 77.5946, True)

    def calculate_route(
        self,
        starting_city: str,
        destinations: List[Destination],
        transport_mode: str,
    ) -> RouteSummary:
        start_lat, start_lon, is_fallback = self.get_starting_coords(starting_city)

        stops: List[RouteStop] = [
            RouteStop(
                name=starting_city,
                region="origin",
                day_numbers=[1],
                latitude=start_lat,
                longitude=start_lon,
                is_fallback_coordinate=is_fallback,
            )
        ]

        total_km = 0.0
        prev_lat, prev_lon = start_lat, start_lon

        # Primary circuit identification
        regions = [d.region for d in destinations]
        primary_circuit = max(set(regions), key=regions.count) if regions else "karnataka_circuit"

        for idx, dest in enumerate(destinations, start=1):
            # Calculate distance with a 1.28x road curvature multiplier for Karnataka terrain
            straight_dist = self._haversine_km(prev_lat, prev_lon, dest.latitude, dest.longitude)
            road_dist = straight_dist * 1.28
            total_km += road_dist

            stops.append(
                RouteStop(
                    name=dest.name,
                    region=dest.region,
                    day_numbers=[idx],
                    latitude=dest.latitude,
                    longitude=dest.longitude,
                )
            )
            prev_lat, prev_lon = dest.latitude, dest.longitude

        # Return journey estimation back to starting city
        return_dist = self._haversine_km(prev_lat, prev_lon, start_lat, start_lon) * 1.28
        total_km += return_dist

        # Regional travel note
        circuit_notes = {
            "coastal": "Scenic coastal journey along NH-66 with coastal sea breezes. Allow buffer for ferry crossings near Udupi/Karwar.",
            "western_ghats": "Ghat roads feature scenic hairpin turns (Charmadi/Shiradi Ghats). Drive with care during monsoon season.",
            "heritage_circuit": "Spacious highways along NH-48 / NH-50 with vast Deccan countryside views.",
            "southern_karnataka": "Fast connectivity via Bengaluru-Mysuru Expressway with frequent wayside amenities.",
            "north_karnataka": "Arid black soil plateaus; early morning travel is recommended to avoid afternoon heat.",
        }
        note = circuit_notes.get(
            primary_circuit,
            "Plan travel legs during daylight hours for optimal scenic views and safety.",
        )

        return RouteSummary(
            total_distance_km=int(round(total_km)),
            primary_circuit=primary_circuit,
            transit_mode=transport_mode,
            stops=stops,
            regional_travel_note=note,
        )
