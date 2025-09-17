from ..optimizer import Store, optimize_route, haversine
from ..ai import ai_suggest_route


def test_haversine_zero_distance():
    assert haversine((0, 0), (0, 0)) == 0


def test_optimize_route_orders_by_distance_and_priority():
    stores = [
        Store("B", 0, 2, "grocery", service_time=5, priority=2),
        Store("A", 0, 1, "pharmacy", service_time=5, priority=1),
    ]
    ordered, total = optimize_route((0, 0), stores)
    assert [s.identifier for s in ordered] == ["A", "B"]
    assert total > 0


def test_ai_suggest_route_returns_insights_and_average_leg():
    stores = [
        Store("B", 0, 2, "grocery", service_time=5, priority=2),
        Store("A", 0, 1, "pharmacy", service_time=5, priority=1),
        Store("C", 0, 3, "bakery", service_time=4, priority=3),
    ]
    suggested, total, insights, average_leg = ai_suggest_route(
        (0, 0), stores, iterations=40, random_seed=42
    )
    assert sorted(store.identifier for store in suggested) == ["A", "B", "C"]
    assert total > 0
    assert average_leg >= 0
    assert insights, "Insights should be generated for AI suggestions"
