package com.shopta.analytics.model;

import java.util.List;

public record TripSummary(
        int totalTrips,
        double averageDistanceKm,
        double averageDurationMinutes,
        double averageStops,
        double averageSavings,
        List<TripSummarySnapshot> recentTrips
) {
}
