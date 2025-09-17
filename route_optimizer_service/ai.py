"""Heuristic AI assistant for shopping route suggestions."""
from __future__ import annotations

from collections import Counter
import random
from typing import Iterable, List, Optional, Sequence, Tuple

from .optimizer import Store, optimize_route, travel_time_minutes


def _score_route(
    start: Tuple[float, float],
    route: Sequence[Store],
    api_key: Optional[str] = None,
) -> Tuple[float, float, List[float]]:
    """Return a composite score, total time and per-leg travel times."""

    current = start
    travel_segments: List[float] = []
    total_time = 0.0
    store_switches = 0
    previous_type: Optional[str] = None

    for stop in route:
        travel = travel_time_minutes(current, stop.location, stop.traffic_multiplier, api_key)
        travel_segments.append(travel)
        total_time += travel + stop.service_time
        if previous_type is not None and previous_type != stop.store_type:
            store_switches += 1
        previous_type = stop.store_type
        current = stop.location

    priority_penalty = sum(max(stop.priority - 1, 0) * 2.0 for stop in route)
    switch_penalty = store_switches * 1.5
    score = total_time + priority_penalty + switch_penalty
    return score, total_time, travel_segments


def _random_swap(route: Sequence[Store], rng: random.Random) -> List[Store]:
    """Return a shallow copy of *route* with two stops swapped."""

    if len(route) < 2:
        return list(route)

    a, b = rng.sample(range(len(route)), 2)
    swapped = list(route)
    swapped[a], swapped[b] = swapped[b], swapped[a]
    return swapped


def _build_insights(
    route: Sequence[Store],
    travel_segments: Iterable[float],
    total_time: float,
) -> List[str]:
    """Generate human-friendly insights for the given route."""

    if not route:
        return []

    insights: List[str] = []
    top_priority = min(route, key=lambda stop: stop.priority)
    insights.append(
        (
            "Prioritizes stop "
            f"{top_priority.identifier} (priority {top_priority.priority}) to minimise delays."
        )
    )

    type_counts = Counter(stop.store_type for stop in route)
    if type_counts:
        most_common_type, count = type_counts.most_common(1)[0]
        if count > 1:
            insights.append(
                f"Clusters {count} {most_common_type} stops to reduce context switching on the trip."
            )

    travel_time = sum(travel_segments)
    service_time = sum(stop.service_time for stop in route)
    insights.append(
        (
            "Balances travel and in-store time: "
            f"~{travel_time:.1f} minutes on the road vs {service_time:.1f} minutes in stores."
        )
    )

    if total_time:
        avg_leg = travel_time / len(route)
        insights.append(
            f"Average travel per leg is approximately {avg_leg:.1f} minutes across {len(route)} stops."
        )

    return insights


def ai_suggest_route(
    start: Tuple[float, float],
    stores: List[Store],
    api_key: Optional[str] = None,
    *,
    iterations: int = 400,
    random_seed: Optional[int] = None,
) -> Tuple[List[Store], float, List[str], float]:
    """Return an AI-assisted route suggestion with narrative insights."""

    if not stores:
        return [], 0.0, [], 0.0

    if iterations < 1:
        raise ValueError("iterations must be positive")

    rng = random.Random(random_seed)

    # Start from the greedy baseline and improve with stochastic swaps.
    baseline_route, baseline_time = optimize_route(start, stores, api_key)
    best_route: Sequence[Store] = list(baseline_route)
    best_score, best_total_time, best_segments = _score_route(start, best_route, api_key)

    current_route: Sequence[Store] = list(best_route)
    current_score = best_score
    current_segments = list(best_segments)

    for _ in range(iterations):
        candidate = _random_swap(current_route, rng)
        candidate_score, candidate_total_time, candidate_segments = _score_route(
            start, candidate, api_key
        )

        acceptance_probability = 0.05 if candidate_score > current_score else 1.0
        if acceptance_probability == 1.0 or rng.random() < acceptance_probability:
            current_route = candidate
            current_score = candidate_score
            current_segments = candidate_segments

            if candidate_score < best_score:
                best_route = candidate
                best_score = candidate_score
                best_total_time = candidate_total_time
                best_segments = candidate_segments

    insights = _build_insights(best_route, best_segments, best_total_time)
    average_leg = sum(best_segments) / len(best_segments) if best_segments else 0.0
    return list(best_route), best_total_time, insights, average_leg


__all__ = ["ai_suggest_route"]
