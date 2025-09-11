from ..optimizer import Store, optimize_route, haversine


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
