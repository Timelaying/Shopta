package com.shopta.analytics.model;

import java.time.Instant;

public record TripSummarySnapshot(
        long tripId,
        long userId,
        double totalDistanceKm,
        double totalDurationMinutes,
        int stopsVisited,
        double savingsAmount,
        Instant recordedAt
) {
}
