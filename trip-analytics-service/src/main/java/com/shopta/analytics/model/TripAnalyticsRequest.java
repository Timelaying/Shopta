package com.shopta.analytics.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record TripAnalyticsRequest(
        @NotNull @Min(1) Long tripId,
        @NotNull @Min(1) Long userId,
        @NotNull @Min(0) Double totalDistanceKm,
        @NotNull @Min(0) Double totalDurationMinutes,
        @NotNull @Min(0) Integer stopsVisited,
        Double savingsAmount
) {
}
