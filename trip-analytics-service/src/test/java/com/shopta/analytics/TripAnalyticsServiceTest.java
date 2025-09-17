package com.shopta.analytics;

import com.shopta.analytics.model.TripAnalyticsRequest;
import com.shopta.analytics.model.TripSummary;
import com.shopta.analytics.service.TripAnalyticsService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TripAnalyticsServiceTest {

    private final TripAnalyticsService service = new TripAnalyticsService();

    @AfterEach
    void tearDown() {
        service.clear();
    }

    @Test
    void summaryStartsEmpty() {
        TripSummary summary = service.getSummary();
        assertThat(summary.totalTrips()).isZero();
        assertThat(summary.averageDistanceKm()).isZero();
    }

    @Test
    void ingestUpdatesSummary() {
        TripAnalyticsRequest request = new TripAnalyticsRequest(1L, 2L, 12.5, 30.0, 3, 4.0);
        TripSummary summary = service.ingest(request);

        assertThat(summary.totalTrips()).isEqualTo(1);
        assertThat(summary.averageDistanceKm()).isEqualTo(12.5);
        assertThat(summary.recentTrips()).hasSize(1);
        assertThat(summary.recentTrips().get(0).tripId()).isEqualTo(1L);
    }
}
