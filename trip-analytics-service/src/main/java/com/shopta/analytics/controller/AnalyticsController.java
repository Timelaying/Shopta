package com.shopta.analytics.controller;

import com.shopta.analytics.model.TripAnalyticsRequest;
import com.shopta.analytics.model.TripSummary;
import com.shopta.analytics.service.TripAnalyticsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/analytics")
@CrossOrigin
public class AnalyticsController {

    private final TripAnalyticsService analyticsService;

    public AnalyticsController(TripAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public TripSummary getSummary() {
        return analyticsService.getSummary();
    }

    @PostMapping("/ingest")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public TripSummary ingest(@Valid @RequestBody TripAnalyticsRequest request) {
        return analyticsService.ingest(request);
    }
}
