package com.shopta.analytics.service;

import com.shopta.analytics.model.TripAnalyticsRequest;
import com.shopta.analytics.model.TripSummary;
import com.shopta.analytics.model.TripSummarySnapshot;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class TripAnalyticsService {

    private final CopyOnWriteArrayList<TripSummarySnapshot> events = new CopyOnWriteArrayList<>();

    public TripSummary getSummary() {
        int totalTrips = events.size();
        double averageDistance = totalTrips == 0 ? 0.0 : events.stream()
                .mapToDouble(TripSummarySnapshot::totalDistanceKm)
                .average()
                .orElse(0.0);

        double averageDuration = totalTrips == 0 ? 0.0 : events.stream()
                .mapToDouble(TripSummarySnapshot::totalDurationMinutes)
                .average()
                .orElse(0.0);

        double averageStops = totalTrips == 0 ? 0.0 : events.stream()
                .mapToDouble(TripSummarySnapshot::stopsVisited)
                .average()
                .orElse(0.0);

        double averageSavings = totalTrips == 0 ? 0.0 : events.stream()
                .mapToDouble(TripSummarySnapshot::savingsAmount)
                .average()
                .orElse(0.0);

        List<TripSummarySnapshot> recentTrips = events.stream()
                .sorted(Comparator.comparing(TripSummarySnapshot::recordedAt).reversed())
                .limit(10)
                .toList();

        return new TripSummary(totalTrips, averageDistance, averageDuration, averageStops, averageSavings, recentTrips);
    }

    public TripSummary ingest(TripAnalyticsRequest request) {
        double savings = request.savingsAmount() == null ? 0.0 : request.savingsAmount();
        TripSummarySnapshot snapshot = new TripSummarySnapshot(
                request.tripId(),
                request.userId(),
                request.totalDistanceKm(),
                request.totalDurationMinutes(),
                request.stopsVisited(),
                savings,
                Instant.now()
        );
        events.add(snapshot);
        return getSummary();
    }

    public void clear() {
        events.clear();
    }
}
