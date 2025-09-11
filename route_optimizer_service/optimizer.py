"""Route optimization utilities for the route optimizer service."""
from __future__ import annotations

import math
from typing import List, Optional, Tuple

try:  # Optional Google Maps integration
    import googlemaps  # type: ignore

    GMAPS_CLIENT: Optional[googlemaps.Client] = None
except Exception:  # pragma: no cover - library not installed
    googlemaps = None  # type: ignore
    GMAPS_CLIENT = None


def haversine(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """Return distance in kilometers between two (lat, lng) pairs."""
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    R = 6371.0  # Earth radius in kilometers
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def _ensure_client(api_key: Optional[str]) -> Optional[googlemaps.Client]:
    """Return a Google Maps client if possible."""
    global GMAPS_CLIENT
    if googlemaps is None or api_key is None:
        return None
    if GMAPS_CLIENT is None:
        GMAPS_CLIENT = googlemaps.Client(api_key=api_key)
    return GMAPS_CLIENT


def travel_time_minutes(
    origin: Tuple[float, float],
    destination: Tuple[float, float],
    traffic_multiplier: float = 1.0,
    api_key: Optional[str] = None,
) -> float:
    """Estimate travel time in minutes between two points.

    Uses Google Maps Directions API when an API key is provided and the
    ``googlemaps`` package is installed. Falls back to a simple haversine
    distance estimate assuming an average speed of 40 km/h.
    """
    client = _ensure_client(api_key)
    if client is not None:  # pragma: no branch - network dependent
        try:
            directions = client.directions(origin, destination)
            duration_seconds = directions[0]["legs"][0]["duration"]["value"]
            return (duration_seconds / 60.0) * traffic_multiplier
        except Exception:
            pass  # Fall back to haversine

    distance_km = haversine(origin, destination)
    avg_speed_kmh = 40.0
    return (distance_km / avg_speed_kmh) * 60.0 * traffic_multiplier


class Store:
    """Simple store data container."""

    def __init__(
        self,
        identifier: str,
        lat: float,
        lng: float,
        store_type: str,
        service_time: float,
        priority: int,
        traffic_multiplier: float = 1.0,
    ) -> None:
        self.identifier = identifier
        self.lat = lat
        self.lng = lng
        self.store_type = store_type
        self.service_time = service_time
        self.priority = priority
        self.traffic_multiplier = traffic_multiplier

    @property
    def location(self) -> Tuple[float, float]:
        return self.lat, self.lng


def optimize_route(
    start: Tuple[float, float], stores: List[Store], api_key: Optional[str] = None
) -> Tuple[List[Store], float]:
    """Greedy route optimization.

    Returns the ordered list of stores to visit and the total estimated
    travel and service time in minutes.
    """
    remaining = stores.copy()
    current = start
    route: List[Store] = []
    total_time = 0.0
    while remaining:
        def score(store: Store) -> float:
            travel = travel_time_minutes(current, store.location, store.traffic_multiplier, api_key)
            priority_penalty = store.priority * 5  # 5 minute penalty per priority level
            return travel + priority_penalty

        remaining.sort(key=score)
        next_store = remaining.pop(0)
        travel = travel_time_minutes(current, next_store.location, next_store.traffic_multiplier, api_key)
        total_time += travel + next_store.service_time
        route.append(next_store)
        current = next_store.location
    return route, total_time


__all__ = ["Store", "optimize_route", "travel_time_minutes", "haversine"]
