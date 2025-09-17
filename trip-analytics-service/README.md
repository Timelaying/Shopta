# Trip Analytics Service

A Spring Boot microservice that provides aggregated analytics for Shopta trips.
It stores recent trip metrics in-memory and exposes endpoints for summaries and
new analytics submissions.

## Running locally

```bash
mvn spring-boot:run
```

By default the service listens on `http://localhost:8085`.

## API

- `GET /analytics/summary` – Returns average distance, duration, stop counts and
  a feed of the most recent trips submitted to the service.
- `POST /analytics/ingest` – Accepts a JSON payload with trip distance, duration
  and optional savings. The request updates the rolling analytics snapshot and
  returns the refreshed summary. Example:

```json
{
  "tripId": 42,
  "userId": 7,
  "totalDistanceKm": 18.4,
  "totalDurationMinutes": 52,
  "stopsVisited": 4,
  "savingsAmount": 6.5
}
```

The service keeps recent events in memory, making it easy to deploy alongside
other Shopta services without additional infrastructure.
